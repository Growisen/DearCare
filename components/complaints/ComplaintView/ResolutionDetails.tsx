import { Resolution } from "@/types/complaint.types";
import { User } from "lucide-react";

interface ResolutionDetailsProps {
  resolution: Resolution;
}

export default function ResolutionDetails({ resolution }: ResolutionDetailsProps) {
  const { resolvedBy, resolutionDate, resolutionNotes } = resolution;
  
  const isDetailedUser = typeof resolvedBy === 'object' && resolvedBy !== null;
  
  return (
    <div className="bg-green-50 border border-green-200 p-4 rounded-md">
      <h3 className="font-medium mb-3 text-green-800">Resolution</h3>
      
      <div className="space-y-2">
        {resolvedBy && (
          <div>
            <span className="font-medium text-green-700">Resolved by:</span>{" "}
            {isDetailedUser ? (
              <div className="flex items-center mt-1">
                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-2">
                  <div className="text-green-800 font-medium">{resolvedBy.name}</div>
                  <div className="text-green-600 text-xs">{resolvedBy.role}</div>
                </div>
              </div>
            ) : (
              <span className="text-green-800">{resolvedBy}</span>
            )}
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
            <p className="text-green-800 mt-1 whitespace-pre-line">{resolutionNotes}</p>
          </div>
        )}
        
        {!resolvedBy && !resolutionDate && !resolutionNotes && (
          <p className="text-green-800 italic">No resolution details available</p>
        )}
      </div>
    </div>
  );
}