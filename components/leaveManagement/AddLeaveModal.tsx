import React, { useState, useEffect, useRef } from "react";
import { X, User } from "lucide-react";

import { fetchNurseNamesForOrg } from "@/app/actions/staff-management/add-nurse";
import { createLeaveRequestByAdmin } from "@/app/actions/staff-management/leave-management";

type Nurse = {
  nurse_id: number;
  full_name: string;
  nurse_reg_no: string;
};

type AddLeaveModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddLeave: () => void;
};

export default function AddLeaveModal({
  isOpen,
  onClose,
  onAddLeave,
}: AddLeaveModalProps) {
  const [search, setSearch] = useState("");
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);
  const [leaveType, setLeaveType] = useState("");
  const [leaveMode, setLeaveMode] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const todayStr = new Date().toISOString().split("T")[0];

  const fetchNurses = async (term: string) => {
    setLoading(true);
    try {
      const { data } = await fetchNurseNamesForOrg(term);
      if (data) {
        setNurses(
          data.map((n) => ({
            nurse_id: n.nurse_id,
            full_name: n.full_name,
            nurse_reg_no: n.nurse_reg_no,
          }))
        );
      } else {
        setNurses([]);
      }
    } catch {
      setNurses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (search.trim() === "") {
      setNurses([]);
      setLoading(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      fetchNurses(search);
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search]);

  useEffect(() => {
    if (formErrors.length > 0) {
      const timer = setTimeout(() => {
        setFormErrors([]);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [formErrors]);

  const handleCancel = () => {
    setSelectedNurse(null);
    setLeaveType("");
    setLeaveMode("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setSearch("");
    setNurses([]);
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!selectedNurse) errors.push("Please select a nurse.");
    if (!leaveType) errors.push("Please select leave type.");
    if (!leaveMode) errors.push("Please select leave mode.");
    if (!startDate) errors.push("Please select start date.");
    if (!endDate) errors.push("Please select end date.");
    if (!reason) errors.push("Please enter a reason.");
    if (startDate && endDate && startDate > endDate)
      errors.push("Start date cannot be after end date.");
    if ((startDate && startDate < todayStr) || (endDate && endDate < todayStr))
      errors.push("Dates cannot be in the past.");

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors([]);
    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const days =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (!selectedNurse) {
        setFormErrors(["Nurse selection is invalid."]);
        setLoading(false);
        return;
      }

      const result = await createLeaveRequestByAdmin({
        nurseId: selectedNurse.nurse_id,
        leaveType,
        leaveMode,
        startDate,
        endDate,
        days,
        reason,
      });

      if (!result.success) {
        setFormErrors([`Failed to add leave: ${result.error || "Unknown error"}`]);
        setLoading(false);
        return;
      }

      setSelectedNurse(null);
      setLeaveType("");
      setLeaveMode("");
      setStartDate("");
      setEndDate("");
      setReason("");
      setSearch("");
      setNurses([]);
      onAddLeave();
      onClose();
    } catch {
      setFormErrors(["Error submitting leave request."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm"></div>
      <form
        className="relative bg-white rounded-sm shadow-xl w-full max-w-md mx-4"
        onSubmit={handleSubmit}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Add Leave Request</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-4">
          {formErrors.length > 0 && (
            <div className="mb-2 bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">
              <ul className="list-disc pl-5">
                {formErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nurse
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search nurse by name or reg no..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-sm focus:outline-none text-gray-700"
                disabled={!!selectedNurse}
              />
              {search && !selectedNurse && (
                <div className="absolute z-10 bg-white border rounded-sm mt-1 w-full max-h-40 overflow-y-auto shadow-lg">
                  {loading ? (
                    <div className="p-2 text-gray-500 text-sm">Loading...</div>
                  ) : nurses.length === 0 ? (
                    <div className="p-2 text-gray-500 text-sm">No nurses found</div>
                  ) : (
                    nurses.map((nurse: Nurse) => (
                      <button
                        type="button"
                        key={nurse.nurse_id}
                        className={`w-full text-gray-700 text-left px-3 py-2 hover:bg-blue-50`}
                        onClick={() => {
                          setSelectedNurse(nurse);
                          setSearch("");
                        }}
                      >
                        {nurse.full_name} ({nurse.nurse_reg_no})
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedNurse && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                {selectedNurse.full_name} ({selectedNurse.nurse_reg_no})
                <button
                  type="button"
                  className="ml-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSelectedNurse(null)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2 border rounded-sm focus:outline-none text-gray-700"
              required
            >
              <option value="">Select leave type</option>
              <option value="sick">Sick</option>
              <option value="annual">Annual</option>
              <option value="personal">Personal</option>
              <option value="casual">Casual</option>
              <option value="maternity">Maternity</option>
              <option value="paternity">Paternity</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Mode
            </label>
            <select
              value={leaveMode}
              onChange={(e) => setLeaveMode(e.target.value)}
              className="w-full px-3 py-2 border rounded-sm focus:outline-none text-gray-700"
              required
            >
              <option value="">Select leave mode</option>
              <option value="full_day">Full Day</option>
              <option value="half_day_morning">Half Day Morning</option>
              <option value="half_day_afternoon">Half Day Afternoon</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                min={todayStr}
                max={endDate || undefined}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-sm focus:outline-none text-gray-700"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                min={startDate || todayStr}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-sm focus:outline-none text-gray-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-20 px-3 py-2 border rounded-sm focus:outline-none text-gray-700"
              placeholder="Enter reason for leave..."
              required
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 border border-slate-200 rounded-sm text-gray-700 hover:bg-gray-50 text-sm font-medium transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-sm hover:bg-green-700 text-sm font-medium transition cursor-pointer"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
}