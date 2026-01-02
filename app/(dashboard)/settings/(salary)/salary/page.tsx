"use client";

import React, { useState, useEffect } from "react";
import {
  saveSalaryNotification,
  getCurrentSalaryNotification,
  toggleSalaryNotificationStatus
} from "@/app/actions/settings/salary-notification";
import Loader from "@/components/Loader";
import { useNotifications } from "@/hooks/useNotifications";

const SalarySettings: React.FC = () => {
  const [initialDate, setInitialDate] = useState("");
  const [salaryIntervalDays, setSalaryIntervalDays] = useState<number>(30);
  const [notifications, setNotifications] = useState<number[]>([3, 1]);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const { invalidateNotifications } = useNotifications();

  useEffect(() => {
    async function fetchNotification() {
      setLoading(true);
      try {
        const result = await getCurrentSalaryNotification();

        if (result.success && result.notification) {
          const n = result.notification;

          setInitialDate(n.start_date || "");
          setSalaryIntervalDays(n.interval_days || 30);
          setIsActive(
            typeof n.is_active === "boolean" ? n.is_active : true
          );
          setNotifications(
            Array.isArray(n.notify_before_days) && n.notify_before_days.length > 0
              ? n.notify_before_days
              : [3, 1]
          );
        } else {
          console.warn("No notification settings found.");
        }
      } catch (err) {
        console.error("Error fetching salary notification:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchNotification();
  }, []);

  const addNotificationDay = () => {
    setNotifications((prev) => [...prev, 1]);
  };

  const updateNotificationDay = (index: number, value: number) => {
    setNotifications((prev) =>
      prev.map((day, i) => (i === index ? value : day))
    );
  };

  const removeNotificationDay = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);

    const settings = {
      title: "salary_notification",
      initial_date: initialDate,
      salary_interval_days: salaryIntervalDays,
      notification_days: notifications,
      is_active: isActive,
    };

    try {
      const result = await saveSalaryNotification(settings);
      if (result.success) {
        invalidateNotifications();
        alert("Settings saved!");
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      alert(
        "Unexpected error: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    setIsSaving(true);
    try {
      const result = await toggleSalaryNotificationStatus(!isActive);
      if (result.success) {
        invalidateNotifications();
        setIsActive((prev) => !prev);
      } else {
        alert("Failed to update status: " + result.error);
      }
    } catch (err) {
      alert(
        "Unexpected error: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto py-3 px-2 max-w-6xl">
      {loading ? (
        <Loader message="Loading scheduled info.." />
       ): (
       <div className="bg-white rounded border border-slate-200 p-5 space-y-6"> 
        <h2 className="text-gray-700">Salary Configuration</h2>
        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">
            Enable Salary Notifications
          </label>
          <button
            onClick={handleToggleActive}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? "bg-slate-600" : "bg-gray-300"
            } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm ${
              isActive ? "text-green-600" : "text-gray-500"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Salary Pay Date
          </label>
          <input
            type="date"
            value={initialDate}
            onChange={(e) => setInitialDate(e.target.value)}
            disabled={!isActive || isSaving}
            className={`w-full border border-slate-200 rounded px-3 py-2 text-gray-700 text-sm focus:ring focus:ring-slate-200 ${
              !isActive || isSaving ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Days to Next Salary Date
          </label>
          <input
            type="number"
            min={1}
            value={salaryIntervalDays}
            onChange={(e) => setSalaryIntervalDays(Number(e.target.value))}
            disabled={!isActive || isSaving}
            className={`w-full border border-slate-200 rounded px-3 py-2 text-gray-700 text-sm focus:ring focus:ring-slate-200 ${
              !isActive || isSaving ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Notifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Preferences
          </label>
          <div className={!isActive || isSaving ? "opacity-50" : ""}>
            <table className="min-w-full text-sm text-gray-700 border border-slate-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-slate-200 px-3 py-2 text-left text-gray-700">
                    Days Before
                  </th>
                  <th className="border border-slate-200 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((day, index) => (
                  <tr key={index}>
                    <td className="border border-slate-200 px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        value={day}
                        onChange={(e) =>
                          updateNotificationDay(index, Number(e.target.value))
                        }
                        disabled={!isActive || isSaving}
                        className={`w-full border border-slate-200 rounded px-2 py-1 text-gray-700 text-sm ${
                          !isActive || isSaving
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }`}
                      />
                    </td>
                    <td className="border border-slate-200 px-3 py-2 text-gray-700 text-center">
                      <button
                        onClick={() => removeNotificationDay(index)}
                        disabled={!isActive || isSaving}
                        className={`text-red-600 hover:underline ${
                          !isActive || isSaving
                            ? "cursor-not-allowed opacity-50"
                            : ""
                        }`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={addNotificationDay}
              disabled={!isActive || isSaving}
              className={`mt-2 text-slate-600 hover:underline ${
                !isActive || isSaving
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              + Add Notification Day
            </button>
          </div>
        </div>

        {/* Save */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={!isActive || isSaving}
            className={`bg-slate-600 text-white px-4 py-2 rounded transition-colors flex items-center space-x-2 ${
              !isActive || isSaving ? "opacity-75 cursor-not-allowed" : "hover:bg-slate-700"
            }`}
          >
            {isSaving && (
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 
                  3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>
        </div>
      </div>
      )}
    </div>
  );
};

export default SalarySettings;
