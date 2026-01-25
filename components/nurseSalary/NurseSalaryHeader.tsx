"use client";

import React from "react";
import { Search, X, Download, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

interface DateFilters {
  createdAt: Date | null;
  paidAt: Date | null;
  approvedAt: Date | null;
}

interface NursesSalaryHeaderProps {
  searchInput: string;
  setSearchInput: (value: string) => void;
  handleSearchClick: () => void;
  handleResetFilters: () => void;
  handleExport: () => void;
  isExporting: boolean;
  loading: boolean;
  salaryRecordsLength: number;
  dateFilters: DateFilters;
  setDateFilters: (filters: DateFilters) => void;
}

export function NursesSalaryHeader({
  searchInput,
  setSearchInput,
  handleSearchClick,
  handleResetFilters,
  handleExport,
  isExporting,
  loading,
  salaryRecordsLength,
  dateFilters,
  setDateFilters,
}: NursesSalaryHeaderProps) {
  const handleClearDateFilter = (key: keyof DateFilters) => {
    setDateFilters({ ...dateFilters, [key]: null });
  };

  const handleSetDateFilter = (key: keyof DateFilters, date: Date | null) => {
    setDateFilters({ ...dateFilters, [key]: date });
  };

  return (
    <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Salary Payments</h2>
          <p className="text-xs text-gray-500">Manage nurse salary payments and calculations</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={handleExport}
            disabled={isExporting || loading || salaryRecordsLength === 0}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 
            transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isExporting ? (
              <span className="flex items-center">
                <Loader2 className="animate-spin mr-1 h-3 w-3 text-white" />
                Exporting...
              </span>
            ) : (
              <>
                <Download size={16} />
                Export
              </>
            )}
          </button>
        </div>
      </div>

      <div className="p-4 bg-gray-50 space-y-3">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Type to search"
            className="pl-9 pr-20 py-1 h-9 bg-white text-sm border-slate-200 focus-visible:ring-blue-400
              text-gray-800 w-full rounded-sm"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchClick();
            }}
          />
          {searchInput && (
            <button
              onClick={handleResetFilters}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white
              px-2.5 py-1 rounded-sm text-xs transition-colors"
            onClick={handleSearchClick}
            disabled={loading}
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(["createdAt", "paidAt", "approvedAt"] as const).map((key) => (
            <div key={key} className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">
                {key === "createdAt" && "Created At"}
                {key === "paidAt" && "Paid At"}
                {key === "approvedAt" && "Approved At"}
              </label>
              <input
                type="date"
                value={dateFilters[key] ? format(dateFilters[key] as Date, "yyyy-MM-dd") : ""}
                onChange={(e) => {
                  const date = e.target.value ? new Date(e.target.value) : null;
                  handleSetDateFilter(key, date);
                }}
                className="border rounded-sm px-2.5 py-1 text-xs font-medium bg-white border-slate-200 text-gray-800"
              />
            </div>
          ))}
          <button
            onClick={handleResetFilters}
            disabled={
              !searchInput &&
              !dateFilters.createdAt &&
              !dateFilters.paidAt &&
              !dateFilters.approvedAt
            }
            className={`ml-auto px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border flex items-center gap-1 ${
              !searchInput && !dateFilters.createdAt && !dateFilters.paidAt && !dateFilters.approvedAt
                ? "bg-gray-50 text-gray-400 border-slate-200 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-slate-200"
            }`}
          >
            <X className="h-3 w-3" />
            Reset All
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {(["createdAt", "paidAt", "approvedAt"] as const).map((key) =>
            dateFilters[key] ? (
              <div
                key={key}
                className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
              >
                <span>
                  {key === "createdAt" && "Created At: "}
                  {key === "paidAt" && "Paid At: "}
                  {key === "approvedAt" && "Approved At: "}
                  {format(dateFilters[key] as Date, "dd MMM yyyy")}
                </span>
                <button
                  className="ml-2 text-blue-500 hover:text-blue-700"
                  onClick={() => handleClearDateFilter(key)}
                  aria-label={`Clear ${key} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}