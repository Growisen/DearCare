import { useState } from "react";
import Image from "next/image";
import { SupportingMedia } from "@/types/complaint.types";

interface MediaRendererProps {
  media: SupportingMedia;
}

export default function MediaRenderer({ media }: MediaRendererProps) {
  const [showFullImage, setShowFullImage] = useState(false);
  
  switch (media.type) {
    case "image":
      return (
        <div className="relative">
          <div 
            className="relative h-40 w-full cursor-pointer rounded-md overflow-hidden border border-gray-200"
            onClick={() => setShowFullImage(true)}
          >
            <Image 
              src={media.url} 
              alt={media.fileName} 
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover hover:opacity-90 transition"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 p-2">
              <p className="text-white text-xs truncate">{media.fileName}</p>
            </div>
          </div>
          
          {/* Full-size image modal */}
          {showFullImage && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowFullImage(false)}
            >
              <div className="relative max-w-4xl max-h-[90vh]">
                <button
                  className="absolute -top-10 right-0 text-white hover:text-gray-300"
                  onClick={() => setShowFullImage(false)}
                >
                  Close &times;
                </button>
                <div className="relative w-full h-[85vh]">
                  <Image 
                    src={media.url} 
                    alt={media.fileName}
                    fill
                    sizes="(max-width: 1536px) 100vw, 1536px" 
                    className="object-contain"
                    priority={true}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      );
      
    case "video":
      return (
        <div className="space-y-1">
          <div className="rounded-md overflow-hidden border border-gray-200">
            <video 
              controls 
              width="100%" 
              height="auto" 
              poster={media.thumbnailUrl}
              className="w-full"
            >
              <source src={media.url} type={media.contentType || "video/mp4"} />
              Your browser does not support the video tag.
            </video>
          </div>
          <p className="text-sm text-gray-600 truncate">{media.fileName}</p>
        </div>
      );
      
    case "audio":
      return (
        <div className="space-y-1 p-3 border rounded-md bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-1">{media.fileName}</p>
          <audio controls className="w-full">
            <source src={media.url} type={media.contentType || "audio/mpeg"} />
            Your browser does not support the audio element.
          </audio>
          <p className="text-xs text-gray-500">{media.fileSize}</p>
        </div>
      );
      
    case "document":
    default:
      return (
        <div className="flex items-center p-3 border rounded-md bg-gray-50 hover:bg-gray-100 transition">
          <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-md mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 truncate">{media.fileName}</p>
            <p className="text-xs text-gray-500">{media.fileSize}</p>
          </div>
          <a 
            href={media.url} 
            download={media.fileName}
            className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </a>
        </div>
      );
  }
}