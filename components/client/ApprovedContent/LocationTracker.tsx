import React from 'react';

interface LocationTrackerProps {
  clientLocation?: { lat: number; lng: number } | null;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const LocationTracker: React.FC<LocationTrackerProps> = ({ clientLocation }) => {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-600 mb-2">Track Location</h4>
      <div className="h-64 rounded-xl overflow-hidden border">
        {/* Map component would go here */}
        {/* <Map clientLocation={clientLocation} /> */}
      </div>
    </div>
  );
};

export default LocationTracker;