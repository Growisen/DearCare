import React from "react";

type LoaderProps = {
  message?: string | null;
  size?: "small" | "medium" | "large";
  centered?: boolean;
  className?: string;
  color?: "primary" | "secondary" | "success";
  skeleton?: boolean; 
}

export default function Loader({
  message = null,
  size = "medium",
  centered = true,
  className = "",
  color = "primary",
  skeleton = false
}: LoaderProps) {
  // Size mappings
  const sizeClasses = {
    small: "h-5 w-5",
    medium: "h-8 w-8",
    large: "h-14 w-14",
  };
  
  // Color mappings for border colors
  const colorClasses = {
    primary: "border-blue-500",
    secondary: "border-gray-500",
    success: "border-green-500"
  };
  
  const containerClasses = centered ? "flex flex-col items-center justify-center py-8" : "";

  if (skeleton) {
    // Skeleton loader for client profile page
    return (
      <div className={`${containerClasses} ${className} w-full max-w-2xl mx-auto`}>
        <div className="animate-pulse space-y-6 w-full">
          <div className="flex items-center space-x-4">
            <div className="rounded-full bg-gray-200 h-16 w-16" />
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-32 bg-gray-200 rounded w-full" />
          <div className="flex space-x-2">
            <div className="h-10 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-200 rounded w-24" />
            <div className="h-10 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`inline-block animate-spin rounded-full border-t-2 border-b-2 ${sizeClasses[size]} ${colorClasses[color]}`}></div>
      {message && (
        <p className="text-sm text-slate-600 mt-4">{message}</p>
      )}
    </div>
  )
}

// Enhanced loading state component with matte look
export function LoadingState({ 
  message = "Loading...", 
  className = "",
  description = null 
}: { 
  message?: string; 
  className?: string;
  description?: string | null;
}) {
  return (
    <div className={`overflow-hidden p-8 ${className}`}>
      <div className="flex flex-col items-center justify-center text-center">
      <Loader 
        message={ null } 
        size="medium" 
        color="primary" 
        centered={true} 
      />
        <h3 className="mt-4 text-gray-800 font-semibold text-lg">{message}</h3>
        {description && (
          <p className="mt-2 text-gray-500 text-sm max-w-md">{description}</p>
        )}
      </div>
    </div>
  );
}

// For inline usage within buttons or small spaces
export function InlineLoader({ color = "primary", className = "" }: { color?: "primary" | "secondary" | "success", className?: string }) {
  return (
    <Loader size="small" color={color} centered={false} className={className} />
  );
}