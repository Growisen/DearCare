interface ComplaintDescriptionProps {
    description: string;
  }
  
  export default function ComplaintDescription({ description }: ComplaintDescriptionProps) {
    return (
      <div className="bg-gray-50 p-4 rounded-md">
        <h2 className="font-semibold text-lg mb-2 text-gray-900">Complaint Description</h2>
        <p className="text-gray-700">{description}</p>
      </div>
    );
  }