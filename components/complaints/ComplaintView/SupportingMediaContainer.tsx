import MediaRenderer from "./MediaRenderer";
import { SupportingMedia } from "@/types/complaint.types";

interface SupportingMediaContainerProps {
  media: SupportingMedia[];
}

export default function SupportingMediaContainer({ media }: SupportingMediaContainerProps) {
  if (!media || media.length === 0) return null;
  
  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-3 text-gray-900">Supporting Evidence</h3>
      
      <div className="space-y-4">
        {/* Different layouts based on media count and types */}
        {media.length === 1 ? (
          <div className="w-full">
            <MediaRenderer media={media[0]} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {media.map(item => (
              <div key={item.id}>
                <MediaRenderer media={item} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}