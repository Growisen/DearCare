"use server"

import { createSupabaseServerClient } from './auth'

export type AttendanceRecord = {
  id: number;
  nurseName: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  scheduledStart: string;
  scheduledEnd: string;
  hoursWorked: number | string;
  status: string;
  location: string | null;
}

interface Nurse {
  nurse_id: number;
  first_name: string;
  last_name: string;
}

interface NurseClient {
  id: number;
  nurse_id: number;
  shift_start_time: string;
  shift_end_time: string;
  nurse: Nurse | Nurse[];
}

// Update the RawAttendanceRecord interface to match the actual data structure
interface RawAttendanceRecord {
  id: number;
  date: string;
  start_time: string | null;
  end_time: string | null;
  total_hours: string | null;
  location: string | null;
  nurse_client: NurseClient | NurseClient[] | null;
}

// Convert 24-hour format to 12-hour format
function convertTo12HourFormat(time24: string | null): string {
  if (!time24) return '';
  
  try {
    const [hours, minutes] = time24.split(':').map(num => parseInt(num, 10));
    
    if (isNaN(hours) || isNaN(minutes)) return '';
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error converting time format:', error);
    return '';
  }
}

export async function fetchStaffAttendance(date?: string): Promise<{ success: boolean; data: AttendanceRecord[]; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Improved query with better joins
    const { data, error } = await supabase
      .from('attendence_individual')
      .select(`
          id,
          date,
          start_time,
          end_time,
          total_hours,
          location,
          nurse_client:assigned_id (
            id,
            nurse_id,
            shift_start_time,
            shift_end_time,
            nurse:nurse_id (
                nurse_id,
                first_name,
                last_name
            )
          )
      `)
      .eq('date', targetDate);
    
    if (error) throw new Error(error.message);
    
    
    const formattedData: AttendanceRecord[] = (data as RawAttendanceRecord[]).map(record => {
      const actualStart = record.start_time ? convertTo12HourFormat(record.start_time) : '';
      const actualEnd = record.end_time ? convertTo12HourFormat(record.end_time) : '';
      

      let nurseClient = null;
      if (record.nurse_client) {
        if (Array.isArray(record.nurse_client)) {

          nurseClient = record.nurse_client.length > 0 ? record.nurse_client[0] : null;
        } else {

          nurseClient = record.nurse_client;
        }
      }
      
      const scheduledStart = nurseClient?.shift_start_time ? convertTo12HourFormat(nurseClient.shift_start_time) : '';
      const scheduledEnd = nurseClient?.shift_end_time ? convertTo12HourFormat(nurseClient.shift_end_time) : '';

      let status = 'Absent';
      if (record.start_time) {
          status = 'Present';

          if (nurseClient?.shift_start_time && record.start_time) {
            const expectedMinutes = parseInt(nurseClient.shift_start_time.split(':')[0]) * 60 + parseInt(nurseClient.shift_start_time.split(':')[1]);
            const actualMinutes = parseInt(record.start_time.split(':')[0]) * 60 + parseInt(record.start_time.split(':')[1]);

            if (actualMinutes > expectedMinutes + 15) {
                status = 'Late';
            }
          }
      }

      let nurse = null;
      if (nurseClient?.nurse) {
        if (Array.isArray(nurseClient.nurse)) {

          nurse = nurseClient.nurse.length > 0 ? nurseClient.nurse[0] : null;
        } else {

          nurse = nurseClient.nurse;
        }
      }
        
      const nurseName = nurse?.first_name && nurse?.last_name
        ? `${nurse.first_name} ${nurse.last_name}`
        : 'Unknown Nurse';

            let hoursWorked: number | string = 0;
      if (record.total_hours) {
          if (record.total_hours.includes(':')) {
              const [hours, minutes] = record.total_hours.split(':').map(Number);
              
              // Format based on whether there are hours or just minutes
              if (hours === 0) {
                  hoursWorked = `${minutes} min`;
              } else {
                  hoursWorked = `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;
              }
          } else {
              const numHours = parseFloat(record.total_hours);
              hoursWorked = `${numHours}h`;
          }
      } else if (record.start_time && record.end_time) {
          const start = new Date(`1970-01-01T${record.start_time}`);
          const end = new Date(`1970-01-01T${record.end_time}`);
          const totalHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
          
          // Calculate hours and minutes
          const hours = Math.floor(totalHours);
          const minutes = Math.round((totalHours - hours) * 60);
          
          if (hours === 0) {
              hoursWorked = `${minutes} min`;
          } else {
              hoursWorked = `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`;
          }
      }


      let locationInfo = record.location;
      try {
        if (record.location && typeof record.location === 'string' && 
            (record.location.startsWith('{') || record.location.startsWith('['))) {
          const locationObj = JSON.parse(record.location);
          locationInfo = `${locationObj.latitude}, ${locationObj.longitude}`;
        }
      } catch (e) {
        console.error("Error parsing location data:", e);
      }

      return {
          id: record.id,
          nurseName,
          date: record.date,
          shiftStart: actualStart,
          shiftEnd: actualEnd,
          scheduledStart,
          scheduledEnd,
          hoursWorked, 
          status,
          location: locationInfo
      };
    });
    
    return {
      success: true,
      data: formattedData
    };
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}