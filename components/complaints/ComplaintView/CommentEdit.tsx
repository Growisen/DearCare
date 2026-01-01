import React from "react";

interface CommentEditProps {
  editedComment: string;
  setEditedComment: (comment: string) => void;
  handleEditComment: () => void;
  cancelEdit: () => void;
}

export default function CommentEdit({ 
  editedComment, 
  setEditedComment, 
  handleEditComment,
  cancelEdit
}: CommentEditProps) {
  return (
    <div className="space-y-4">
      <div>
        <textarea
          rows={4}
          className="w-full border rounded-sm p-2 text-gray-700"
          value={editedComment}
          onChange={(e) => setEditedComment(e.target.value)}
        ></textarea>
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleEditComment}
          disabled={!editedComment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
        >
          Save Changes
        </button>
        <button
          onClick={cancelEdit}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-sm hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}