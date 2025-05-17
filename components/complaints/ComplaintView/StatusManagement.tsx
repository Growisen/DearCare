import React, { useState } from "react";
import { Complaint, ComplaintStatus } from "@/types/complaint.types";
import { statusOptions } from "@/types/complaint.types";

interface StatusManagementProps {
  complaint: Complaint;
  updateComplaint: (updatedComplaint: Complaint) => void;
}

export default function StatusManagement({ complaint, updateComplaint }: StatusManagementProps) {
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [resolution, setResolution] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleUpdateStatus = async () => {
    if (!complaint) return;
    
    // Require resolution when changing to resolved status
    if (status === "resolved" && complaint.status !== "resolved" && !resolution.trim()) {
      alert("Please provide resolution details before marking as resolved.");
      return;
    }
    
    setIsUpdatingStatus(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the local state
      const updatedComplaint = {
        ...complaint,
        status: status,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      
      // Add resolution if changing to resolved
      if (status === "resolved" && complaint.status !== "resolved") {
        updatedComplaint.resolution = resolution;
      }
      
      updateComplaint(updatedComplaint);
      
      alert("Status updated successfully!");
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium mb-3 text-gray-900">Update Status</h3>
      <select
        className="w-full p-2 border rounded mb-3 text-gray-700"
        value={status}
        onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {/* Show resolution input only when changing to resolved */}
      {status === "resolved" && complaint.status !== "resolved" && (
        <div className="mb-3">
          <label htmlFor="resolution" className="block text-sm font-medium text-gray-700 mb-1">
            Resolution Details
          </label>
          <textarea
            id="resolution"
            rows={3}
            className="w-full border rounded-md p-2 text-gray-700 mb-2"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Describe how this complaint was resolved..."
          ></textarea>
          <p className="text-xs text-gray-500">Required to mark as resolved</p>
        </div>
      )}
      
      <button
        onClick={handleUpdateStatus}
        disabled={isUpdatingStatus || status === complaint.status || 
          (status === "resolved" && complaint.status !== "resolved" && !resolution.trim())}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-300"
      >
        {isUpdatingStatus ? "Updating..." : "Update Status"}
      </button>
    </div>
  );
}