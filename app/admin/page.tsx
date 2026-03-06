'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, LayoutDashboard, FileText, BarChart3, AlertTriangle, Receipt, Users, Home, LogOut, Shield, Plus } from 'lucide-react';
import Logo from '@/components/Logo';
import dynamic from 'next/dynamic';

// Dynamically import modals to avoid SSR issues
const CreatePostModal = dynamic(() => import('@/components/CreatePostModal'), { ssr: false });
const CreatePollModal = dynamic(() => import('@/components/CreatePollModal'), { ssr: false });
const CreateAlertModal = dynamic(() => import('@/components/CreateAlertModal'), { ssr: false });
const CreateBillModal = dynamic(() => import('@/components/CreateBillModal'), { ssr: false });

export default function AdminDashboardPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'polls' | 'alerts' | 'bills'>('overview');
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [showCreateAlertModal, setShowCreateAlertModal] = useState(false);
  const [showCreateBillModal, setShowCreateBillModal] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && (!userData || (userData.role !== 'admin' && userData.role !== 'super_admin'))) {
      router.push('/dashboard');
    }
  }, [userData, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: LayoutDashboard },
    { id: 'posts' as const, label: 'Posts & News', icon: FileText },
    { id: 'polls' as const, label: 'Polls', icon: BarChart3 },
    { id: 'alerts' as const, label: 'Alerts', icon: AlertTriangle },
    { id: 'bills' as const, label: 'Bills', icon: Receipt },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10">
                <Logo />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">#Connect Admin</h1>
                <p className="text-xs text-gray-600">{userData?.communityId || 'Community Management'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <Home className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg p-4 sticky top-24">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <Shield className="w-5 h-5 text-amber-600" />
                <h2 className="font-semibold text-gray-800">Admin Panel</h2>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Community Info */}
              <div className="mt-6 pt-4 border-t">
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Community</h3>
                <p className="text-sm text-gray-800 font-medium">Visakhapatnam</p>
                <p className="text-xs text-gray-600">Maddilapalem Area</p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'posts' && <PostsTab onCreatePost={() => setShowCreatePostModal(true)} />}
            {activeTab === 'polls' && <PollsTab onCreatePoll={() => setShowCreatePollModal(true)} />}
            {activeTab === 'alerts' && <AlertsTab onCreateAlert={() => setShowCreateAlertModal(true)} />}
            {activeTab === 'bills' && <BillsTab onCreateBill={() => setShowCreateBillModal(true)} />}
          </div>
        </div>

        {/* All Modals */}
        {showCreatePostModal && (
          <CreatePostModal
            onClose={() => setShowCreatePostModal(false)}
            onSuccess={() => setShowCreatePostModal(false)}
          />
        )}
        {showCreatePollModal && (
          <CreatePollModal
            onClose={() => setShowCreatePollModal(false)}
            onSuccess={() => setShowCreatePollModal(false)}
          />
        )}
        {showCreateAlertModal && (
          <CreateAlertModal
            onClose={() => setShowCreateAlertModal(false)}
            onSuccess={() => setShowCreateAlertModal(false)}
          />
        )}
        {showCreateBillModal && (
          <CreateBillModal
            onClose={() => setShowCreateBillModal(false)}
            onSuccess={() => setShowCreateBillModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Overview Tab Component
function OverviewTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here's what's happening in your community.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-3xl font-bold">2</p>
            </div>
            <Users className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Active Posts</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <FileText className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Active Polls</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <BarChart3 className="w-10 h-10 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Pending Bills</p>
              <p className="text-3xl font-bold">0</p>
            </div>
            <Receipt className="w-10 h-10 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border-2 border-dashed border-blue-300 rounded-xl hover:bg-blue-50 transition-colors text-left">
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-semibold text-gray-800">Create Post</h4>
            <p className="text-sm text-gray-600">Share news and updates</p>
          </button>
          <button className="p-4 border-2 border-dashed border-purple-300 rounded-xl hover:bg-purple-50 transition-colors text-left">
            <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-semibold text-gray-800">Create Poll</h4>
            <p className="text-sm text-gray-600">Get community opinion</p>
          </button>
          <button className="p-4 border-2 border-dashed border-orange-300 rounded-xl hover:bg-orange-50 transition-colors text-left">
            <AlertTriangle className="w-8 h-8 text-orange-600 mb-2" />
            <h4 className="font-semibold text-gray-800">Send Alert</h4>
            <p className="text-sm text-gray-600">Emergency notification</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Posts Tab Component
function PostsTab({ onCreatePost }: { onCreatePost: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Posts & News</h2>
          <p className="text-gray-600">Create and manage community posts</p>
        </div>
        <button
          onClick={onCreatePost}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Post
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Posts Yet</h3>
        <p className="text-gray-600 mb-4">Create your first post to engage with your community</p>
        <button
          onClick={onCreatePost}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          Create First Post
        </button>
      </div>
    </div>
  );
}

// Polls Tab Component
function PollsTab({ onCreatePoll }: { onCreatePoll: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Community Polls</h2>
          <p className="text-gray-600">Create polls and gather community opinions</p>
        </div>
        <button
          onClick={onCreatePoll}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Poll
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Polls Yet</h3>
        <p className="text-gray-600 mb-4">Create your first poll to get community feedback</p>
        <button
          onClick={onCreatePoll}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          Create First Poll
        </button>
      </div>
    </div>
  );
}

// Alerts Tab Component
function AlertsTab({ onCreateAlert }: { onCreateAlert: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Alerts & Notifications</h2>
          <p className="text-gray-600">Send emergency alerts to your community</p>
        </div>
        <button
          onClick={onCreateAlert}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Send Alert
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Alerts</h3>
        <p className="text-gray-600 mb-4">Create an alert to notify your community</p>
        <button
          onClick={onCreateAlert}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          Create Alert
        </button>
      </div>
    </div>
  );
}

// Bills Tab Component
function BillsTab({ onCreateBill }: { onCreateBill: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Bill Management</h2>
          <p className="text-gray-600">Create and manage utility bills for users</p>
        </div>
        <button
          onClick={onCreateBill}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Bill
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bills Created</h3>
        <p className="text-gray-600 mb-4">Generate your first bill for community members</p>
        <button
          onClick={onCreateBill}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all"
        >
          Create Bill
        </button>
      </div>
    </div>
  );
}
