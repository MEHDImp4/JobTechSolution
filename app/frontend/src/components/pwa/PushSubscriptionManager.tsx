import React, { useEffect, useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import {
  subscribeUserToPush,
  unsubscribeUserFromPush,
  getPushSubscription,
  isPushNotificationsConfigured,
} from '../../lib/pushNotifications';
import { toast } from 'react-hot-toast';

const PushSubscriptionManager: React.FC = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const pushConfigured = isPushNotificationsConfigured();

  useEffect(() => {
    async function checkSubscription() {
      try {
        const sub = await getPushSubscription();
        setIsSubscribed(!!sub);
      } catch (err) {
        console.error('Error checking push subscription', err);
      } finally {
        setLoading(false);
      }
    }
    checkSubscription();
  }, []);

  const handleToggleSubscription = async () => {
    setActionLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeUserFromPush();
        setIsSubscribed(false);
        toast.success('Notifications désactivées');
      } else {
        await subscribeUserToPush();
        setIsSubscribed(true);
        toast.success('Notifications activées');
      }
    } catch (err: unknown) {
      console.error('Push subscription error:', err);
      const message = err instanceof Error ? err.message : 'Erreur lors de la configuration des notifications';
      toast.error(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loader2 className="animate-spin h-5 w-5 text-gray-400" />;
  }

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${isSubscribed ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
          {isSubscribed ? <Bell size={20} /> : <BellOff size={20} />}
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Notifications Push
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {!pushConfigured
              ? 'Notifications indisponibles: clé VAPID publique non configurée.'
              : isSubscribed 
              ? 'Vous recevrez des alertes pour vos entretiens et messages.' 
              : 'Activez les notifications pour rester informé en temps réel.'}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggleSubscription}
        disabled={actionLoading || !pushConfigured}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          isSubscribed
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {actionLoading ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : isSubscribed ? (
          'Désactiver'
        ) : (
          'Activer'
        )}
      </button>
    </div>
  );
};

export default PushSubscriptionManager;
