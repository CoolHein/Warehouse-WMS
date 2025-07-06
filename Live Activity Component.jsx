// components/LiveActivityFeed.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Bell, X, Filter, RefreshCw } from 'lucide-react';
import { useActivityLogger, formatActivity, ACTIVITY_TYPES } from '../hooks/useActivityLogger';

const LiveActivityFeed = ({ 
  limit = 10, 
  showFilters = true, 
  compact = false,
  autoRefresh = true,
  refreshInterval = 5000 
}) => {
  const { getRecentActivities } = useActivityLogger();
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const loadActivities = () => {
    const recent = getRecentActivities(limit);
    const formatted = recent.map(formatActivity);
    
    // Apply filter
    if (filter !== 'all') {
      const filtered = formatted.filter(a => a.type === filter);
      setActivities(filtered);
    } else {
      setActivities(formatted);
    }
  };

  useEffect(() => {
    loadActivities();

    // Listen for activity updates
    const handleActivityUpdate = () => {
      loadActivities();
    };

    window.addEventListener('warehouseActivityUpdate', handleActivityUpdate);
    window.addEventListener('storage', handleActivityUpdate);

    // Auto refresh
    let interval;
    if (autoRefresh) {
      interval = setInterval(loadActivities, refreshInterval);
    }

    return () => {
      window.removeEventListener('warehouseActivityUpdate', handleActivityUpdate);
      window.removeEventListener('storage', handleActivityUpdate);
      if (interval) clearInterval(interval);
    };
  }, [filter, limit]);

  const handleRefresh = () => {
    setIsLoading(true);
    loadActivities();
    setTimeout(() => setIsLoading(false), 500);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-center text-gray-500 text-sm py-2">No recent activity</p>
        ) : (
          activities.slice(0, 5).map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center space-x-2 text-sm"
            >
              <span className="text-lg">{activity.icon}</span>
              <span className="text-gray-400">{activity.user}</span>
              <span className="text-gray-500">{activity.action}</span>
              <span className={activity.color}>{activity.item}</span>
              <span className="text-xs text-gray-600 ml-auto">{activity.formattedTime}</span>
            </motion.div>
          ))
        )}
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Activity className="mr-2" size={20} />
          Live Warehouse Activity
        </h3>
        <div className="flex items-center space-x-2">
          {showFilters && (
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm bg-dark-200 border border-white/10 rounded-lg px-3 py-1"
            >
              <option value="all">All Activities</option>
              {Object.entries(ACTIVITY_TYPES).map(([key, config]) => (
                <option key={key} value={config.type}>
                  {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <motion.div
              animate={{ rotate: isLoading ? 360 : 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0 }}
            >
              <RefreshCw size={16} />
            </motion.div>
          </motion.button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {activities.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-gray-500 py-8"
            >
              No {filter === 'all' ? '' : filter} activities found
            </motion.p>
          ) : (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <motion.div 
                    className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-lg"
                    whileHover={{ scale: 1.1 }}
                  >
                    {activity.icon}
                  </motion.div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      <span className="text-gray-400"> {activity.action} </span>
                      <span className={activity.color}>{activity.item}</span>
                    </p>
                    {activity.itemDetails && (
                      <p className="text-xs text-gray-500">{activity.itemDetails}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {activity.formattedTime}
                  </span>
                  {activity.priority === 'high' && (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {activities.length >= limit && (
        <div className="mt-4 text-center">
          <button className="text-sm text-primary hover:text-primary-dark">
            View all activities →
          </button>
        </div>
      )}
    </div>
  );
};

// Mini activity indicator for navbar
export const ActivityIndicator = () => {
  const { getRecentActivities } = useActivityLogger();
  const [hasNewActivity, setHasNewActivity] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());

  useEffect(() => {
    const checkNewActivity = () => {
      const activities = getRecentActivities(1);
      if (activities.length > 0) {
        const latestActivity = new Date(activities[0].timestamp).getTime();
        if (latestActivity > lastCheckTime) {
          setHasNewActivity(true);
          setTimeout(() => setHasNewActivity(false), 5000);
        }
      }
    };

    checkNewActivity();
    const interval = setInterval(checkNewActivity, 5000);

    window.addEventListener('warehouseActivityUpdate', checkNewActivity);

    return () => {
      clearInterval(interval);
      window.removeEventListener('warehouseActivityUpdate', checkNewActivity);
    };
  }, [lastCheckTime]);

  return (
    <AnimatePresence>
      {hasNewActivity && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -top-1 -right-1 w-3 h-3"
        >
          <span className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
          <span className="relative block w-3 h-3 bg-green-500 rounded-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Activity Summary Widget
export const ActivitySummary = ({ period = 'today' }) => {
  const { getRecentActivities } = useActivityLogger();
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const calculateSummary = () => {
      const activities = getRecentActivities(100); // Get more for summary
      const now = new Date();
      let filteredActivities = activities;

      // Filter by period
      if (period === 'today') {
        filteredActivities = activities.filter(a => {
          const activityDate = new Date(a.timestamp);
          return activityDate.toDateString() === now.toDateString();
        });
      } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredActivities = activities.filter(a => new Date(a.timestamp) > weekAgo);
      }

      // Count by type
      const counts = {};
      filteredActivities.forEach(activity => {
        counts[activity.type] = (counts[activity.type] || 0) + 1;
      });

      setSummary(counts);
    };

    calculateSummary();
    const interval = setInterval(calculateSummary, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, [period]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(ACTIVITY_TYPES).slice(0, 4).map(([key, config]) => {
        const count = summary[config.type] || 0;
        return (
          <motion.div
            key={key}
            whileHover={{ scale: 1.05 }}
            className="bg-dark-200 p-4 rounded-lg text-center"
          >
            <div className="text-2xl mb-2">{config.icon}</div>
            <div className="text-2xl font-bold text-white">{count}</div>
            <div className="text-xs text-gray-400">
              {key.replace(/_/g, ' ').toLowerCase()}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LiveActivityFeed;