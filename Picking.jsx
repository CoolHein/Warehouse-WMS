import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  Target,
  ChevronRight,
  ArrowRight,
  PackageCheck,
  Navigation,
  Route,
  Timer,
  ArrowLeft,
  Play,
  Pause,
  BarChart3,
  Award,
  Sparkles
} from 'lucide-react';

// Mock warehouse context
const useWarehouse = () => ({
  user: { 
    id: 'user-1',
    name: "Alex Chen", 
    stats: { ordersProcessed: 45, itemsPicked: 234 }
  },
  addXP: (amount, reason) => console.log(`+${amount} XP: ${reason}`),
  playSound: (type) => console.log(`Playing ${type} sound`),
  updateStats: (stats) => console.log('Updating stats:', stats),
  unlockAchievement: (id) => console.log('Achievement unlocked:', id)
});

// Date formatting utility
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Confetti component for celebrations
const Confetti = ({ active }) => {
  if (!active) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][i % 5],
            left: `${Math.random() * 100}%`,
            top: '-10px'
          }}
          initial={{ y: -10, opacity: 1, rotate: 0 }}
          animate={{ 
            y: window.innerHeight + 10, 
            opacity: 0, 
            rotate: 360,
            x: (Math.random() - 0.5) * 200
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
        />
      ))}
    </div>
  );
};

// Animated XP counter
const AnimatedCounter = ({ target, duration = 2000, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    
    return () => clearInterval(timer);
  }, [target, duration]);
  
  return <span>{prefix}{count}{suffix}</span>;
};

