'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, FileText, MessageCircle, Heart, Share2, Pin, ArrowLeft } from 'lucide-react';
import { getCommunityPosts } from '@/lib/firestore';
import type { Post } from '@/types/database';
import Logo from '@/components/Logo';

export default function CommunityFeedPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    const loadPosts = async () => {
      if (userData?.communityId) {
        try {
          const communityPosts = await getCommunityPosts(userData.communityId, 50);
          setPosts(communityPosts);
        } catch (error) {
          console.error('Error loading posts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPosts();
  }, [userData]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10">
              <Logo />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Community Feed</h1>
              <p className="text-xs text-gray-600">{posts.length} posts</p>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Posts Yet</h3>
            <p className="text-gray-600">Check back later for community updates!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      news: 'bg-blue-100 text-blue-700',
      announcement: 'bg-green-100 text-green-700',
      event: 'bg-purple-100 text-purple-700',
      maintenance: 'bg-orange-100 text-orange-700',
      general: 'bg-gray-100 text-gray-700',
    };
    return colors[category] || colors.general;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'border-gray-300',
      medium: 'border-blue-300',
      high: 'border-orange-300',
      urgent: 'border-red-500',
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className={`bg-white rounded-3xl shadow-xl overflow-hidden border-l-4 ${getPriorityColor(post.priority)} ${post.isPinned ? 'ring-2 ring-amber-400' : ''}`}>
      {post.isPinned && (
        <div className="bg-amber-50 px-6 py-2 flex items-center gap-2 text-amber-700 text-sm font-medium">
          <Pin className="w-4 h-4" />
          Pinned Post
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getCategoryColor(post.category)}`}>
                {post.category}
              </span>
              {post.priority !== 'low' && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                  post.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                  post.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {post.priority}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{post.content}</p>

        {/* Author */}
        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 pb-4 border-b">
          <span>By {post.authorName}</span>
          <span>•</span>
          <span>{new Date(post.publishedAt.toDate()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
            <Heart className="w-5 h-5" />
            <span>{post.stats.likes || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span>{post.stats.comments || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
            <Eye className="w-5 h-5" />
            <span>{post.stats.views || 0}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Eye({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-7 10-7" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
