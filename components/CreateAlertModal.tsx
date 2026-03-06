'use client';

import { useState } from 'react';
import { X, Loader2, AlertTriangle, Clock } from 'lucide-react';
import { createAlert } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface CreateAlertModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateAlertModal({ onClose, onSuccess }: CreateAlertModalProps) {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'emergency' | 'maintenance' | 'weather' | 'health' | 'general'>('general');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'critical'>('info');
  const [affectedAreas, setAffectedAreas] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [requiresConfirmation, setRequiresConfirmation] = useState(true);
  const [error, setError] = useState('');

  const alertTypes = [
    { value: 'emergency', label: 'Emergency', icon: '🚨', color: 'red' },
    { value: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'orange' },
    { value: 'weather', label: 'Weather', icon: '⛈️', color: 'blue' },
    { value: 'health', label: 'Health', icon: '🏥', color: 'pink' },
    { value: 'general', label: 'General', icon: '📢', color: 'gray' },
  ];

  const severityLevels = [
    { value: 'info', label: 'Info', color: 'blue', description: 'General information' },
    { value: 'warning', label: 'Warning', color: 'orange', description: 'Important but not critical' },
    { value: 'critical', label: 'Critical', color: 'red', description: 'Urgent - requires attention' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!title.trim() || !message.trim()) {
        setError('Title and message are required');
        setLoading(false);
        return;
      }

      // Create alert via API
      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          type,
          severity,
          affectedAreas: affectedAreas.split(',').map(a => a.trim()).filter(a => a),
          startsAt: new Date().toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : null,
          requiresConfirmation,
          communityId: userData?.communityId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || 'Failed to create alert');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Create alert error:', error);
      setError(error.message || 'Failed to create alert');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                Create Alert
              </h2>
              <p className="text-gray-600 text-sm mt-1">Send emergency notifications to your community</p>
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

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alert Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Water Supply Interruption"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Detailed information about the alert..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              maxLength={1000}
            />
          </div>

          {/* Alert Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alert Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {alertTypes.map((alertType) => (
                <button
                  key={alertType.value}
                  type="button"
                  onClick={() => setType(alertType.value as any)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    type === alertType.value
                      ? `border-${alertType.color}-500 bg-${alertType.color}-50`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{alertType.icon}</div>
                  <div className="text-xs font-medium">{alertType.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Severity Level
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {severityLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setSeverity(level.value as any)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    severity === level.value
                      ? `border-${level.color}-500 bg-${level.color}-50`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="font-semibold">{level.label}</div>
                  <div className="text-xs text-gray-600">{level.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Affected Areas */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Affected Areas <span className="text-xs text-gray-500">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={affectedAreas}
              onChange={(e) => setAffectedAreas(e.target.value)}
              placeholder="e.g., Maddilapalem, MVP Colony, HB Colony"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to alert entire community</p>
          </div>

          {/* Ends At */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Alert Expires At <span className="text-xs text-gray-500">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Require Confirmation */}
          <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-xl">
            <input
              type="checkbox"
              id="confirm"
              checked={requiresConfirmation}
              onChange={(e) => setRequiresConfirmation(e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded"
            />
            <label htmlFor="confirm" className="flex-1 cursor-pointer">
              <p className="font-medium text-gray-800">Require user confirmation</p>
              <p className="text-sm text-gray-600">Users must acknowledge they've read this alert</p>
            </label>
          </div>

          {/* Warning Notice */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-900">
              <strong>⚠️ Important:</strong> This alert will be sent to all community members via WhatsApp and push notifications.
            </p>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  Send Alert
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
