import { useState, useCallback, useEffect } from 'react';
import { WebUser, getCurrentUser } from '@/app/actions/user-actions';

type UserData = {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string | null;
  photo: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  isLoading: boolean;
  error: string | null;
};

export type UserFieldType = 'email' | 'phone' | 'address' | 'city' | 'state' | 'postalCode' | 'country';

export const useUserData = (autoFetch = true, initialData?: Partial<UserData>) => {
  const [userData, setUserData] = useState<UserData>({
    id: initialData?.id || '',
    name: initialData?.name || '',
    role: initialData?.role || '',
    email: initialData?.email || '',
    phone: initialData?.phone || null,
    photo: initialData?.photo || null,
    address: initialData?.address || null,
    city: initialData?.city || null,
    state: initialData?.state || null,
    postalCode: initialData?.postalCode || null,
    country: initialData?.country || null,
    isLoading: autoFetch, // Start loading if autoFetch is true
    error: null
  });

  const updateUserData = useCallback((webUser: WebUser) => {
    setUserData({
      id: webUser.id,
      name: webUser.full_name,
      role: webUser.role,
      email: webUser.email,
      phone: webUser.phone,
      photo: webUser.profile_image_url,
      address: webUser.address,
      city: webUser.city,
      state: webUser.state,
      postalCode: webUser.postal_code,
      country: webUser.country,
      isLoading: false,
      error: null
    });
  }, []);

  const setError = useCallback((error: string) => {
    setUserData(prev => ({ ...prev, error, isLoading: false }));
  }, []);

  const fetchUserData = useCallback(async () => {
    setUserData(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await getCurrentUser();
      if (result.success && result.user) {
        updateUserData(result.user);
      } else {
        setError(result.error || "Failed to load user data");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    }
  }, [updateUserData, setError]);

  // Fetch user data on hook initialization if autoFetch is true
  useEffect(() => {
    if (autoFetch) {
      fetchUserData();
    }
  }, [fetchUserData, autoFetch]);

  // Rest of your existing functions
  const updateField = useCallback((field: UserFieldType, value: string | null) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateEmail = useCallback((email: string) => {
    setUserData(prev => ({ ...prev, email }));
  }, []);

  const updatePhone = useCallback((phone: string) => {
    setUserData(prev => ({ ...prev, phone }));
  }, []);

  const updatePhoto = useCallback((photo: string | null) => {
    setUserData(prev => ({ ...prev, photo }));
  }, []);

  const updateAddress = useCallback((address: string) => {
    setUserData(prev => ({ ...prev, address }));
  }, []);

  const updateCity = useCallback((city: string) => {
    setUserData(prev => ({ ...prev, city }));
  }, []);

  const updateState = useCallback((state: string) => {
    setUserData(prev => ({ ...prev, state }));
  }, []);
  
  const updatePostalCode = useCallback((postalCode: string) => {
    setUserData(prev => ({ ...prev, postalCode }));
  }, []);
  
  const updateCountry = useCallback((country: string) => {
    setUserData(prev => ({ ...prev, country }));
  }, []);

  return {
    userData,
    updateUserData,
    fetchUserData,
    setError,
    updateField,
    updateEmail,
    updatePhone,
    updatePhoto,
    updateAddress,
    updateCity,
    updateState,
    updatePostalCode,
    updateCountry
  };
};