'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Phone, Home as HomeIcon, Building2, LogOut, Shield, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { User as FirestoreUser } from '@/types/database';
import Logo from '@/components/Logo';
import { getCommunityById } from '@/lib/firebase/firestore';

export default function DashboardPage() {
  const { firebaseUser, userData, loading: authLoading, signOut, reloadUserData } = useAuth();
  const router = useRouter();
  const [community, setCommunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    const fetchCommunity = async () => {
      if (userData?.communityId) {
        try {
          const communityData = await getCommunityById(userData.communityId);
          setCommunity(communityData);
        } catch (error) {
          console.error('Error fetching community:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCommunity();
  }, [userData]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16">
              <Logo />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome to #Connect</h1>
              <p className="text-gray-600">Your neighborhood dashboard</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            Your Profile
          </h2>
          {userData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <User className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold text-gray-800">{userData.fullName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <Phone className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-800">{userData.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <Shield className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <p className="font-semibold text-gray-800 capitalize">{userData.role}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                <Building2 className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Community</p>
                  <p className="font-semibold text-gray-800">{community?.name || 'Loading...'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl md:col-span-2">
                <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold text-gray-800">{userData.location.address}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">Loading your profile...</p>
          )}
        </div>

        {/* Admin Quick Actions (only show to admins) */}
        {userData?.role === 'admin' || userData?.role === 'super_admin' ? (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-600" />
              Admin Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => router.push('/admin')}
                className="p-4 bg-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="text-3xl mb-2">⚡</div>
                <h3 className="font-semibold text-gray-800">Admin Panel</h3>
                <p className="text-sm text-gray-600 mt-1">Manage everything from here</p>
              </div>
              <div
                onClick={() => router.push('/admin')}
                className="p-4 bg-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-800">Create Post</h3>
                <p className="text-sm text-gray-600 mt-1">Share news & updates</p>
              </div>
              <div
                onClick={() => router.push('/admin')}
                className="p-4 bg-white rounded-xl hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-800">Create Poll</h3>
                <p className="text-sm text-gray-600 mt-1">Get community opinion</p>
              </div>
            </div>
          </div>
        ) : null}

        {/* Features Coming Soon */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => router.push('/community')}
              className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="text-4xl mb-2">💬</div>
              <h3 className="font-semibold text-gray-800">Community Feed</h3>
              <p className="text-sm text-gray-600 mt-1">View posts from your community</p>
            </div>
            <div
              onClick={() => router.push('/polls')}
              className="p-4 bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="text-4xl mb-2">🗳️</div>
              <h3 className="font-semibold text-gray-800">Active Polls</h3>
              <p className="text-sm text-gray-600 mt-1">Vote on community decisions</p>
            </div>
            <div
              onClick={() => router.push('/bills')}
              className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl text-center hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="text-4xl mb-2">💳</div>
              <h3 className="font-semibold text-gray-800">Bill Payments</h3>
              <p className="text-sm text-gray-600 mt-1">Pay utility bills online</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
