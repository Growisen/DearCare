import React from 'react';
import Link from 'next/link';

interface ProfileErrorProps {
  error: string | null;
}

const ProfileError: React.FC<ProfileErrorProps> = ({ error }) => (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className="max-w-6xl mx-auto bg-white p-8 rounded-sm shadow">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-red-700">Error Loading Profile</h1>
        <p className="mt-2 text-gray-600">{error || "Patient profile not found"}</p>
        <Link href="/" className="inline-block text-indigo-600 hover:underline mt-4">
          Return to Dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default ProfileError;