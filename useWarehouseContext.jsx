import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const WarehouseContext = createContext();

export const useWarehouse = () => {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within WarehouseProvider');
  }
  return context;
};

export const WarehouseProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  // Auth functions
  const login = async (email, password) => {
    try {
      const usersData = await import('../data/users.json');
      const foundUser = usersData.users.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        playSound('success');
        toast.success(`Welcome back, ${foundUser.name}!`);
        navigate('/dashboard');
        return true;
      } else {
        playSound('error');
        toast.error('Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed');
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // XP and Level Management
  const addXP = (amount, reason) => {
    if (!user) return;

    const newXP = user.xp + amount;
    const newUser = { ...user, xp: newXP };

    // Check for level up
    if (newXP >= user.xpToNextLevel) {
      newUser.level += 1;
      newUser.xp = newXP - user.xpToNextLevel;
      newUser.xpToNextLevel = calculateXPForNextLevel(newUser.level);
      
      playSound('levelUp');
      toast.success(
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-bold">Level Up!</p>
            <p className="text-sm">You're now Level {newUser.level}</p>
          </div>
        </div>,
        { duration: 5000 }
      );
    } else {
      toast.success(
        <div className="flex items-center space-x-2">
          <span className="text-xl">✨</span>
          <div>
            <p className="font-bold">+{amount} XP</p>
            <p className="text-sm">{reason}</p>
          </div>
        </div>,
        { duration: 2000 }
      );
    }

    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const calculateXPForNextLevel = (level) => {
    return Math.floor(1000 * Math.pow(1.5, level - 1));
  };

  // Sound Management
  const playSound = (type) => {
    try {
      const soundMap = {
        success: '/src/assets/sounds/pick-success.mp3',
        error: '/src/assets/sounds/error-buzz.mp3',
        levelUp: '/src/assets/sounds/level-up.mp3',
        scan: '/src/assets/sounds/scan-beep.mp3',
        achievement: '/src/assets/sounds/achievement-unlock.mp3',
        packComplete: '/src/assets/sounds/pack-complete.mp3'
      };

      const audio = new Audio(soundMap[type]);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (error) {
      console.log('Sound playback error:', error);
    }
  };

  // Achievement Management
  const unlockAchievement = async (achievementId) => {
    if (!user || user.achievements.includes(achievementId)) return;

    try {
      const achievementsData = await import('../data/achievements.json');
      const achievement = achievementsData.achievements.find(a => a.id === achievementId);

      if (achievement) {
        const newUser = {
          ...user,
          achievements: [...user.achievements, achievementId]
        };

        setUser(newUser);
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        playSound('achievement');
        toast.success(
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{achievement.icon}</span>
            <div>
              <p className="font-bold">Achievement Unlocked!</p>
              <p className="text-sm">{achievement.name}</p>
              <p className="text-xs text-primary">+{achievement.xpReward} XP</p>
            </div>
          </div>,
          { duration: 5000 }
        );

        addXP(achievement.xpReward, `Achievement: ${achievement.name}`);
      }
    } catch (error) {
      console.error('Achievement unlock error:', error);
    }
  };

  // Notification Management
  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 10));
  };

  // Stats Update
  const updateStats = (statUpdate) => {
    if (!user) return;

    const newUser = {
      ...user,
      stats: {
        ...user.stats,
        ...statUpdate
      }
    };

    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const value = {
    user,
    loading,
    notifications,
    activeOrder,
    setActiveOrder,
    login,
    logout,
    addXP,
    playSound,
    unlockAchievement,
    addNotification,
    updateStats
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
};