import { Submitter } from "@/types/complaint.types";

interface SubmitterInfoProps {
  submitter: Submitter | undefined | null;
}

export default function SubmitterInfo({ submitter }: SubmitterInfoProps) {
  return (
    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-md">
      <h2 className="font-semibold text-lg mb-3 text-gray-900">Submitter Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <span className="text-sm text-gray-500 block">Name</span>
          <p className="font-medium text-gray-800">{submitter?.name}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 block">Email</span>
          <p className="font-medium text-gray-800">{submitter?.email}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 block">Phone</span>
          <p className="font-medium text-gray-800">{submitter?.phone}</p>
        </div>
        <div>
          <span className="text-sm text-gray-500 block">Type</span>
          <p className="font-medium text-gray-800">{submitter?.type}</p>
        </div>
      </div>
    </div>
  );
}