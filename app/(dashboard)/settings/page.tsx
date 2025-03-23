"use client";

import SettingsSection from '@/components/settings/SettingSection';
import OtpSetting from '@/components/settings/OtpSetting';

export default function SettingsPage() {
  return (
    <div className="mx-auto py-3 px-2 max-w-6xl">
      <h1 className="text-2xl font-bold mb-4 text-gray-900">Settings</h1>
      
      <SettingsSection title="Nurses Settings">
        <OtpSetting />
      </SettingsSection>
    </div>
  );
}