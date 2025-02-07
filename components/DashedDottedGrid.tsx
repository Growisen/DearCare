"use client";

import React from "react";

interface DashedDottedGridProps {
  className?: string;
  style?: React.CSSProperties;
  gridSize?: number;
  dotSize?: number;
  lineColor?: string;
  dotColor?: string;
  dashArray?: string;
}

const DashedDottedGrid: React.FC<DashedDottedGridProps> = ({
  className = "",
  style = {},
  gridSize = 40,
  dotSize = 2,
  lineColor = "#e5e7eb",
  dotColor = "#9ca3af",
  dashArray = "2,2",
}) => {
  const svgSize = gridSize * 2; // 2x2 grid pattern

  const svgPattern = encodeURIComponent(`
    <svg width="${svgSize}" height="${svgSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="${gridSize}" height="${gridSize}" patternUnits="userSpaceOnUse">
          <path d="M ${gridSize} 0 L 0 0 0 ${gridSize}" 
            fill="none" stroke="${lineColor}" 
            stroke-width="1" stroke-dasharray="${dashArray}" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <circle cx="0" cy="0" r="${dotSize}" fill="${dotColor}" />
      <circle cx="${gridSize}" cy="0" r="${dotSize}" fill="${dotColor}" />
      <circle cx="0" cy="${gridSize}" r="${dotSize}" fill="${dotColor}" />
      <circle cx="${gridSize}" cy="${gridSize}" r="${dotSize}" fill="${dotColor}" />
    </svg>
  `);

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,${svgPattern}"), radial-gradient(${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${svgSize}px ${svgSize}px, ${gridSize}px ${gridSize}px`,
        backgroundPosition: `0 0, ${gridSize / 2}px ${gridSize / 2}px`,
        animation: "flow 5s linear infinite",
        ...style,
      }}
    />
  );
};

// Add keyframes for the flowing effect
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes flow {
      0% { background-position: 0 0, 20px 20px; }
      50% { background-position: 20px 20px, 40px 40px; }
      100% { background-position: 40px 40px, 60px 60px; }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default DashedDottedGrid;
