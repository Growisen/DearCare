"use client"

// Cache to store already resolved locations
const locationCache: Record<string, string> = {};

export async function getLocationName(
  coordinates: { latitude: number; longitude: number } | null
): Promise<string> {
  if (!coordinates) return "Unknown location";
  
  const coordString = `${coordinates.latitude},${coordinates.longitude}`;
  
  // Check if we've already resolved this location
  if (locationCache[coordString]) {
    return locationCache[coordString];
  }
  
  // For Google Maps Geocoding API (requires API key)
  try {
    // Replace 'YOUR_API_KEY' with your actual Google Maps API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) return coordString; // Fallback to coordinates if no API key
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${apiKey}`
    );
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      // Get the most accurate result (usually the first one)
      // You can adjust this to get different levels of detail (e.g., city only, full address, etc.)
      const locationName = data.results[0].formatted_address;
      
      // Cache the result
      locationCache[coordString] = locationName;
      
      return locationName;
    }
    
    return coordString; // Fallback to coordinates if geocoding fails
  } catch (error) {
    console.error("Error resolving location name:", error);
    return coordString; // Fallback to coordinates
  }
}