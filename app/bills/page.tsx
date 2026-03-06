'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2, Receipt, ArrowLeft, CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { getUserBills, getPendingBills } from '@/lib/firestore';
import type { Bill } from '@/types/database';
import Logo from '@/components/Logo';

export default function BillsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !userData) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    const loadBills = async () => {
      if (userData?.id) {
        try {
          const userBills = await getUserBills(userData.id);
          setBills(userBills);
        } catch (error) {
          console.error('Error loading bills:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadBills();
  }, [userData]);

  const handlePayBill = (bill: Bill) => {
    // TODO: Integrate Razorpay
    alert(`Payment integration for bill ${bill.id} coming soon! Amount: ₹${bill.amount / 100}`);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    );
  }

  // Calculate total pending amount
  const pendingBills = bills.filter(b => b.status === 'pending');
  const totalPending = pendingBills.reduce((sum, bill) => sum + bill.amount, 0) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
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
              <h1 className="text-xl font-bold text-gray-800">My Bills</h1>
              <p className="text-xs text-gray-600">{pendingBills.length} pending</p>
            </div>
          </div>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Summary Card */}
        {pendingBills.length > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-xl p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Pending Amount</p>
                <p className="text-3xl font-bold">₹{totalPending.toFixed(2)}</p>
              </div>
              <Receipt className="w-12 h-12 text-green-200" />
            </div>
          </div>
        )}

        {/* Bills List */}
        {bills.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No Bills Yet</h3>
            <p className="text-gray-600">You don't have any bills at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <BillCard key={bill.id} bill={bill} onPay={handlePayBill} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface BillCardProps {
  bill: Bill;
  onPay: (bill: Bill) => void;
}

function BillCard({ bill, onPay }: BillCardProps) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-700',
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || colors.pending;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      electricity: '⚡',
      garbage: '🗑️',
      water: '💧',
      property_tax: '🏠',
      custom: '📄',
    };
    return icons[type] || '📄';
  };

  const isPending = bill.status === 'pending';
  const isOverdue = bill.status === 'overdue';
  const amount = bill.amount / 100;

  return (
    <div className={`bg-white rounded-2xl shadow-xl overflow-hidden ${isOverdue ? 'border-2 border-red-500' : ''}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getTypeIcon(bill.type)}</div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{bill.title}</h3>
              <p className="text-sm text-gray-600">{bill.type.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(bill.status)}`}>
            {bill.status}
          </span>
        </div>

        {/* Description */}
        {bill.description && (
          <p className="text-gray-700 mb-4">{bill.description}</p>
        )}

        {/* Amount & Due Date */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Amount</p>
            <p className="text-2xl font-bold text-gray-900">₹{amount.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Due Date</p>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                {new Date(bill.dueDate.toDate()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Warning for overdue */}
        {isOverdue && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl mb-4">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm font-medium">This bill is overdue. Please pay immediately.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {isPending ? (
            <button
              onClick={() => onPay(bill)}
              className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold"
            >
              <CreditCard className="w-5 h-5" />
              Pay Now
            </button>
          ) : bill.status === 'paid' ? (
            <div className="flex-1 py-3 bg-green-50 text-green-700 rounded-xl flex items-center justify-center gap-2 font-semibold">
              <CheckCircle className="w-5 h-5" />
              Paid
            </div>
          ) : (
            <div className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center gap-2 font-semibold">
              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
