"use client";

import SettingsSection from "@/components/settings/SettingSection";
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  const settingsList = [
    { 
      title: "Salary Settings", 
      description: "Manage salary configuration and payment schedules",
      info: "Notifications can be enabled on scheduled dates.",
      route: "/settings/salary"
    }
  ];

  const handleSettingClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and configuration</p>
      </div>

      <div className="space-y-4">
        {settingsList.map((setting, index) => (
          <SettingsSection
            key={index}
            title={setting.title}
            description={setting.description}
            info={setting.info}
            onClick={() => handleSettingClick(setting.route)}
          />
        ))}
      </div>
    </div>
  );
}