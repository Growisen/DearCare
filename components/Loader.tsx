import React from "react";

type LoaderProps = {
  message?: string | null;
  size?: "small" | "medium" | "large";
  centered?: boolean;
  className?: string;
  color?: "primary" | "secondary" | "success";
}

export default function Loader({
  message = null,
  size = "medium",
  centered = true,
  className = "",
  color = "primary"
}: LoaderProps) {
  // Size mappings
  const sizeClasses = {
    small: "h-5 w-5",
    medium: "h-8 w-8",
    large: "h-14 w-14",
  };

  // Border width based on size
  const borderWidthClasses = {
    small: "border-2",
    medium: "border-2",
    large: "border-3",
  };

  // Color mappings - using the matte finish colors
  const colorClasses = {
    primary: "border-blue-600",
    secondary: "border-gray-600",
    success: "border-green-600"
  };
  
  const containerClasses = centered ? "flex flex-col items-center justify-center py-10" : "";
  
  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Static ring with matte look */}
        <div 
          className={`
            absolute 
            inset-0 
            rounded-full 
            border-solid
            opacity-30
            ${borderWidthClasses[size]}
            ${colorClasses[color]}
          `}
        />
        {/* Spinning ring - using animate-spin class from Tailwind */}
        <div 
          className={`
            absolute 
            inset-0 
            rounded-full 
            border-solid
            border-t-transparent 
            animate-spin
            ${borderWidthClasses[size]}
            ${colorClasses[color]}
          `}
        />
      </div>
      {message && (
        <div className="mt-4 flex flex-col items-center text-center">
          <p className="text-gray-600 font-medium text-sm">{message}</p>
        </div>
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
    <div className={`bg-gray-50 rounded-xl border border-gray-200 overflow-hidden p-8 ${className}`}>
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