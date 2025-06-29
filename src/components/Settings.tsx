import React, { useState } from 'react';
import { Bell, Mail, Clock, AlertTriangle, Save, User, Globe } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

export default function Settings() {
  const { state, dispatch } = useProject();
  const [userSettings, setUserSettings] = useState(state.userSettings);
  const [notifications, setNotifications] = useState(state.notifications);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    dispatch({ type: 'SET_USER_SETTINGS', payload: userSettings });
    dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  const SettingCard = ({ title, description, children }: any) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {children}
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange, label, description }: any) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && <div className="text-sm text-gray-500">{description}</div>}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Save className="h-4 w-4" />
          <span>{saved ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      <SettingCard
        title="User Profile"
        description="Configure your personal information for notifications and system identification"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={userSettings.name}
                onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                value={userSettings.email}
                onChange={(e) => setUserSettings({ ...userSettings, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              This email will be used for all task notifications and system alerts
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={userSettings.timezone}
                onChange={(e) => setUserSettings({ ...userSettings, timezone: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title="Email Notification Settings"
        description="Configure when and how you receive task notifications via email"
      >
        <div className="space-y-4">
          <ToggleSwitch
            enabled={notifications.enabled}
            onChange={(value: boolean) => setNotifications({ ...notifications, enabled: value })}
            label="Enable Email Notifications"
            description="Turn on/off all email notifications"
          />

          {notifications.enabled && (
            <div className="ml-4 pl-4 border-l-2 border-gray-200 space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Mail className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-900 font-medium">Email notifications will be sent to:</p>
                    <p className="text-blue-700">{userSettings.email || 'No email configured'}</p>
                  </div>
                </div>
              </div>

              <ToggleSwitch
                enabled={notifications.triggers.sevenDays}
                onChange={(value: boolean) =>
                  setNotifications({
                    ...notifications,
                    triggers: { ...notifications.triggers, sevenDays: value },
                  })
                }
                label="7 Days Before Deadline"
                description="Get notified a week before task deadlines"
              />

              <ToggleSwitch
                enabled={notifications.triggers.threeDays}
                onChange={(value: boolean) =>
                  setNotifications({
                    ...notifications,
                    triggers: { ...notifications.triggers, threeDays: value },
                  })
                }
                label="3 Days Before Deadline"
                description="Get notified 3 days before task deadlines"
              />

              <ToggleSwitch
                enabled={notifications.triggers.oneDay}
                onChange={(value: boolean) =>
                  setNotifications({
                    ...notifications,
                    triggers: { ...notifications.triggers, oneDay: value },
                  })
                }
                label="1 Day Before Deadline"
                description="Get notified the day before task deadlines"
              />

              <ToggleSwitch
                enabled={notifications.triggers.overdue}
                onChange={(value: boolean) =>
                  setNotifications({
                    ...notifications,
                    triggers: { ...notifications.triggers, overdue: value },
                  })
                }
                label="Overdue Tasks"
                description="Get notified when tasks become overdue"
              />

              <ToggleSwitch
                enabled={notifications.escalation}
                onChange={(value: boolean) =>
                  setNotifications({ ...notifications, escalation: value })
                }
                label="Escalation Alerts"
                description="Send escalation alerts for overdue high-priority tasks"
              />
            </div>
          )}
        </div>
      </SettingCard>

      <SettingCard
        title="System Information"
        description="Information about your ProjectFlow setup"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">User Email</span>
            <span className="text-sm text-gray-900">{userSettings.email || 'Not configured'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Total Projects</span>
            <span className="text-sm text-gray-900">{state.projects.length}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Total Tasks</span>
            <span className="text-sm text-gray-900">
              {state.projects.reduce((total, project) => total + project.tasks.length, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Templates</span>
            <span className="text-sm text-gray-900">{state.templates.length}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-gray-700">Data Storage</span>
            <span className="text-sm text-gray-900">Local Storage</span>
          </div>
        </div>
      </SettingCard>

      <SettingCard
        title="Data Management"
        description="Manage your project data and backups"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Export Data
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Import Data
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Export your projects and tasks to backup your data or import from a previous backup.
          </div>
        </div>
      </SettingCard>
    </div>
  );
}