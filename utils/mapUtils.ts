/**
 * Generates a Google Maps URL from an address object or string
 * 
 * @param address - Object containing address parts or a string address
 * @param options - Additional options for map link generation
 * @returns Google Maps URL string or null if insufficient address data
 */
export function createMapLink(
    address: 
      | { fullAddress?: string; city?: string; district?: string; state?: string; pincode?: string; [key: string]: unknown }
      | string
      | null
      | undefined,
    options?: {
      zoom?: number;
      mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
      label?: string;
      defaultOnEmpty?: boolean;
    }
  ): string | null {
    // Handle null/undefined
    if (!address) {
      return options?.defaultOnEmpty ? "https://maps.google.com/" : null;
    }
    
    // Handle string address
    if (typeof address === 'string') {
      const trimmedAddress = address.trim();
      return trimmedAddress ? `https://maps.google.com/?q=${encodeURIComponent(trimmedAddress)}` : null;
    }
    
    // Handle object address
    const addressParts = [
      address.fullAddress,
      address.city,
      address.district,
      address.state,
      address.pincode
    ].filter(Boolean);
    
    if (addressParts.length === 0) {
      return options?.defaultOnEmpty ? "https://maps.google.com/" : null;
    }
    
    const queryParams = new URLSearchParams();
    
    // Add address query
    queryParams.append('q', addressParts.join(', '));
    
    // Add optional parameters
    if (options?.zoom) {
      queryParams.append('z', options.zoom.toString());
    }
    
    if (options?.mapType) {
      queryParams.append('t', options.mapType.charAt(0));
    }
    
    // For location label
    if (options?.label) {
      queryParams.append('q', `${addressParts.join(', ')}(${options.label})`);
    }
    
    return `https://maps.google.com/?${queryParams.toString()}`;
  }