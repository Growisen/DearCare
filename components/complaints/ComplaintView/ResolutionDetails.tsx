import { Resolution } from "@/types/complaint.types";

interface ResolutionDetailsProps {
  resolution: Resolution;
}

export default function ResolutionDetails({ resolution }: ResolutionDetailsProps) {
  const { resolvedBy, resolutionDate, resolutionNotes } = resolution;
  
  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-md">
      <h3 className="font-medium mb-3 text-green-800">Resolution</h3>
      
      <div className="space-y-2">
        {resolvedBy && (
          <div>
            <span className="font-medium text-green-700">Resolved by:</span>{" "}
            <span className="text-green-800">{resolvedBy}</span>
          </div>
        )}
        
        {resolutionDate && (
          <div>
            <span className="font-medium text-green-700">Resolution date:</span>{" "}
            <span className="text-green-800">{resolutionDate}</span>
          </div>
        )}
        
        {resolutionNotes && (
          <div>
            <span className="font-medium text-green-700">Notes:</span>{" "}
            <p className="text-green-800 mt-1">{resolutionNotes}</p>
          </div>
        )}
        
        {!resolvedBy && !resolutionDate && !resolutionNotes && (
          <p className="text-green-800 italic">No resolution details available</p>
        )}
      </div>
    </div>
  );
}