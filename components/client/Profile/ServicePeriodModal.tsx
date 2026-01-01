import React, { useState, useEffect } from "react";
import { serviceOptions } from "@/utils/constants";

export type ServicePeriodFormValues = {
  startDate: string;
  endDate: string;
  notes: string;
  serviceRequired?: string;
};

export interface ServicePeriod {
  id: string;
  startDate: string;
  endDate: string;
  notes?: string;
  status: "active" | "completed" | "cancelled";
  serviceRequired?: string;
}

interface ServicePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServicePeriodFormValues) => Promise<void>;
  initialData?: ServicePeriod | null;
  isSubmitting: boolean;
}

const ServicePeriodModal: React.FC<ServicePeriodModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isSubmitting,
}) => {
  const [form, setForm] = useState<ServicePeriodFormValues>({
    startDate: "",
    endDate: "",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          startDate: initialData.startDate,
          endDate: initialData.endDate,
          notes: initialData.notes || "",
          serviceRequired: initialData.serviceRequired || "",
        });
      } else {
        setForm({ startDate: "", endDate: "", notes: "", serviceRequired: "" });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full p-6 m-4 animate-in fade-in zoom-in duration-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {initialData ? "Edit Service Period" : "New Service Period"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded px-3 py-2 text-gray-800 text-sm outline-none"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded px-3 py-2 text-gray-800 text-sm outline-none"
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
            <input
              type="text"
              placeholder="Optional notes..."
              className="w-full border border-slate-200 rounded px-3 py-2 text-gray-800 text-sm outline-none"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Service Required <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full border border-slate-200 rounded px-3 py-2 text-gray-800 text-sm outline-none appearance-none"
              value={form.serviceRequired || ""}
              onChange={e => setForm({ ...form, serviceRequired: e.target.value })}
              required
            >
              {serviceOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !form.startDate || !form.endDate}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Saving..." : "Save Period"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicePeriodModal;