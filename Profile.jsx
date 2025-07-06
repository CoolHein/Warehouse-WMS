import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Award, 
  TrendingUp, 
  Calendar,
  Target,
  Zap,
  Star,
  Trophy,
  ChevronRight,
  Clock,
  BarChart3,
  Flame,
  Medal,
  Crown,
  Gift,
  Sparkles,
  Eye,
  Lock
} from 'lucide-react';

// Mock data for demo purposes
const mockUser = {
  name: "Alex Chen",
  email: "alex.chen@warehouse.com",
  avatar: "👨‍💼",
  role: "Senior Picker",
  department: "Fulfillment",
  level: 42,
  xp: 750,
  xpToNextLevel: 1000,
  achievements: ["speed-demon", "accuracy-king", "perfect-week", "team-player"],
  stats: {
    ordersProcessed: 1247,
    itemsPicked: 8934,
    itemsPacked: 2156,
    accuracy: 99.7,
    averagePickTime: 12.3
  },
  joinDate: "2023-03-15"
};

const mockAchievements = [
  { id: "speed-demon", name: "Speed Demon", icon: "⚡", rarity: "legendary", xpReward: 500, description: "Complete 100 orders in under 10 seconds each", category: "speed" },
  { id: "accuracy-king", name: "Accuracy King", icon: "🎯", rarity: "rare", xpReward: 300, description: "Maintain 99%+ accuracy for 30 days", category: "accuracy" },
  { id: "perfect-week", name: "Perfect Week", icon: "⭐", rarity: "uncommon", xpReward: 200, description: "Complete a full week with no errors", category: "consistency" },
  { id: "team-player", name: "Team Player", icon: "🤝", rarity: "common", xpReward: 100, description: "Help 50 colleagues with tasks", category: "teamwork" },
  { id: "marathon-runner", name: "Marathon Runner", icon: "🏃", rarity: "rare", xpReward: 350, description: "Work 12 hours straight without breaks", category: "endurance" },
  { id: "innovator", name: "Innovator", icon: "💡", rarity: "legendary", xpReward: 750, description: "Suggest 10 process improvements", category: "innovation" },
  { id: "mentor", name: "Mentor", icon: "🎓", rarity: "uncommon", xpReward: 250, description: "Train 5 new employees", category: "leadership" },
  { id: "night-owl", name: "Night Owl", icon: "🦉", rarity: "common", xpReward: 150, description: "Complete 20 night shifts", category: "dedication" }
];

const mockStats = {
  totalXP: 41750,
  daysActive: 156,
  avgXPPerDay: 268,
  bestStreak: 28,
  currentStreak: 12,
  totalAchievements: 8,
  unlockedAchievements: 4,
  weeklyXP: [120, 280, 340, 290, 410, 380, 320],
  monthlyProgress: 78
};

const mockRecentActivity = [
  { action: 'Completed Order #ORD-2025-004', xp: 30, time: '2 hours ago', type: 'order' },
  { action: 'Perfect Pick Streak x15', xp: 75, time: '3 hours ago', type: 'streak' },
  { action: 'Achievement Unlocked: Speed Demon', xp: 500, time: '5 hours ago', type: 'achievement' },
  { action: 'Stock Count Completed', xp: 15, time: '6 hours ago', type: 'task' },
  { action: 'Helped teammate with complex pick', xp: 25, time: 'Yesterday', type: 'teamwork' }
];

