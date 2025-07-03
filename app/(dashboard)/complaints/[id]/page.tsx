"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

// Import components
import ComplaintHeader from "@/components/complaints/ComplaintView/ComplaintHeader"
import SubmitterInfo from "@/components/complaints/ComplaintView/SubmitterInfo"
import ComplaintDescription from "@/components/complaints/ComplaintView/ComplaintDescription"
import SupportingMediaContainer from "@/components/complaints/ComplaintView/SupportingMediaContainer"
// import CommentSection from "@/components/complaints/ComplaintView/CommentSection"
import StatusManagement from "@/components/complaints/ComplaintView/StatusManagement"
import ComplaintTimeline from "@/components/complaints/ComplaintView/ComplaintTimeline"
import ResolutionDetails from "@/components/complaints/ComplaintView/ResolutionDetails"

// Import types and mock data
import { Complaint } from "@/types/complaint.types"
import { fetchComplaintById, getProfileUrl } from "@/app/actions/complaints-management/complaints-actions"

export default function ComplaintDetailPage() {
  const params = useParams();
  const complaintId = params.id as string;
  
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileUrl, setProfileUrl] = useState("");
  
  useEffect(() => {
    async function fetchComplaintDetail() {
      setLoading(true);
      try {
        const response = await fetchComplaintById(complaintId);
        
        if (!response.success || !response.data) {
          setError(response.error || "Failed to fetch complaint details");
          return;
        }
        
        setComplaint(response.data);
        
        // Fetch profile URL if reportedId exists
        if (response.data.reportedId) {
          const result = await getProfileUrl(response.data.reportedId);
          setProfileUrl(result.url || "");
        }
      } catch (error) {
        setError("Failed to load complaint details. Please try again.");
        console.error("Error fetching complaint:", error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchComplaintDetail();
  }, [complaintId]);
  
  if (loading) {
    return (
      <div className="flex flex-col space-y-4 p-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  if (error || !complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-6">
        <div className="text-red-500 text-xl mb-4">
          {error || "Complaint not found"}
        </div>
        <Link href="/complaints" className="text-blue-600 hover:underline">
          Return to Complaints
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow">
      <ComplaintHeader complaint={complaint} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Main Information Column */}
        <div className="col-span-2 space-y-6">
          <SubmitterInfo submitter={complaint.submitter} />
          
          <ComplaintDescription 
            description={complaint.description} 
            reportedId={complaint.reportedId}
            profileUrl={profileUrl}
          />
          
          {complaint.supportingMedia && complaint.supportingMedia.length > 0 && (
            <SupportingMediaContainer media={complaint.supportingMedia} />
          )}
          
          {/* <CommentSection 
            complaint={complaint}
            updateComplaint={setComplaint}
          /> */}
          
          {/* Resolution Details (if resolved) */}
          {complaint.status === "resolved" && complaint.resolution && (
            <ResolutionDetails resolution={complaint.resolution} />
          )}
        </div>
        
        {/* Sidebar Information */}
        <div className="space-y-6">
          <StatusManagement 
            complaint={complaint}
            updateComplaint={setComplaint}
          />
          
          <ComplaintTimeline complaint={complaint} />
        </div>
      </div>
    </div>
  );
}