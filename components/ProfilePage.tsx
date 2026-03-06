'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { User, Phone, MapPin, Shield, Building2, LogOut, Settings, Moon, Sun, Monitor, Bell, Lock, HelpCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { getCommunityById } from '@/lib/firestore';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
  const { userData, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [community, setCommunity] = useState<any>(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (userData?.communityId) {
        try {
          const communityData = await getCommunityById(userData.communityId);
          setCommunity(communityData);
        } catch (error) {
          console.error('Error fetching community:', error);
        }
      }
    };

    fetchCommunity();
  }, [userData]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0 md:pl-72">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 mb-4 text-white">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold border-2 border-white/30">
            {userData.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{userData.fullName}</h1>
            <p className="text-blue-100 capitalize">{userData.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Profile Information</h2>

        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Full Name</p>
              <p className="font-medium text-gray-800 dark:text-white">{userData.fullName}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Phone Number</p>
              <p className="font-medium text-gray-800 dark:text-white">{userData.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Role</p>
              <p className="font-medium text-gray-800 dark:text-white capitalize">{userData.role?.replace('_', ' ')}</p>
            </div>
          </div>

          {community && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Community</p>
                <p className="font-medium text-gray-800 dark:text-white">{community.name}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
              <p className="font-medium text-gray-800 dark:text-white truncate">{userData.location.address}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Settings</h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
            {theme === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
            {theme === 'system' && <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Theme</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{theme}</p>
            </div>
          </div>
          <button
            onClick={() => {
              const themes: Theme[] = ['light', 'dark', 'system'];
              const currentIndex = themes.indexOf(theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];
              setTheme(nextTheme);
            }}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Change
          </button>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Notifications</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Manage alerts</p>
            </div>
          </div>
          <button
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            →
          </button>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Privacy</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Security settings</p>
            </div>
          </div>
          <button
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            →
          </button>
        </div>

        {/* Help */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Help & Support</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Get assistance</p>
            </div>
          </div>
          <button
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            →
          </button>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-semibold"
      >
        <LogOut className="w-5 h-5" />
        Sign Out
      </button>

      {/* Admin Panel Link */}
      {(userData.role === 'admin' || userData.role === 'super_admin') && (
        <button
          onClick={() => router.push('/admin')}
          className="w-full flex items-center justify-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors font-semibold mt-4"
        >
          <Shield className="w-5 h-5" />
          Admin Panel
        </button>
      )}
    </div>
  );
}
