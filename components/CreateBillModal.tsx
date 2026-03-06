'use client';

import { useState } from 'react';
import { X, Loader2, Receipt, Calendar, DollarSign } from 'lucide-react';
import { createBill } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface CreateBillModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateBillModal({ onClose, onSuccess }: CreateBillModalProps) {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [type, setType] = useState<'electricity' | 'garbage' | 'water' | 'property_tax' | 'custom'>('electricity');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [customTypeName, setCustomTypeName] = useState('');
  const [error, setError] = useState('');

  const billTypes = [
    { value: 'electricity', label: 'Electricity', icon: '⚡', color: 'yellow' },
    { value: 'garbage', label: 'Garbage', icon: '🗑️', color: 'green' },
    { value: 'water', label: 'Water', icon: '💧', color: 'blue' },
    { value: 'property_tax', label: 'Property Tax', icon: '🏠', color: 'purple' },
    { value: 'custom', label: 'Custom', icon: '📄', color: 'gray' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate
      if (!userId || !title || !amount || !dueDate) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const amountInPaise = Math.round(parseFloat(amount) * 100); // Convert to paise/cents
      if (isNaN(amountInPaise) || amountInPaise <= 0) {
        setError('Please enter a valid amount');
        setLoading(false);
        return;
      }

      // If custom type, use customTypeName as the title prefix
      const finalTitle = type === 'custom' && customTypeName
        ? `${customTypeName}: ${title}`
        : title;

      // Create bill via API
      const response = await fetch('/api/bills/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userName,
          type,
          title: finalTitle,
          description,
          amount: amountInPaise,
          currency: 'INR',
          dueDate: new Date(dueDate).toISOString(),
          period: {
            from: new Date().toISOString(),
            to: new Date(dueDate).toISOString(),
          },
          communityId: userData?.communityId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.message || 'Failed to create bill');
        setLoading(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Create bill error:', error);
      setError(error.message || 'Failed to create bill');
      setLoading(false);
    }
  };

  // Set default due date to 30 days from now
  useState(() => {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 30);
    setDueDate(defaultDue.toISOString().slice(0, 10));
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Receipt className="w-6 h-6 text-green-600" />
                Create Bill
              </h2>
              <p className="text-gray-600 text-sm mt-1">Generate utility bills for community members</p>
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

          {/* Bill Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bill Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {billTypes.map((billType) => (
                <button
                  key={billType.value}
                  type="button"
                  onClick={() => setType(billType.value as any)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    type === billType.value
                      ? `border-${billType.color}-500 bg-${billType.color}-50`
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{billType.icon}</div>
                  <div className="text-xs font-medium">{billType.label}</div>
                </button>
              ))}
            </div>
            {type === 'custom' && (
              <input
                type="text"
                value={customTypeName}
                onChange={(e) => setCustomTypeName(e.target.value)}
                placeholder="Custom bill type name (e.g., Maintenance Fee)"
                className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            )}
          </div>

          {/* User Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              User Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => {
                setUserId(e.target.value);
                // Auto-populate name from phone
                if (e.target.value === '+919999999999') {
                  setUserName('Test User');
                } else if (e.target.value === '+9182227194') {
                  setUserName('Shyam Dasari');
                }
              }}
              placeholder="+91XXXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Enter the user's phone number with country code</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bill Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., March 2026 Electricity Bill"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional details about the bill..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              maxLength={500}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Due Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Info Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-900">
              <strong>💡 Info:</strong> The user will be able to pay this bill using Razorpay (credit/debit cards, UPI, netbanking).
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Receipt className="w-5 h-5" />
                  Create Bill
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
