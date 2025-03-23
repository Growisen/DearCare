import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BsShieldLock, BsShieldLockFill } from 'react-icons/bs';
import SettingToggle from './SettingToggle';

export default function OtpSetting() {
  const [otpEnabled, setOtpEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Simulate API call - replace with actual API call later
        setTimeout(() => {
          const savedSetting = localStorage.getItem('otpEnabled') === 'true';
          setOtpEnabled(savedSetting);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast.error('Failed to load settings');
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggleOtp = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual API call later
      setTimeout(() => {
        const newValue = !otpEnabled;
        setOtpEnabled(newValue);
        // Save to localStorage for demo purposes
        localStorage.setItem('otpEnabled', String(newValue));
        setIsLoading(false);
        toast.success('Settings updated successfully');
      }, 500);
    } catch (error) {
      console.error('Failed to update settings:', error);
      toast.error('Failed to update settings');
      setIsLoading(false);
    }
  };

  return (
    <SettingToggle
      title="One Time Password"
      description="Enable one-time password verification for Nurse validation"
      enabled={otpEnabled}
      isLoading={isLoading}
      icon={{
        enabled: <BsShieldLockFill className="text-blue-600 text-xl" />,
        disabled: <BsShieldLock className="text-gray-400 text-xl" />
      }}
      onToggle={handleToggleOtp}
    />
  );
}