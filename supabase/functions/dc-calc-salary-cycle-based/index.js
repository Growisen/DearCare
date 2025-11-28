import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js";
import { addDays, parseISO, format, isAfter } from "https://esm.sh/date-fns@2.30.0";
import { utcToZonedTime } from "https://esm.sh/date-fns-tz@2.0.0?deps=date-fns@2.30.0";

const CYCLE_LENGTH = 28;
const TIMEZONE = "Asia/Kolkata";

const getTodayIST = () => {
  const now = new Date();
  const zoned = utcToZonedTime(now, TIMEZONE);
  return format(zoned, "yyyy-MM-dd");
};

const parseHours = (hrs) => {
  if (!hrs) return 0;
  const [h, m = 0] = hrs.split(":").map(Number);
  return h + (m / 60);
};

const calculateShiftDuration = (start, end) => {
  if (!start || !end) return 0;
  const s = parseHours(start);
  const e = parseHours(end);
  let diff = e - s;
  if (diff < 0) diff += 24;
  return diff;
};

const getDatesInRange = (startStr, endStr) => {
  const dates = [];
  let curr = parseISO(startStr);
  const end = parseISO(endStr);
  while (!isAfter(curr, end)) {
    dates.push(format(curr, 'yyyy-MM-dd'));
    curr = addDays(curr, 1);
  }
  return dates;
};

