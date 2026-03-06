'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, FileText, AlertTriangle, Receipt, User, Menu, Heart, MessageCircle, Bookmark, LogOut, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import Logo from '@/components/Logo';
import dynamic from 'next/dynamic';

// Dynamic imports to avoid SSR issues
const CommunityFeed = dynamic(() => import('@/components/CommunityFeed'), { ssr: false });
const BillsPage = dynamic(() => import('@/components/BillsPage'), { ssr: false });
const AlertsPage = dynamic(() => import('@/components/AlertsPage'), { ssr: false });
const ProfilePage = dynamic(() => import('@/components/ProfilePage'), { ssr: false });

type TabType = 'feed' | 'bills' | 'alerts' | 'profile';

export default function NewAppLayout() {
  const { userData, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('feed');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-500"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'feed' as TabType, icon: Home, label: 'Feed' },
    { id: 'bills' as TabType, icon: Receipt, label: 'Bills' },
    { id: 'alerts' as TabType, icon: AlertTriangle, label: 'Alerts' },
    { id: 'profile' as TabType, icon: User, label: 'Profile' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <CommunityFeed />;
      case 'bills':
        return <BillsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <CommunityFeed />;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pb-16 md:pb-0">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8">
              <Logo />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              #Connect
            </span>
          </div>

          {/* Theme Toggle & Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const themes: Theme[] = ['light', 'dark', 'system'];
                const currentIndex = themes.indexOf(theme);
                const nextTheme = themes[(currentIndex + 1) % themes.length];
                setTheme(nextTheme);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title={`Current: ${theme} - Click to switch`}
            >
              {theme === 'light' && <Sun className="w-5 h-5 text-amber-500" />}
              {theme === 'dark' && <Moon className="w-5 h-5 text-blue-400" />}
              {theme === 'system' && <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
            </button>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto pt-16 md:pt-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className="hidden md:block fixed left-0 top-20 bottom-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800">
        <div className="flex flex-col py-4 h-full">
          <div className="px-4 mb-4">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Navigation
            </p>
          </div>
          <div className="flex-1 space-y-1 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* User Profile Section */}
          <div className="px-4 mt-auto pb-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                {userData?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{userData?.fullName || 'User'}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{userData?.role || 'user'}</p>
              </div>
            </div>
            <button
              onClick={() => {
                signOut();
                router.push('/');
              }}
              className="flex items-center gap-2 w-full px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
