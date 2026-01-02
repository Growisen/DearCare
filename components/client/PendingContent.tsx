"use client"
import { useState } from 'react';
import { updateClientStatus } from '@/app/actions/clients/client-actions';
import { Client } from '@/types/client.types';
import { useDashboardData } from '@/hooks/useDashboardData';

type ClientStatus = "pending" | "under_review" | "approved" | "rejected" | "assigned";

type PendingContentProps = {
  client: Client;
  onStatusChange?: (newStatus?: ClientStatus) => void;
};

export function PendingContent({ client, onStatusChange }: PendingContentProps) {
  const { invalidateDashboardCache } = useDashboardData();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startReviewProcess = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await updateClientStatus(client.id, 'under_review');
      
      if (result.success) {
        invalidateDashboardCache();
        // Pass the new status for optimistic update
        if (onStatusChange) {
          onStatusChange('under_review');
        }
      } else {
        setError(result.error || 'Failed to update status');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-sm shadow-none border border-slate-200 mt-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Review</h3>
      <p className="text-gray-600 mb-6">
        This client request is pending review. Start the review process to evaluate their requirements.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm">
          {error}
        </div>
      )}
      
      <button
        onClick={startReviewProcess}
        disabled={isLoading}
        className={`px-4 py-2 rounded-sm font-medium ${
          isLoading 
            ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
            : "bg-blue-600 text-white hover:bg-blue-700"
        } transition-colors`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            Processing...
          </span>
        ) : (
          "Start Review Process"
        )}
      </button>
    </div>
  );
}