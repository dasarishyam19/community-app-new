'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, BarChart3, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { getActivePolls, voteOnPoll } from '@/lib/firestore';
import type { Poll } from '@/types/database';
import Logo from '@/components/Logo';

export default function PollsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingPollId, setVotingPollId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    const loadPolls = async () => {
      if (userData?.communityId) {
        try {
          const communityPolls = await getActivePolls(userData.communityId);
          setPolls(communityPolls);
        } catch (error) {
          console.error('Error loading polls:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPolls();
  }, [userData]);

  const handleVote = async (pollId: string, optionIds: string[]) => {
    setVotingPollId(pollId);
    try {
      await voteOnPoll(pollId, userData!.id, optionIds);

      // Reload polls to show updated results
      const communityPolls = await getActivePolls(userData!.communityId);
      setPolls(communityPolls);
    } catch (error: any) {
      console.error('Vote error:', error);
      alert(error.message || 'Failed to vote. Please try again.');
    } finally {
      setVotingPollId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
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
              <h1 className="text-xl font-bold text-gray-800">Community Polls</h1>
              <p className="text-xs text-gray-600">{polls.length} active polls</p>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {polls.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Active Polls</h3>
            <p className="text-gray-600">Check back later for community polls!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {polls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onVote={handleVote}
                isVoting={votingPollId === poll.id}
                hasVoted={false} // TODO: Check if user has voted
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface PollCardProps {
  poll: Poll;
  onVote: (pollId: string, optionIds: string[]) => Promise<void>;
  isVoting: boolean;
  hasVoted: boolean;
}

function PollCard({ poll, onVote, isVoting, hasVoted }: PollCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const totalVotes = poll.totalVotes || 0;
  const isExpired = new Date(poll.endsAt.toDate()) < new Date();

  const handleOptionClick = (optionId: string) => {
    if (hasVoted || isExpired) return;

    if (poll.settings.allowMultiple) {
      if (selectedOptions.includes(optionId)) {
        setSelectedOptions(selectedOptions.filter(id => id !== optionId));
      } else {
        setSelectedOptions([...selectedOptions, optionId]);
      }
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) return;
    await onVote(poll.id, selectedOptions);
    setSelectedOptions([]);
  };

  const getPercentage = (votes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{poll.question}</h3>
            {poll.description && (
              <p className="text-gray-600">{poll.description}</p>
            )}
          </div>
          {isExpired && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
              <Clock className="w-4 h-4" />
              Expired
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{totalVotes} votes</span>
          <span>•</span>
          <span>Ends {new Date(poll.endsAt.toDate()).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
      </div>

      {/* Options */}
      <div className="p-6 space-y-3">
        {poll.options
          .sort((a, b) => a.order - b.order)
          .map((option) => {
            const percentage = getPercentage(option.votes);
            const isSelected = selectedOptions.includes(option.id);
            const width = hasVoted || isExpired ? `${percentage}%` : '0%';

            return (
              <div key={option.id} className="relative">
                <button
                  onClick={() => handleOptionClick(option.id)}
                  disabled={hasVoted || isExpired}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : hasVoted || isExpired
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer'
                  }`}
                >
                  {/* Progress Bar */}
                  {(hasVoted || isExpired) && (
                    <div
                      className="absolute inset-y-0 left-0 bg-purple-100 rounded-xl transition-all duration-500"
                      style={{ width }}
                    />
                  )}

                  <div className="relative flex items-center justify-between z-10">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{option.text}</p>
                      {(hasVoted || isExpired) && (
                        <p className="text-sm text-gray-600">{percentage}% ({option.votes} votes)</p>
                      )}
                    </div>
                    {isSelected && !hasVoted && !isExpired && (
                      <CheckCircle2 className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                </button>
              </div>
            );
          })}
      </div>

      {/* Action Button */}
      {(hasVoted || isExpired) ? (
        <div className="px-6 pb-6">
          <div className={`p-3 rounded-xl text-center text-sm font-medium ${
            hasVoted
              ? 'bg-green-50 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {hasVoted ? '✓ You have voted' : 'This poll has ended'}
          </div>
        </div>
      ) : (
        <div className="px-6 pb-6">
          <button
            onClick={handleVote}
            disabled={selectedOptions.length === 0 || isVoting}
            className={`w-full py-3 rounded-xl font-semibold transition-all ${
              selectedOptions.length === 0 || isVoting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:shadow-lg'
            }`}
          >
            {isVoting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                Voting...
              </>
            ) : (
              <>Submit Vote{poll.settings.allowMultiple && selectedOptions.length > 1 ? ` (${selectedOptions.length})` : ''}</>
            )}
          </button>
          {poll.settings.allowMultiple && (
            <p className="text-xs text-gray-500 text-center mt-2">
              You can select multiple options
            </p>
          )}
        </div>
      )}
    </div>
  );
}