// Scan Input Component
const ScanInput = ({ onScan, placeholder, expectedValue, autoFocus, disabled }) => {
  const [value, setValue] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !disabled) {
      if (expectedValue && value.trim() !== expectedValue) {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
      }
      onScan(value.trim());
      setValue('');
    }
  };

  useEffect(() => {
    if (autoFocus && !disabled) {
      inputRef.current?.focus();
    }
  }, [autoFocus, disabled]);

  return (
    <motion.div
      animate={isShaking ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <div className="relative">
        <Target className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
          isShaking ? 'text-red-400' : 'text-blue-400'
        }`} size={24} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-12 pr-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 text-lg font-mono ${
            isShaking 
              ? 'border-red-500 bg-red-500/10' 
              : 'border-gray-700 focus:border-blue-500'
          }`}
        />
        {!disabled && (
          <motion.div
            className="absolute right-4 top-1/2 transform -translate-y-1/2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Order Card Component
const OrderCard = ({ order, onClick, layoutId }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 bg-red-500/10';
      case 'urgent': return 'border-red-600/50 bg-red-600/10';
      default: return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  const getShippingIcon = (method) => {
    return method === 'express' ? '⚡' : '📦';
  };

  return (
    <motion.div
      layoutId={layoutId}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`glass-card p-6 rounded-xl cursor-pointer relative overflow-hidden border ${getPriorityColor(order.priority)}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <motion.h3 
              layoutId={`${layoutId}-title`}
              className="text-xl font-bold"
            >
              {order.id}
            </motion.h3>
            <p className="text-gray-400">{order.customer.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getShippingIcon(order.shippingMethod)}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              order.priority === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {order.priority}
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-400">
            <Package size={16} className="mr-2 text-blue-400" />
            {order.items.length} items ({order.items.reduce((sum, item) => sum + item.quantity, 0)} units)
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <MapPin size={16} className="mr-2 text-green-400" />
            {order.shippingAddress.city}, {order.shippingAddress.country}
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <Clock size={16} className="mr-2 text-yellow-400" />
            Ready for {Math.floor((Date.now() - new Date(order.readyAt).getTime()) / (1000 * 60))} minutes
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center"
        >
          <Play className="mr-2" size={16} />
          Start Picking
        </motion.button>
      </div>
    </motion.div>
  );
};

// Route Optimizer Component
const RouteOptimizer = ({ items, currentZone }) => {
  const getOptimalRoute = (items) => {
    const zones = [...new Set(items.map(item => item.location.split('-')[0]))].sort();
    return zones;
  };

  const route = getOptimalRoute(items);
  const currentZoneIndex = route.indexOf(currentZone);

  return (
    <div className="glass-card p-4 rounded-xl mb-6">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold flex items-center">
          <Route className="mr-2 text-blue-400" size={18} />
          Optimized Route
        </h4>
        <span className="text-xs text-gray-400">Most Efficient Path</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {route.map((zone, index) => (
          <React.Fragment key={zone}>
            <motion.div
              className={`px-3 py-2 rounded-lg font-bold text-sm transition-all duration-300 ${
                index === currentZoneIndex 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : index < currentZoneIndex
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-700 text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
            >
              Zone {zone}
            </motion.div>
            {index < route.length - 1 && (
              <ChevronRight 
                size={16} 
                className={index < currentZoneIndex ? 'text-green-400' : 'text-gray-500'} 
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Item Card Stack Component
const ItemCardStack = ({ items, currentIndex, onItemClick }) => {
  return (
    <div className="relative h-80 mb-6">
      {items.map((item, index) => {
        const offset = index - currentIndex;
        const isVisible = Math.abs(offset) <= 2;
        
        if (!isVisible) return null;

        return (
          <motion.div
            key={item.barcode + index}
            layout
            initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
            animate={{
              scale: offset === 0 ? 1 : 0.95 - Math.abs(offset) * 0.05,
              opacity: offset === 0 ? 1 : 0.7 - Math.abs(offset) * 0.2,
              rotateY: offset * -5,
              z: -Math.abs(offset) * 10,
              y: Math.abs(offset) * 20
            }}
            exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              duration: 0.3 
            }}
            className={`absolute inset-0 glass-card rounded-2xl cursor-pointer ${
              offset === 0 
                ? 'border-2 border-blue-500 shadow-2xl shadow-blue-500/20' 
                : 'border border-gray-700'
            }`}
            style={{ 
              zIndex: 10 - Math.abs(offset),
              transformOrigin: 'center center'
            }}
            onClick={() => onItemClick && onItemClick(index)}
          >
            <div className="p-8 h-full flex flex-col justify-center">
              {offset === 0 ? (
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4"
                  >
                    <Target size={32} className="text-blue-400" />
                  </motion.div>
                  
                  <h3 className="text-2xl font-bold mb-2">Pick Next Item</h3>
                  <p className="text-4xl font-mono font-bold text-blue-400 mb-3">
                    {item.barcode}
                  </p>
                  <p className="text-lg text-gray-300 mb-1">{item.name}</p>
                  <p className="text-sm text-gray-400 mb-4">SKU: {item.sku}</p>
                  
                  <div className="flex items-center justify-center space-x-6 text-lg">
                    <div className="flex items-center">
                      <MapPin className="mr-2 text-green-400" size={20} />
                      <span className="font-bold">{item.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Package className="mr-2 text-purple-400" size={20} />
                      <span className="font-bold">
                        {item.pickedQuantity || 0} / {item.quantity}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-center">
                    <div className="relative w-16 h-16">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                        <circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="rgba(75, 85, 99, 0.3)"
                          strokeWidth="4"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="28"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="4"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: "0 175.9" }}
                          animate={{ 
                            strokeDasharray: `${((item.pickedQuantity || 0) / item.quantity) * 175.9} 175.9` 
                          }}
                          transition={{ duration: 0.5 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {Math.round(((item.pickedQuantity || 0) / item.quantity) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-8 h-8 bg-gray-600/20 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Package size={16} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-300">{item.sku}</p>
                  <p className="text-xs text-gray-500">{item.location}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
              )}
            </div>

            {(item.pickedQuantity || 0) >= item.quantity && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-green-500/20 rounded-2xl flex items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-green-500 rounded-full p-4"
                >
                  <CheckCircle size={32} className="text-white" />
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

// Enhanced Completion Modal
const CompletionModal = ({ stats, onClose, onNext }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
    
    const timer = setInterval(() => {
      setCurrentStep(prev => prev < 3 ? prev + 1 : prev);
    }, 800);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Confetti active={showConfetti} />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="bg-gray-900/95 backdrop-blur-xl p-8 rounded-3xl border border-gray-700 max-w-lg w-full text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <CheckCircle size={40} className="text-white" />
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Mission Complete! 🎉
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400 mb-8"
            >
              Order {stats.orderId} successfully picked and sent to packing queue
            </motion.p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gray-800/50 rounded-xl p-4"
              >
                <BarChart3 className="mx-auto mb-2 text-blue-400" size={24} />
                <p className="text-2xl font-bold">
                  {currentStep >= 1 ? <AnimatedCounter target={stats.itemCount} duration={1000} /> : '0'}
                </p>
                <p className="text-xs text-gray-400">Items</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gray-800/50 rounded-xl p-4"
              >
                <Timer className="mx-auto mb-2 text-green-400" size={24} />
                <p className="text-2xl font-bold">
                  {currentStep >= 2 ? formatTime(stats.pickTime) : '0:00'}
                </p>
                <p className="text-xs text-gray-400">Time</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-800/50 rounded-xl p-4"
              >
                <Sparkles className="mx-auto mb-2 text-purple-400" size={24} />
                <p className="text-2xl font-bold text-blue-400">
                  {currentStep >= 3 ? <AnimatedCounter target={stats.totalXP} duration={1500} prefix="+" suffix=" XP" /> : '+0 XP'}
                </p>
                <p className="text-xs text-gray-400">Earned</p>
              </motion.div>
            </div>

            <AnimatePresence>
              {currentStep >= 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6"
                >
                  <h4 className="font-semibold text-blue-300 mb-3">XP Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                      className="flex justify-between"
                    >
                      <span>Base Completion</span>
                      <span className="text-blue-400">+{stats.baseXP} XP</span>
                    </motion.div>
                    {stats.speedBonus > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 }}
                        className="flex justify-between"
                      >
                        <span>Speed Bonus ⚡</span>
                        <span className="text-yellow-400">+{stats.speedBonus} XP</span>
                      </motion.div>
                    )}
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0 }}
                      className="flex justify-between"
                    >
                      <span>Accuracy Bonus 🎯</span>
                      <span className="text-green-400">+{stats.accuracyBonus} XP</span>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center justify-center space-x-2">
                <PackageCheck className="text-green-400" size={20} />
                <span className="text-green-400 font-medium">Order sent to packing queue</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNext}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <span>Pick Next Order</span>
              <ArrowRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

// Main Picking Component
const Picking = () => {
  const { user, addXP, playSound, updateStats, unlockAchievement } = useWarehouse();
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [pickStartTime, setPickStartTime] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionStats, setCompletionStats] = useState(null);
  const [wrongItemFeedback, setWrongItemFeedback] = useState(false);

  useEffect(() => {
    const mockOrders = [
      {
        id: 'SO5553',
        customer: { name: 'Auckland Security Systems' },
        status: 'pending',
        priority: 'high',
        shippingMethod: 'express',
        shippingAddress: { city: 'Auckland', country: 'New Zealand' },
        readyAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        items: [
          { 
            barcode: '100003',
            sku: 'TVT-D2812POE', 
            name: 'TVT Dome Camera 12MP PoE', 
            quantity: 2, 
            location: 'A-01-02',
            pickedQuantity: 0
          },
          { 
            barcode: '100014',
            sku: 'EC-KIT TOUCH W', 
            name: 'EC Touch Kit White', 
            quantity: 3, 
            location: 'A-02-05',
            pickedQuantity: 0
          },
          { 
            barcode: '100008',
            sku: 'SWITCH-8', 
            name: '8-Port Network Switch', 
            quantity: 1, 
            location: 'C-01-04',
            pickedQuantity: 0
          }
        ]
      },
      {
        id: 'SO5554',
        customer: { name: 'Wellington Safety Co' },
        status: 'pending',
        priority: 'normal',
        shippingMethod: 'standard',
        shippingAddress: { city: 'Wellington', country: 'New Zealand' },
        readyAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        items: [
          { 
            barcode: '100001',
            sku: 'TVT-P180-8POE', 
            name: 'TVT 8-Port PoE Switch 180W', 
            quantity: 1, 
            location: 'B-03-01',
            pickedQuantity: 0
          }
        ]
      }
    ];
    setOrders(mockOrders);
  }, []);

  const handleStartPicking = (order) => {
    const sortedItems = [...order.items].sort((a, b) => a.location.localeCompare(b.location));
    
    const orderWithPickedQuantity = {
      ...order,
      status: 'picking',
      items: sortedItems.map(item => ({ ...item, pickedQuantity: 0 }))
    };
    
    setActiveOrder(orderWithPickedQuantity);
    setCurrentItemIndex(0);
    setPickStartTime(Date.now());
    playSound('scan');
  };

  const handleItemPick = (scannedBarcode) => {
    const currentItem = activeOrder?.items[currentItemIndex];
    if (!currentItem) return;

    if (scannedBarcode !== currentItem.barcode) {
      setWrongItemFeedback(true);
      setTimeout(() => setWrongItemFeedback(false), 1000);
      playSound('error');
      return;
    }

    if (currentItem.pickedQuantity >= currentItem.quantity) return;

    const updatedItems = [...activeOrder.items];
    updatedItems[currentItemIndex] = {
      ...currentItem,
      pickedQuantity: currentItem.pickedQuantity + 1
    };

    const updatedOrder = { ...activeOrder, items: updatedItems };
    setActiveOrder(updatedOrder);
    playSound('success');

    if (updatedItems[currentItemIndex].pickedQuantity >= currentItem.quantity) {
      const nextIncompleteIndex = updatedItems.findIndex(
        (item, index) => index > currentItemIndex && item.pickedQuantity < item.quantity
      );
      
      if (nextIncompleteIndex === -1) {
        const allComplete = updatedItems.every(item => item.pickedQuantity >= item.quantity);
        if (allComplete) {
          handleOrderComplete(updatedOrder);
          return;
        }
        const anyIncompleteIndex = updatedItems.findIndex(item => item.pickedQuantity < item.quantity);
        if (anyIncompleteIndex !== -1) {
          setCurrentItemIndex(anyIncompleteIndex);
        }
      } else {
        setCurrentItemIndex(nextIncompleteIndex);
      }
    }
  };

  const handleOrderComplete = (completedOrder) => {
    const pickTime = Math.round((Date.now() - pickStartTime) / 1000);
    const itemCount = completedOrder.items.reduce((sum, item) => sum + item.quantity, 0);
    
    const baseXP = 50;
    const speedBonus = pickTime < itemCount * 30 ? 25 : 0;
    const accuracyBonus = 25;
    const totalXP = baseXP + speedBonus + accuracyBonus;

    setCompletionStats({
      orderId: completedOrder.id,
      itemCount,
      pickTime,
      totalXP,
      baseXP,
      speedBonus,
      accuracyBonus
    });

    setShowCompletionModal(true);
    setOrders(prev => prev.filter(o => o.id !== completedOrder.id));
    
    setTimeout(() => {
      addXP(totalXP, `Completed order ${completedOrder.id}`);
      updateStats({
        ordersProcessed: (user?.stats?.ordersProcessed || 0) + 1,
        itemsPicked: (user?.stats?.itemsPicked || 0) + itemCount
      });
    }, 1000);
  };

  const handleStartNextOrder = () => {
    setShowCompletionModal(false);
    setActiveOrder(null);
    setCurrentItemIndex(0);
    setCompletionStats(null);
  };

  const getCurrentZone = () => {
    const currentItem = activeOrder?.items[currentItemIndex];
    return currentItem?.location.split('-')[0] || 'A';
  };

  const progress = activeOrder ? 
    activeOrder.items.reduce((sum, item) => sum + item.pickedQuantity, 0) / 
    activeOrder.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Picking Station
          </h1>
          <p className="text-gray-400 mt-1">Select and complete pick missions</p>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>Available Orders: {orders.length}</span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {!activeOrder ? (
          <motion.div
            key="orders-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {orders.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Package size={32} className="text-gray-500" />
                </motion.div>
                <p className="text-gray-400">No orders available for picking</p>
              </div>
            ) : (
              orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OrderCard
                    order={order}
                    onClick={() => handleStartPicking(order)}
                    layoutId={`order-${order.id}`}
                  />
                </motion.div>
              ))
            )}
          </motion.div>
        ) : (
          <motion.div
            key="picking-interface"
            layoutId={`order-${activeOrder.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setActiveOrder(null)}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
                </motion.button>
                
                <div>
                  <motion.h2 
                    layoutId={`order-${activeOrder.id}-title`}
                    className="text-2xl font-bold"
                  >
                    Mission: {activeOrder.id}
                  </motion.h2>
                  <p className="text-gray-400">{activeOrder.customer.name}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-400">Mission Progress</p>
                <p className="text-2xl font-bold text-blue-400">
                  {Math.round(progress * 100)}%
                </p>
              </div>
            </motion.div>

            <RouteOptimizer 
              items={activeOrder.items} 
              currentZone={getCurrentZone()} 
            />

            <ItemCardStack
              items={activeOrder.items}
              currentIndex={currentItemIndex}
              onItemClick={setCurrentItemIndex}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-card p-6 rounded-xl transition-all duration-300 ${
                wrongItemFeedback ? 'border-red-500 bg-red-500/10' : 'border-gray-700'
              }`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Target className="mr-2 text-blue-400" />
                Scan Item Barcode
              </h3>
              <ScanInput
                onScan={handleItemPick}
                placeholder="Scan the barcode shown above..."
                expectedValue={activeOrder.items[currentItemIndex]?.barcode}
                autoFocus={true}
              />
              
              {wrongItemFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center"
                >
                  <AlertCircle className="mr-2 text-red-400" size={20} />
                  <span className="text-red-300">Wrong item! Please scan the correct barcode.</span>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Mission Overview</h3>
                <div className="flex items-center space-x-2">
                  <Timer className="text-blue-400" size={16} />
                  <span className="text-sm">
                    {pickStartTime ? formatTime(Math.floor((Date.now() - pickStartTime) / 1000)) : '0:00'}
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">
                    {activeOrder.items.reduce((sum, item) => sum + item.pickedQuantity, 0)}
                  </p>
                  <p className="text-xs text-gray-400">Items Picked</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {activeOrder.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </p>
                  <p className="text-xs text-gray-400">Total Items</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">
                    {activeOrder.items.filter(item => item.pickedQuantity >= item.quantity).length}
                  </p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompletionModal && completionStats && (
          <CompletionModal
            stats={completionStats}
            onClose={() => setShowCompletionModal(false)}
            onNext={handleStartNextOrder}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Picking;