Deno.serve(async () => {
  const logData = {
    run_date: new Date().toISOString(),
    status: "processing",
    processed_nurses: 0,
    calculated_records: 0,
    errors: [],
  };

  try {
    const supabase = createClient(
      Deno.env.get("NEXT_PUBLIC_SUPABASE_URL"),
      Deno.env.get("SERVICE_KEY")
    );

    const todayStr = getTodayIST();

    const { data: assignments, error: aErr } = await supabase
      .from("nurse_client")
      .select(`
        id, nurse_id, start_date, end_date, salary_per_day,
        shift_start_time, shift_end_time,
        nurse:nurse_id!inner(first_name, last_name, admitted_type)
      `)
      .eq("nurse.admitted_type", "Dearcare_Llp")
      .not("start_date", "is", null)
      .not("salary_per_day", "is", null);

    if (aErr) throw new Error(aErr.message);
    if (!assignments?.length) return jsonResponse({ message: "No active assignments found" });

    const nurseIds = assignments.map((a) => a.nurse_id);

    const { data: paymentHistory, error: pErr } = await supabase
      .from("salary_payments")
      .select("nurse_id, pay_period_end")
      .in("nurse_id", nurseIds)
      .order("pay_period_end", { ascending: false });

    if (pErr) throw new Error(pErr.message);

    const lastPayMap = new Map();
    paymentHistory?.forEach((p) => {
      if (!lastPayMap.has(p.nurse_id)) {
        lastPayMap.set(p.nurse_id, p.pay_period_end);
      }
    });

    const salaryRows = [];

    for (const assignment of assignments) {
      try {
        const lastPayEnd = lastPayMap.get(assignment.nurse_id) || null;

        let cycleStart = assignment.start_date;

        if (lastPayEnd) {
          const dayAfterLastPay = addDays(parseISO(lastPayEnd), 1);
          const assignStartObj = parseISO(assignment.start_date);

          if (isAfter(dayAfterLastPay, assignStartObj)) {
            cycleStart = format(dayAfterLastPay, "yyyy-MM-dd");
          }
        }

        if (isAfter(parseISO(cycleStart), parseISO(todayStr))) continue;

        let cycleEnd = format(addDays(parseISO(cycleStart), CYCLE_LENGTH - 1), "yyyy-MM-dd");

        if (assignment.end_date && isAfter(parseISO(cycleEnd), parseISO(assignment.end_date))) {
          cycleEnd = assignment.end_date;
        }

        const cycleFinished = !isAfter(parseISO(cycleEnd), parseISO(todayStr));
        const alreadyPaid = lastPayEnd ? !isAfter(parseISO(cycleEnd), parseISO(lastPayEnd)) : false;

        if (!cycleFinished || alreadyPaid) {
          continue;
        }

        const { data: attendance, error: attErr } = await supabase
          .from("attendence_individual")
          .select("date, start_time, end_time")
          .eq("assigned_id", assignment.id)
          .gte("date", cycleStart)
          .lte("date", cycleEnd);

        if (attErr) {
          logData.errors.push(`Attendance Error [Nurse ${assignment.nurse_id}]: ${attErr.message}`);
          continue;
        }

        const stdShiftDuration = calculateShiftDuration(assignment.shift_start_time, assignment.shift_end_time);
        if (stdShiftDuration <= 0) {
          logData.errors.push(`Invalid Shift Config [Assign ${assignment.id}]`);
          continue;
        }

        const hourlyRate = assignment.salary_per_day / stdShiftDuration;

        let totalBillableHours = 0;
        let daysWorked = 0;
        
        const presentDates = new Set();
        const errorDates = [];
        const zeroHourDates = [];

        const safeAttendance = attendance || [];

        for (const record of safeAttendance) {
          presentDates.add(record.date);

          if (!record.start_time || !record.end_time) {
            errorDates.push(record.date);
            continue;
          }

          const workedHrs = calculateShiftDuration(record.start_time, record.end_time);
          if (workedHrs <= 0) {
            zeroHourDates.push(record.date);
            continue;
          }

          const billable = Math.min(workedHrs, stdShiftDuration);

          totalBillableHours += billable;
          daysWorked++;
        }

        const allCycleDates = getDatesInRange(cycleStart, cycleEnd);
        const absentDatesRaw = allCycleDates.filter(d => !presentDates.has(d));

        if (totalBillableHours <= 0) continue;

        logData.processed_nurses++;

        const grossSalaryRaw = totalBillableHours * hourlyRate;
        const finalHours = Math.ceil(totalBillableHours);
        const finalSalary = Math.ceil(grossSalaryRaw);

        const infoParts = [];
        infoParts.push(`✅ Worked: ${daysWorked} days (${finalHours} hrs)`);
        infoParts.push(`💰 Calc: ${finalHours}hr x ₹${hourlyRate.toFixed(2)}`);

        if (absentDatesRaw.length > 0) {
          const formattedDates = absentDatesRaw.map(d => format(parseISO(d), "dd/MM/yyyy"));
          const dateStr = formattedDates.length > 5 
            ? `[${formattedDates.slice(0, 5).join(", ")} +${formattedDates.length - 5} more]` 
            : `[${formattedDates.join(", ")}]`;
          infoParts.push(`❌ Absent: ${absentDatesRaw.length} ${dateStr}`);
        }

        if (errorDates.length > 0) infoParts.push(`⚠️ Missing Time: ${errorDates.length}`);
        if (zeroHourDates.length > 0) infoParts.push(`⚠️ Zero-Hr: ${zeroHourDates.length}`);

        const infoStr = infoParts.join(" | ");

        salaryRows.push({
          nurse_id: assignment.nurse_id,
          pay_period_start: cycleStart,
          pay_period_end: cycleEnd,
          days_worked: daysWorked,
          hours_worked: finalHours,
          salary: finalSalary,
          net_salary: finalSalary,
          payment_status: "pending",
          info: infoStr,
          reviewed: false,
        });

      } catch (loopErr) {
        logData.errors.push(`Loop Crash [Nurse ${assignment.nurse_id}]: ${String(loopErr)}`);
      }
    }

    if (salaryRows.length > 0) {
      const { error: insErr } = await supabase.from("salary_payments").insert(salaryRows);
      if (insErr) throw insErr;
      logData.calculated_records = salaryRows.length;

      await supabase.from("dearcare_salary_calculation_runs").insert({
        execution_status: "success",
        total_salary_records_inserted: logData.calculated_records,
        total_nurses_calculated: logData.processed_nurses,
        run_date: logData.run_date,
      });
    }

    return jsonResponse({ success: true, ...logData, generated_rows: salaryRows });

  } catch (err) {
    return jsonResponse({ success: false, error: err.message || String(err) }, 500);
  }
});

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}