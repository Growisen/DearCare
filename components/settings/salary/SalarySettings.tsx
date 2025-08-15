"use client";

import React, { useState } from "react";

const SalarySettings: React.FC = () => {
  const [initialDate, setInitialDate] = useState("");
  const [salaryIntervalDays, setSalaryIntervalDays] = useState<number>(30);
  const [notifications, setNotifications] = useState<number[]>([3, 1]); 

  const addNotificationDay = () => {
    setNotifications([...notifications, 1]);
  };

  const updateNotificationDay = (index: number, value: number) => {
    const updated = [...notifications];
    updated[index] = value;
    setNotifications(updated);
  };

  const removeNotificationDay = (index: number) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const settings = {
      initialDate,
      salaryIntervalDays,
      notifications,
    };
    console.log("Saving salary settings:", settings);
    // TODO: Send to API
  };

  return (
    <div className="mx-auto py-3 px-2 max-w-6xl">
        <div className="bg-white rounded border border-gray-300 p-5 space-y-6">
          {/* Initial Salary Pay Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Salary Pay Date
            </label>
            <input
              type="date"
              value={initialDate}
              onChange={(e) => setInitialDate(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 text-sm focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Number of Days to Next Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Number of Days to Next Salary Date
            </label>
            <input
              type="number"
              min={1}
              value={salaryIntervalDays}
              onChange={(e) => setSalaryIntervalDays(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-3 py-2 text-gray-700 text-sm focus:ring focus:ring-blue-200"
            />
          </div>

          {/* Notification Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Preferences
            </label>
            <table className="min-w-full text-sm text-gray-700 border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left text-gray-700">
                    Days Before
                  </th>
                  <th className="border border-gray-300 px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((day, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        value={day}
                        onChange={(e) =>
                          updateNotificationDay(index, Number(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-gray-700 text-sm"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-gray-700 text-center">
                      <button
                        onClick={() => removeNotificationDay(index)}
                        className="text-red-600 hover:underline"
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
              className="mt-2 text-blue-600 hover:underline"
            >
              + Add Notification Day
            </button>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </div>
    </div>
  );
};

export default SalarySettings;
