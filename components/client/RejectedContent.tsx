import React from 'react';

type RejectionContentProps = {
  clientId: string;
  rejectionReason: string
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RejectedContent({ clientId, rejectionReason }: RejectionContentProps) {

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Rejection Record</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rejection Reason
            </label>
            <div className="w-full rounded-lg border border-gray-200 p-3 bg-gray-50 text-gray-900 min-h-[80px]">
              {rejectionReason || "No reason provided"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}