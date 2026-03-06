'use client';

import { useState } from 'react';
import { X, Loader2, BarChart3, Plus, Trash2 } from 'lucide-react';
import { createPoll } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface CreatePollModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface PollOption {
  id: string;
  text: string;
}

export default function CreatePollModal({ onClose, onSuccess }: CreatePollModalProps) {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' },
  ]);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [endsAt, setEndsAt] = useState('');
  const [error, setError] = useState('');

  const addOption = () => {
    if (options.length >= 10) {
      setError('Maximum 10 options allowed');
      return;
    }
    setOptions([...options, { id: Date.now().toString(), text: '' }]);
  };

  const removeOption = (id: string) => {
    if (options.length <= 2) {
      setError('Minimum 2 options required');
      return;
    }
    setOptions(options.filter(opt => opt.id !== id));
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(opt =>
      opt.id === id ? { ...opt, text } : opt
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!question.trim()) {
        setError('Question is required');
        setLoading(false);
        return;
      }

      const validOptions = options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        setError('At least 2 options are required');
        setLoading(false);
        return;
      }

      if (!endsAt) {
        setError('End date is required');
        setLoading(false);
        return;
      }

      // Calculate endsAt timestamp
      const endDate = new Date(endsAt);
      if (endDate <= new Date()) {
        setError('End date must be in the future');
        setLoading(false);
        return;
      }

      // Create poll options with proper structure
      const pollOptions = validOptions.map((opt, index) => ({
        id: opt.id,
        text: opt.text.trim(),
        order: index + 1,
        votes: 0,
      }));

      // Create poll via API
      const response = await fetch('/api/polls/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim(),
          description: description.trim(),
          options: pollOptions,
          settings: {
            allowMultiple,
            isAnonymous,
            endTime: endDate.toISOString(),
          },
          communityId: userData?.communityId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || 'Failed to create poll');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Create poll error:', error);
      setError(error.message || 'Failed to create poll');
      setLoading(false);
    }
  };

  // Set default end date to 7 days from now
  useState(() => {
    const defaultEnd = new Date();
    defaultEnd.setDate(defaultEnd.getDate() + 7);
    setEndsAt(defaultEnd.toISOString().slice(0, 16));
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                Create Poll
              </h2>
              <p className="text-gray-600 text-sm mt-1">Get community opinion on important topics</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              {error}
            </div>
          )}

          {/* Question */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask the community?"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={200}
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about the poll (optional)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              maxLength={500}
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Options <span className="text-red-500">*</span>
              </label>
              <span className="text-xs text-gray-500">Min 2, Max 10</span>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={option.id} className="flex gap-2">
                  <span className="flex items-center justify-center w-8 h-12 bg-purple-100 text-purple-700 rounded-xl font-semibold">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(option.id, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="w-full py-3 border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Option
                </button>
              )}
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Poll Settings
            </label>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="multiple"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
              <label htmlFor="multiple" className="flex-1 cursor-pointer">
                <p className="font-medium text-gray-800">Allow multiple selections</p>
                <p className="text-sm text-gray-600">Users can select more than one option</p>
              </label>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
              <label htmlFor="anonymous" className="flex-1 cursor-pointer">
                <p className="font-medium text-gray-800">Anonymous voting</p>
                <p className="text-sm text-gray-600">Hide who voted for what</p>
              </label>
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Poll Ends At <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <BarChart3 className="w-5 h-5" />
                  Create Poll
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
