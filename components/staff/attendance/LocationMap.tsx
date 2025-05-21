import React from 'react';

interface LocationMapProps {
  location: string;
  width?: string;
  height?: string;
}

const LocationMap = ({ location }: LocationMapProps) => {
  if (!location) return null;
  
  const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
  
  if (isNaN(lat) || isNaN(lng)) return null;
  
  
  return (
    <div className="map-container">
      <div className="mt-1">
        <a 
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-xs"
        >
          View on Google Maps
        </a>
      </div>
    </div>
  );
};

export default LocationMap;