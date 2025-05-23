import React from "react";

interface CommentFormProps {
  comment: string;
  setComment: (comment: string) => void;
  handleAddComment: () => void;
  isAddingComment: boolean;
}

export default function CommentForm({ 
  comment, 
  setComment, 
  handleAddComment, 
  isAddingComment 
}: CommentFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <textarea
          rows={4}
          className="w-full border rounded-md p-2 text-gray-700"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add an official comment about this complaint..."
        ></textarea>
      </div>
      <div>
        <button
          onClick={handleAddComment}
          disabled={isAddingComment || !comment.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-400"
        >
          {isAddingComment ? "Adding..." : "Add Comment"}
        </button>
      </div>
    </div>
  );
}