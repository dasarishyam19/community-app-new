'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, AlertCircle, Info, Shield, Bell } from 'lucide-react';
import { getCommunityAlerts } from '@/lib/firebase/firestore';
import type { Alert } from '@/types/database';

export default function AlertsPage() {
  const { userData } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAlerts = async () => {
      if (userData?.communityId) {
        try {
          const communityAlerts = await getCommunityAlerts(userData.communityId, 50);
          setAlerts(communityAlerts);
        } catch (error) {
          console.error('Error loading alerts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAlerts();
  }, [userData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500"></div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center">
        <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">No Alerts</h3>
        <p className="text-gray-600 dark:text-gray-400">No active alerts in your community</p>
      </div>
    );
  }

  const activeAlerts = alerts.filter(a => a.isActive);
  const inactiveAlerts = alerts.filter(a => !a.isActive);

  return (
    <div className="pb-20 md:pb-0 md:pl-72 space-y-4">
      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white px-1">Active Alerts</h2>
          {activeAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}

      {/* Past Alerts */}
      {inactiveAlerts.length > 0 && (
        <div className="space-y-4 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white px-1">Past Alerts</h2>
          {inactiveAlerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}

interface AlertCardProps {
  alert: Alert;
}

function AlertCard({ alert }: AlertCardProps) {
  const getSeverityColor = (severity: string) => {
    const colors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
      low: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-300 dark:border-blue-600',
        text: 'text-blue-700 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-800'
      },
      medium: {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-300 dark:border-yellow-600',
        text: 'text-yellow-700 dark:text-yellow-400',
        iconBg: 'bg-yellow-100 dark:bg-yellow-800'
      },
      high: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-300 dark:border-orange-600',
        text: 'text-orange-700 dark:text-orange-400',
        iconBg: 'bg-orange-100 dark:bg-orange-800'
      },
      critical: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-500 dark:border-red-600',
        text: 'text-red-700 dark:text-red-400',
        iconBg: 'bg-red-100 dark:bg-red-800'
      },
    };
    return colors[severity] || colors.low;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      emergency: AlertTriangle,
      maintenance: AlertCircle,
      security: Shield,
      general: Info,
    };
    return icons[type] || Info;
  };

  const severity = getSeverityColor(alert.severity);
  const Icon = getTypeIcon(alert.type);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border-l-4 ${severity.border} ${
      !alert.isActive ? 'opacity-60' : ''
    }`}>
      <div className={`${severity.bg} p-4`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-full ${severity.iconBg}`}>
            <Icon className={`w-5 h-5 ${severity.text}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">{alert.title}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold">
                  {alert.type} • {alert.severity}
                </p>
              </div>
              {!alert.isActive && (
                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  Resolved
                </span>
              )}
            </div>

            {alert.description && (
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">{alert.description}</p>
            )}

            {alert.affectedAreas && alert.affectedAreas.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {alert.affectedAreas.map((area, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-white dark:bg-gray-700 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>
                {new Date(alert.createdAt.toDate()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {alert.createdBy && (
                <span>By {alert.createdBy}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
