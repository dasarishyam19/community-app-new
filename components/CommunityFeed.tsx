'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Heart, Share2, Pin, Eye } from 'lucide-react';
import { getCommunityPosts } from '@/lib/firebase/firestore';
import type { Post } from '@/types/database';

export default function CommunityFeed() {
  const { userData } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">No posts yet. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20 md:pb-0 md:pl-72">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

function PostCard({ post }: { post: Post }) {
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      news: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      announcement: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      event: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      general: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };
    return colors[category] || colors.general;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'border-gray-300 dark:border-gray-600',
      medium: 'border-blue-300 dark:border-blue-600',
      high: 'border-orange-300 dark:border-orange-600',
      urgent: 'border-red-500',
    };
    return colors[priority] || colors.low;
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border-l-4 ${getPriorityColor(post.priority)} ${
      post.isPinned ? 'ring-2 ring-amber-400 dark:ring-amber-600' : ''
    }`}>
      {post.isPinned && (
        <div className="bg-amber-50 dark:bg-amber-900/20 px-4 py-2 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm font-medium">
          <Pin className="w-4 h-4" />
          Pinned Post
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getCategoryColor(post.category)}`}>
                {post.category}
              </span>
              {post.priority !== 'low' && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                  post.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  post.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {post.priority}
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{post.title}</h3>
          </div>
        </div>

        {/* Content */}
        <p className="text-gray-700 dark:text-gray-300 mb-4 whitespace-pre-wrap text-sm">{post.content}</p>

        {/* Author */}
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-3 pb-3 border-b dark:border-gray-700">
          <span>By {post.authorName}</span>
          <span>•</span>
          <span>{new Date(post.publishedAt.toDate()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-red-500 transition-colors">
              <Heart className="w-5 h-5" />
              <span>{post.stats.likes || 0}</span>
            </button>
            <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-5 h-5" />
              <span>{post.stats.comments || 0}</span>
            </button>
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Eye className="w-5 h-5" />
              <span>{post.stats.views || 0}</span>
            </div>
          </div>
          <button className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
