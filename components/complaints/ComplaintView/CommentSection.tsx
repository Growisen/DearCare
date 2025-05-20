import React, { useState } from "react";
import CommentForm from "./CommentForm";
import CommentView from "./CommentView";
import CommentEdit from "./CommentEdit";
import { Complaint } from "@/types/complaint.types";

interface CommentSectionProps {
  complaint: Complaint;
  updateComplaint: (updatedComplaint: Complaint) => void;
}

export default function CommentSection({ complaint, updateComplaint }: CommentSectionProps) {
  const [adminComment, setAdminComment] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [editedComment, setEditedComment] = useState("");
  const [isDeletingComment, setIsDeletingComment] = useState(false);

  const handleAddComment = async () => {
    if (!complaint || !adminComment.trim()) return;
    
    setIsAddingComment(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update complaint with admin comment
      updateComplaint({
        ...complaint,
        comments: adminComment,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
      
      alert("Comment added successfully!");
    } catch {
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsAddingComment(false);
      setAdminComment("");
    }
  };

  const handleEditComment = async () => {
    if (!complaint || !editedComment.trim()) return;
    
    try {
      setIsEditingComment(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update complaint with edited comment
      updateComplaint({
        ...complaint,
        comments: editedComment,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
      
      alert("Comment updated successfully!");
      // Exit editing mode after successful update
      setIsEditingComment(false);
    } catch {
      alert("Failed to update comment. Please try again.");
    }
  };
  
  const handleDeleteComment = async () => {
    if (!complaint) return;
    
    try {
      setIsDeletingComment(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Remove the admin comment
      updateComplaint({
        ...complaint,
        comments: undefined,
        lastUpdated: new Date().toISOString().split('T')[0],
      });
      
      alert("Comment deleted successfully!");
      setIsDeletingComment(false);
    } catch {
      alert("Failed to delete comment. Please try again.");
      setIsDeletingComment(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-3 text-gray-900">Any Comment</h3>
      
      {complaint.comments && !isEditingComment ? (
        <CommentView 
          comment={complaint.comments}
          lastUpdated={complaint.lastUpdated}
          onEdit={() => {
            setEditedComment(complaint.comments || "");
            setIsEditingComment(true);
          }}
          onDelete={handleDeleteComment}
          isDeletingComment={isDeletingComment}
        />
      ) : complaint.comments && isEditingComment ? (
        <CommentEdit
          editedComment={editedComment}
          setEditedComment={setEditedComment}
          handleEditComment={handleEditComment}
          cancelEdit={() => setIsEditingComment(false)}
        />
      ) : (
        <CommentForm
          comment={adminComment}
          setComment={setAdminComment}
          handleAddComment={handleAddComment}
          isAddingComment={isAddingComment}
        />
      )}
    </div>
  );
}