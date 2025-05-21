import React from "react";

interface CommentViewProps {
  comment: string;
  lastUpdated: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeletingComment: boolean;
}

export default function CommentView({ 
  comment, 
  lastUpdated, 
  onEdit, 
  onDelete,
  isDeletingComment
}: CommentViewProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 p-4 rounded-md">
      <div className="flex justify-between items-start">
        <p className="text-gray-700">{comment}</p>
        <div className="flex gap-2 ml-4">
          <button 
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Edit
          </button>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this comment?")) {
                onDelete();
              }
            }}
            disabled={isDeletingComment}
            className="text-sm text-red-600 hover:text-red-800"
          >
            {isDeletingComment ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">Added on: {lastUpdated}</p>
    </div>
  );
}