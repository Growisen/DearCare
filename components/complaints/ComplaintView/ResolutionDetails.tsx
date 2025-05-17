interface ResolutionDetailsProps {
    resolution: string;
  }
  
  export default function ResolutionDetails({ resolution }: ResolutionDetailsProps) {
    return (
      <div className="bg-green-50 border border-green-200 p-4 rounded-md">
        <h3 className="font-medium mb-2 text-green-800">Resolution</h3>
        <p className="text-green-800">{resolution}</p>
      </div>
    );
  }