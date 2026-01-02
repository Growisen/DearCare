import Link from 'next/link';

interface ComplaintDescriptionProps {
  description: string;
  reportedId?: string | number;
  profileUrl: string;
}

export default function ComplaintDescription({ description, reportedId, profileUrl }: ComplaintDescriptionProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-sm">
      <h2 className="font-semibold text-lg mb-2 text-gray-900">Complaint Description</h2>
      <p className="text-gray-700">{description}</p>
      
      {reportedId && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <p className="text-gray-700 flex items-center">
            <span className="font-medium">Reported User:</span>
            <Link 
              href={profileUrl} 
              className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Profile
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}