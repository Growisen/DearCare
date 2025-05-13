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
    small: "h-6 w-6",
    medium: "h-8 w-8",
    large: "h-16 w-16",
  };

  // Border width based on size
  const borderWidthClasses = {
    small: "border-2",
    medium: "border-2",
    large: "border-4",
  };

  // Color mappings
  const colorClasses = {
    primary: "border-blue-600",
    secondary: "border-gray-600",
    success: "border-green-600"
  };
  
  const containerClasses = centered ? "flex flex-col items-center justify-center py-12" : "";
  
  return (
    <div className={`${containerClasses} ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Static ring */}
        <div 
          className={`
            absolute 
            inset-0 
            rounded-full 
            border-solid
            opacity-20 
            ${borderWidthClasses[size]}
            ${colorClasses[color]}
          `}
        />
        {/* Spinning ring */}
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
          style={{ 
            animationDuration: "0.8s",
            animationIterationCount: "infinite",
            animationTimingFunction: "linear"
          }}
        />
      </div>
      {message && (
        <p className="mt-4 text-gray-700 font-medium text-sm">{message}</p>
      )}
    </div>
  )
}

// For backward compatibility
export const LoadingState = ({ message = "Loading..." }) => (
  <Loader message={message} size="large" color="primary" />
);