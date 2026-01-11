import React from "react";
import { Download, Loader, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

type AttendanceHeaderProps = {
  selectedDate: string;
  handleDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onExport: () => void;
  isExporting: boolean;
  selectedCategory: string;
  attendanceStatus: "present" | "absent" | "all";
  setAttendanceStatus: (status: "present" | "absent" | "all") => void;
  handleSearch: () => void;
  handleResetFilters: () => void;
};

export function AttendanceHeader({
  selectedDate,
  handleDateChange,
  searchTerm,
  setSearchTerm,
  onExport,
  isExporting,
  selectedCategory,
  attendanceStatus,
  setAttendanceStatus,
  handleSearch,
  handleResetFilters,
}: AttendanceHeaderProps) {
  const getCategoryDisplay = (): string => {
    if (!selectedCategory || selectedCategory === "") return "All Organizations";
    if (selectedCategory === "Dearcare_Llp") return "DearCare LLP";
    if (selectedCategory === "Tata_Homenursing") return "Tata HomeNursing";
    return "All Organizations";
  };

  return (
    <div className="bg-gray-50 rounded-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between p-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Staff Attendance</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track and manage nursing staff attendance records</p>
        </div>
        <div>
          <button 
            onClick={onExport}
            disabled={isExporting}
            className="px-3 py-1.5 bg-blue-500 text-white text-sm rounded-sm hover:bg-blue-600 transition-colors
             disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {isExporting ? (
              <span className="flex items-center">
                <Loader className="animate-spin mr-1 h-3 w-3 text-white" />
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
            className="pl-9 pr-20 py-1 h-9 bg-white text-sm border-slate-200 focus-visible:ring-blue-400 text-gray-800 w-full"            
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                handleResetFilters();
              }}
              className="absolute right-16 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white
             px-2.5 py-1 rounded-sm text-xs transition-colors"
          >
            Search
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Organization:</span>
            <div className="px-2.5 py-1 rounded-sm text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {getCategoryDisplay()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Status:</span>
            <div className="flex gap-1.5 items-center flex-wrap">
              {["all", "present", "absent"].map((status) => (
                <button
                  key={status}
                  onClick={() => setAttendanceStatus(status as "present" | "absent" | "all")}
                  className={`px-2.5 py-1 rounded-sm text-xs font-medium transition-colors ${
                    attendanceStatus === status
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-slate-200"
                  }`}
                >
                  {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600 whitespace-nowrap">Date:</span>
            <div className="relative">  
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="px-2.5 py-1 rounded-sm text-xs font-medium bg-white border border-slate-200 text-gray-800"
              />
            </div>
          </div>

          <button
            onClick={handleResetFilters}
            disabled={attendanceStatus === "all" && !searchTerm && !selectedDate}
            className={`ml-auto px-2.5 py-1 rounded-sm text-xs font-medium transition-colors border flex items-center gap-1 ${
              attendanceStatus === "all" && !searchTerm
                ? "bg-gray-50 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-slate-200"
            }`}
          >
            <X className="h-3 w-3" />
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
}