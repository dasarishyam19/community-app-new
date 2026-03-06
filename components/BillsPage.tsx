'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Receipt, CreditCard, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { getUserBills } from '@/lib/firebase/firestore';
import type { Bill } from '@/types/database';

export default function BillsPage() {
  const { userData } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

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
    alert(`Payment integration for bill ${bill.id} coming soon! Amount: ₹${bill.amount / 100}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
      </div>
    );
  }

  const pendingBills = bills.filter(b => b.status === 'pending');
  const totalPending = pendingBills.reduce((sum, bill) => sum + bill.amount, 0) / 100;

  return (
    <div className="pb-20 md:pb-0 md:pl-72">
      {/* Summary Card */}
      {pendingBills.length > 0 && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg p-6 mb-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Pending Amount</p>
              <p className="text-2xl font-bold">₹{totalPending.toFixed(2)}</p>
            </div>
            <Receipt className="w-10 h-10 text-green-200" />
          </div>
        </div>
      )}

      {/* Bills List */}
      {bills.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
          <Receipt className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Bills Yet</h3>
          <p className="text-gray-600 dark:text-gray-400">You don't have any bills at the moment</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bills.map((bill) => (
            <BillCard key={bill.id} bill={bill} onPay={handlePayBill} />
          ))}
        </div>
      )}
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
      pending: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
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
    <div className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden ${isOverdue ? 'border-2 border-red-500' : ''}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getTypeIcon(bill.type)}</div>
            <div>
              <h3 className="text-base font-bold text-gray-800 dark:text-white">{bill.title}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{bill.type.replace('_', ' ').toUpperCase()}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(bill.status)}`}>
            {bill.status}
          </span>
        </div>

        {/* Description */}
        {bill.description && (
          <p className="text-gray-700 dark:text-gray-300 mb-3 text-sm">{bill.description}</p>
        )}

        {/* Amount & Due Date */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Amount</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">₹{amount.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Due Date</p>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                {new Date(bill.dueDate.toDate()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Warning for overdue */}
        {isOverdue && (
          <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl mb-3">
            <AlertCircle className="w-4 h-4" />
            <p className="text-xs font-medium">This bill is overdue. Please pay immediately.</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isPending ? (
            <button
              onClick={() => onPay(bill)}
              className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm"
            >
              <CreditCard className="w-4 h-4" />
              Pay Now
            </button>
          ) : bill.status === 'paid' ? (
            <div className="flex-1 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm">
              <CheckCircle className="w-4 h-4" />
              Paid
            </div>
          ) : (
            <div className="flex-1 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl flex items-center justify-center gap-2 font-semibold text-sm">
              {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