const AchievementBadge = ({ achievement, size = 'normal', unlocked = true, showDetails = false }) => {
  const sizeClasses = {
    small: 'w-12 h-12 text-2xl',
    normal: 'w-16 h-16 text-3xl',
    large: 'w-24 h-24 text-5xl'
  };

  const rarityColors = {
    common: 'from-gray-400 to-gray-600',
    uncommon: 'from-green-400 to-green-600',
    rare: 'from-blue-400 to-blue-600',
    legendary: 'from-purple-400 via-pink-500 to-yellow-500'
  };

  const rarityGlow = {
    common: 'shadow-gray-500/20',
    uncommon: 'shadow-green-500/30',
    rare: 'shadow-blue-500/40',
    legendary: 'shadow-purple-500/50'
  };

  return (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`relative rounded-full flex items-center justify-center text-white font-bold ${sizeClasses[size]} ${rarityGlow[achievement.rarity]}`}
        style={{
          filter: unlocked ? 'none' : 'grayscale(100%) brightness(0.4)',
        }}
        whileHover={{
          boxShadow: unlocked ? '0 0 30px rgba(59, 130, 246, 0.6)' : '0 0 15px rgba(255, 255, 255, 0.1)'
        }}
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]} opacity-90`}
        />
        <div className="absolute inset-1 rounded-full bg-gray-900/80 backdrop-blur-sm" />
        <div className="relative z-10 text-center">
          <div className="text-3xl">{achievement.icon}</div>
        </div>
        
        {unlocked && achievement.rarity === 'legendary' && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-yellow-400/60"
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
            }}
          />
        )}
        
        {!unlocked && (
          <div className="absolute inset-0 rounded-full bg-gray-900/60 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-6 h-6 text-gray-400" />
          </div>
        )}
      </motion.div>
      
      {showDetails && (
        <motion.div
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700 rounded-lg p-3 min-w-[200px] z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          initial={{ opacity: 0, y: -10 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          <h4 className="font-semibold text-white">{achievement.name}</h4>
          <p className="text-xs text-gray-300 mt-1">{achievement.description}</p>
          <div className="flex items-center justify-between mt-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              achievement.rarity === 'legendary' ? 'bg-purple-500/20 text-purple-300' :
              achievement.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
              achievement.rarity === 'uncommon' ? 'bg-green-500/20 text-green-300' :
              'bg-gray-500/20 text-gray-300'
            }`}>
              {achievement.rarity}
            </span>
            <span className="text-xs text-primary font-medium">+{achievement.xpReward} XP</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, value, label, trend, delay = 0, color = "primary" }) => {
  const colorClasses = {
    primary: "text-blue-400",
    success: "text-green-400",
    warning: "text-yellow-400",
    purple: "text-purple-400"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className="relative group"
    >
      <div className="glass-card p-6 rounded-xl text-center relative overflow-hidden hover:bg-white/10 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Icon className={`mx-auto mb-3 ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`} size={32} />
        <motion.p 
          className="text-3xl font-bold mb-1"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2, type: "spring", stiffness: 200 }}
        >
          {value}
        </motion.p>
        <p className="text-sm text-gray-400">{label}</p>
        {trend && (
          <motion.div 
            className="absolute top-2 right-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.4 }}
          >
            <span className={`text-xs px-2 py-1 rounded-full ${
              trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const XPProgressBar = ({ current, max, level }) => {
  const percentage = (current / max) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Level {level} Progress</span>
        <span className="text-sm text-gray-400">{current}/{max} XP</span>
      </div>
      <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
      </div>
    </div>
  );
};

const Profile = () => {
  const [user] = useState(mockUser);
  const [achievements] = useState(mockAchievements);
  const [stats] = useState(mockStats);
  const [selectedAchievementCategory, setSelectedAchievementCategory] = useState('all');
  const [showAchievementDetails, setShowAchievementDetails] = useState(false);

  const categories = ['all', 'speed', 'accuracy', 'consistency', 'teamwork', 'leadership'];
  
  const filteredAchievements = selectedAchievementCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedAchievementCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div 
      className="max-w-7xl mx-auto space-y-8 p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Profile Header */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden"
      >
        <div className="glass-card p-8 rounded-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10" />
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8 mb-8">
              <motion.div 
                className="text-8xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {user.avatar}
              </motion.div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <motion.h1 
                    className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {user.name}
                  </motion.h1>
                  <motion.p 
                    className="text-gray-400 text-lg"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {user.email}
                  </motion.p>
                </div>
                
                <motion.div 
                  className="flex flex-wrap items-center gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30">
                    {user.role}
                  </span>
                  <span className="px-4 py-2 bg-gray-500/20 text-gray-300 rounded-full text-sm border border-gray-500/30">
                    {user.department}
                  </span>
                  <span className="text-sm text-gray-400 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined March 2023
                  </span>
                </motion.div>
              </div>
              
              <motion.div 
                className="text-center lg:text-right"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <div className="relative">
                  <motion.div 
                    className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
                    whileHover={{ scale: 1.05 }}
                  >
                    {user.level}
                  </motion.div>
                  <p className="text-sm text-gray-400 font-medium">Level</p>
                  <motion.div
                    className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            </div>

            <XPProgressBar 
              current={user.xp} 
              max={user.xpToNextLevel} 
              level={user.level} 
            />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
        variants={itemVariants}
      >
        <StatCard 
          icon={TrendingUp} 
          value={stats.totalXP.toLocaleString()} 
          label="Total XP" 
          trend={12}
          delay={0.1}
          color="primary"
        />
        <StatCard 
          icon={Flame} 
          value={stats.currentStreak} 
          label="Current Streak" 
          trend={8}
          delay={0.2}
          color="warning"
        />
        <StatCard 
          icon={Calendar} 
          value={stats.daysActive} 
          label="Days Active" 
          delay={0.3}
          color="success"
        />
        <StatCard 
          icon={Trophy} 
          value={`${stats.unlockedAchievements}/${stats.totalAchievements}`} 
          label="Achievements" 
          delay={0.4}
          color="purple"
        />
      </motion.div>

      {/* Performance Dashboard */}
      <motion.div
        variants={itemVariants}
        className="grid lg:grid-cols-3 gap-8"
      >
        {/* Performance Stats */}
        <div className="lg:col-span-2">
          <motion.div
            className="glass-card p-6 rounded-xl h-full"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold flex items-center">
                <BarChart3 className="mr-3 text-blue-400" />
                Performance Dashboard
              </h2>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                ↗ +15% this week
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[
                { label: "Orders Processed", value: user.stats.ordersProcessed, suffix: "", color: "text-blue-400" },
                { label: "Items Picked", value: user.stats.itemsPicked, suffix: "", color: "text-green-400" },
                { label: "Items Packed", value: user.stats.itemsPacked, suffix: "", color: "text-purple-400" },
                { label: "Accuracy Rate", value: user.stats.accuracy, suffix: "%", color: "text-yellow-400" },
                { label: "Avg Pick Time", value: user.stats.averagePickTime, suffix: "s", color: "text-pink-400" },
                { label: "Daily XP Avg", value: stats.avgXPPerDay, suffix: "", color: "text-cyan-400" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-200"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-sm text-gray-400 mb-2">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}{stat.suffix}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <motion.div 
            className="glass-card p-6 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="mr-2 text-green-400" />
              This Week
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">XP Earned</span>
                <span className="font-bold text-green-400">+1,840</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Best Day</span>
                <span className="font-bold">Tuesday</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Rank</span>
                <span className="font-bold text-yellow-400">#3 in team</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="glass-card p-6 rounded-xl"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="mr-2 text-purple-400" />
              Next Goals
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Next Level</span>
                <span className="text-sm font-medium">{user.xpToNextLevel - user.xp} XP</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(user.xp / user.xpToNextLevel) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Achievements Section */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 rounded-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center mb-4 sm:mb-0">
            <Award className="mr-3 text-yellow-400" />
            Achievements Gallery
          </h2>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAchievementDetails(!showAchievementDetails)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-sm">{showAchievementDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedAchievementCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedAchievementCategory === category
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          <AnimatePresence mode="wait">
            {filteredAchievements.map((achievement, index) => {
              const isUnlocked = user.achievements?.includes(achievement.id);
              return (
                <motion.div
                  key={achievement.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  className="text-center"
                >
                  <AchievementBadge 
                    achievement={achievement} 
                    unlocked={isUnlocked}
                    showDetails={showAchievementDetails}
                    size="large"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 + 0.2 }}
                  >
                    <p className="text-sm mt-2 font-medium truncate">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-blue-400 font-medium">
                      +{achievement.xpReward} XP
                    </p>
                    {!isUnlocked && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {achievement.description}
                      </p>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Achievement Progress */}
        <div className="mt-8 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Achievement Progress</span>
            <span className="text-sm text-gray-400">
              {stats.unlockedAchievements}/{stats.totalAchievements} unlocked
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div 
              className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(stats.unlockedAchievements / stats.totalAchievements) * 100}%` }}
              transition={{ duration: 1.5, delay: 0.5 }}
            />
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        variants={itemVariants}
        className="glass-card p-6 rounded-xl"
      >
        <h2 className="text-2xl font-semibold mb-6 flex items-center">
          <Clock className="mr-3 text-green-400" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {mockRecentActivity.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-3 h-3 rounded-full ${
                  activity.type === 'achievement' ? 'bg-yellow-400' :
                  activity.type === 'streak' ? 'bg-orange-400' :
                  activity.type === 'order' ? 'bg-blue-400' :
                  activity.type === 'teamwork' ? 'bg-purple-400' :
                  'bg-green-400'
                }`} />
                <div>
                  <p className="font-medium group-hover:text-white transition-colors">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
              <motion.span 
                className="text-sm font-bold text-blue-400 flex items-center"
                whileHover={{ scale: 1.1 }}
              >
                +{activity.xp} XP
                <ChevronRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Profile;