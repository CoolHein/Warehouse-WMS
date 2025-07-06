import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  TrendingUp,
  Clock,
  Award,
  Activity,
  Users,
  Truck,
  BarChart3,
  X,
  ChevronRight,
  Eye,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Timer,
  User,
  MapPin,
  Calendar,
  Filter,
  Zap,
  Target,
  PlayCircle,
  PauseCircle,
  Home,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { useWarehouse } from "../hooks/useWarehouseContext";

// Date formatting utilities
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "just now";
  const now = Date.now();
  const date = new Date(timestamp);
  const diff = Math.floor((now - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// Enhanced Stats Card with focus animation
const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color,
  onClick,
  isSelected,
  layoutId,
}) => {
  const colorClasses = {
    primary: "from-blue-500 to-blue-600",
    warning: "from-yellow-500 to-orange-500",
    success: "from-green-500 to-emerald-500",
    danger: "from-red-500 to-red-600",
  };

  return (
    <motion.div
      layoutId={layoutId}
      onClick={onClick}
      className={`bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl cursor-pointer relative overflow-hidden group transition-all duration-300 ${
        isSelected
          ? "ring-2 ring-blue-500 shadow-2xl shadow-blue-500/20"
          : "hover:scale-[1.02]"
      }`}
      whileHover={{ y: isSelected ? 0 : -4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color]} bg-opacity-20`}
          >
            <Icon className="text-white" size={24} />
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm ${trend > 0 ? "text-green-400" : "text-red-400"}`}
            >
              <TrendingUp size={16} className={trend < 0 ? "rotate-180" : ""} />
              <span className="ml-1">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        >
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
          <p className="text-gray-400 text-sm">{title}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Dynamic Chart Component
const DynamicChart = ({ selectedStat, data, onDataPointClick }) => {
  const [chartType, setChartType] = useState("line");
  const [isAnimating, setIsAnimating] = useState(false);

  const chartConfigs = {
    todayOrders: {
      title: "Orders Throughout the Day",
      type: "area",
      dataKey: "orders",
      color: "#3b82f6",
    },
    pendingOrders: {
      title: "Pending Orders by Age",
      type: "bar",
      dataKey: "count",
      color: "#f59e0b",
    },
    activePickingTasks: {
      title: "Picking Performance",
      type: "line",
      dataKey: "efficiency",
      color: "#10b981",
    },
    packingQueue: {
      title: "Packing Queue Trends",
      type: "area",
      dataKey: "queue",
      color: "#8b5cf6",
    },
  };

  const config = chartConfigs[selectedStat] || chartConfigs.todayOrders;

  const chartData = {
    todayOrders: [
      { time: "8AM", orders: 4, efficiency: 85 },
      { time: "9AM", orders: 7, efficiency: 92 },
      { time: "10AM", orders: 12, efficiency: 88 },
      { time: "11AM", orders: 9, efficiency: 95 },
      { time: "12PM", orders: 6, efficiency: 78 },
      { time: "1PM", orders: 8, efficiency: 89 },
      { time: "2PM", orders: 11, efficiency: 94 },
      { time: "3PM", orders: 5, efficiency: 91 },
    ],
    pendingOrders: [
      { age: "< 1h", count: 8 },
      { age: "1-4h", count: 12 },
      { age: "4-8h", count: 5 },
      { age: "8-24h", count: 3 },
      { age: "> 24h", count: 1 },
    ],
    activePickingTasks: [
      { picker: "Alex", efficiency: 95, orders: 8 },
      { picker: "Sam", efficiency: 88, orders: 6 },
      { picker: "Jordan", efficiency: 92, orders: 7 },
      { picker: "Riley", efficiency: 85, orders: 5 },
    ],
    packingQueue: [
      { hour: "9AM", queue: 15 },
      { hour: "10AM", queue: 22 },
      { hour: "11AM", queue: 18 },
      { hour: "12PM", queue: 25 },
      { hour: "1PM", queue: 12 },
      { hour: "2PM", queue: 8 },
    ],
  };

  const currentData = chartData[selectedStat] || chartData.todayOrders;

  const renderChart = () => {
    switch (config.type) {
      case "area":
        return (
          <AreaChart data={currentData}>
            <defs>
              <linearGradient
                id={`gradient-${selectedStat}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={config.color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={config.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={Object.keys(currentData[0])[0]} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            />
            <Area
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={3}
              fill={`url(#gradient-${selectedStat})`}
              onClick={onDataPointClick}
            />
          </AreaChart>
        );

      case "bar":
        return (
          <BarChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={Object.keys(currentData[0])[0]} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey={config.dataKey}
              fill={config.color}
              radius={[4, 4, 0, 0]}
              onClick={onDataPointClick}
            />
          </BarChart>
        );

      default:
        return (
          <LineChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey={Object.keys(currentData[0])[0]} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey={config.dataKey}
              stroke={config.color}
              strokeWidth={3}
              dot={{ fill: config.color, strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: config.color }}
              onClick={onDataPointClick}
            />
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      layout
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-6">
        <motion.h3 layout className="text-xl font-bold">
          {config.title}
        </motion.h3>
        <div className="flex space-x-2">
          {["line", "area", "bar"].map((type) => (
            <motion.button
              key={type}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setChartType(type)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                chartType === type
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

// Master/Detail Layout Component
const MasterDetailView = ({
  activities,
  onActivitySelect,
  selectedActivity,
}) => {
  return (
    <div className="grid lg:grid-cols-3 gap-6 h-full">
      {/* Master List */}
      <div className="lg:col-span-1">
        <motion.div
          layout
          className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl h-full"
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Activity className="mr-2 text-blue-400" size={20} />
            Live Activity Feed
          </h3>

          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, x: 4 }}
                onClick={() => onActivitySelect(activity)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedActivity?.id === activity.id
                    ? "bg-blue-500/20 border border-blue-500/50"
                    : "bg-gray-800/50 hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-sm">
                    {activity.type === "picking"
                      ? "📦"
                      : activity.type === "packing"
                        ? "📋"
                        : activity.type === "shipping"
                          ? "🚚"
                          : "📌"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      <span className="font-medium text-white">
                        {activity.user}
                      </span>
                      <span className="text-gray-400 ml-1">
                        {activity.action}
                      </span>
                    </p>
                    <p className="text-xs text-blue-400 truncate">
                      {activity.item}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-400 group-hover:text-white transition-colors"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Detail Panel */}
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {selectedActivity ? (
            <motion.div
              key={selectedActivity.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl h-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Activity Details</h3>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onActivitySelect(null)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Activity Header */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-lg">
                    {selectedActivity.type === "picking"
                      ? "📦"
                      : selectedActivity.type === "packing"
                        ? "📋"
                        : selectedActivity.type === "shipping"
                          ? "🚚"
                          : "📌"}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      {selectedActivity.user}
                    </h4>
                    <p className="text-gray-400">
                      {selectedActivity.action} {selectedActivity.item}
                    </p>
                    <p className="text-sm text-blue-400">
                      {formatTimeAgo(selectedActivity.timestamp)}
                    </p>
                  </div>
                </div>

                {/* Mock Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-300">
                      Order Information
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order ID:</span>
                        <span className="font-mono text-blue-400">SO5558</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Customer:</span>
                        <span>Auckland Security</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Priority:</span>
                        <span className="text-yellow-400">High</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Value:</span>
                        <span className="font-semibold">$1,890.00</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-300">
                      Performance Metrics
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time Taken:</span>
                        <span className="text-green-400">12m 34s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Accuracy:</span>
                        <span className="text-green-400">100%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">XP Earned:</span>
                        <span className="text-blue-400">+25 XP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Efficiency:</span>
                        <span className="text-green-400">94%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h5 className="font-semibold text-gray-300 mb-3">
                    Items Processed
                  </h5>
                  <div className="space-y-2">
                    {[
                      {
                        sku: "TVT-D2812POE",
                        name: "TVT 12MP Dome Camera PoE",
                        qty: 5,
                        location: "A-01-02",
                      },
                      {
                        sku: "EC-KIT TOUCH W",
                        name: "EC Touch Kit White",
                        qty: 10,
                        location: "A-02-05",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                      >
                        <div>
                          <p className="font-mono text-sm text-blue-400">
                            {item.sku}
                          </p>
                          <p className="text-sm text-gray-300">{item.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Qty: {item.qty}</p>
                          <p className="text-xs text-gray-400">
                            {item.location}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Eye className="mr-2" size={16} />
                    View Full Order
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    View User Profile
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl h-full flex items-center justify-center"
            >
              <div className="text-center text-gray-400">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>Select an activity to view details</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user, addNotification } = useWarehouse();
  const [selectedStat, setSelectedStat] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isInFocusMode, setIsInFocusMode] = useState(false);

  // Mock data
  const [stats] = useState({
    todayOrders: 24,
    pendingOrders: 8,
    activePickingTasks: 3,
    packingQueue: 12,
  });

  const [activities] = useState([
    {
      id: "act-1",
      user: "Sarah Chen",
      action: "completed picking for",
      item: "Order SO5558",
      type: "picking",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "act-2",
      user: "Mike Rodriguez",
      action: "packed and shipped",
      item: "Order SO5555",
      type: "shipping",
      timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    },
    {
      id: "act-3",
      user: "Jordan Kim",
      action: "received inventory",
      item: "PO-2025-001",
      type: "receiving",
      timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    },
    {
      id: "act-4",
      user: "Alex Thompson",
      action: "completed stock count",
      item: "Zone A-01",
      type: "stockcount",
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    },
  ]);

  const handleStatClick = (statType) => {
    setSelectedStat(statType);
    setIsInFocusMode(true);
  };

  const handleBackToOverview = () => {
    setSelectedStat(null);
    setIsInFocusMode(false);
    setSelectedActivity(null);
  };

  const handleDataPointClick = (data) => {
    console.log("Chart data point clicked:", data);
    // Here you could show additional details or filter data
  };

  return (
    <div className="w-full h-full min-h-[calc(100vh-8rem)] space-y-8">
      <AnimatePresence mode="wait">
        {!isInFocusMode ? (
          // Overview Mode
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Welcome back, {user?.name}!
                  </h1>
                  <p className="text-gray-400 mt-2">
                    Ready to make today productive? You're{" "}
                    {100 - ((user?.xp / user?.xpToNextLevel) * 100).toFixed(0)}%
                    away from Level {user?.level + 1}!
                  </p>
                </div>
                <motion.div
                  className="text-6xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {user?.avatar}
                </motion.div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
            >
              <StatsCard
                layoutId="stat-todayOrders"
                title="Today's Orders"
                value={stats.todayOrders}
                icon={Package}
                trend={12}
                color="primary"
                onClick={() => handleStatClick("todayOrders")}
                isSelected={selectedStat === "todayOrders"}
              />
              <StatsCard
                layoutId="stat-pendingOrders"
                title="Pending Orders"
                value={stats.pendingOrders}
                icon={Clock}
                trend={-5}
                color="warning"
                onClick={() => handleStatClick("pendingOrders")}
                isSelected={selectedStat === "pendingOrders"}
              />
              <StatsCard
                layoutId="stat-activePickingTasks"
                title="Active Picking"
                value={stats.activePickingTasks}
                icon={Activity}
                color="success"
                onClick={() => handleStatClick("activePickingTasks")}
                isSelected={selectedStat === "activePickingTasks"}
              />
              <StatsCard
                layoutId="stat-packingQueue"
                title="Packing Queue"
                value={stats.packingQueue}
                icon={Truck}
                trend={8}
                color="primary"
                onClick={() => handleStatClick("packingQueue")}
                isSelected={selectedStat === "packingQueue"}
              />
            </motion.div>

            {/* Charts Overview */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl"
              >
                <h3 className="text-xl font-bold mb-4">Orders Today</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        { time: "8AM", orders: 4 },
                        { time: "10AM", orders: 12 },
                        { time: "12PM", orders: 8 },
                        { time: "2PM", orders: 15 },
                        { time: "4PM", orders: 6 },
                      ]}
                    >
                      <defs>
                        <linearGradient
                          id="orderGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#3b82f6"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="#3b82f6"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="time" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1f2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="orders"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fill="url(#orderGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl"
              >
                <h3 className="text-xl font-bold mb-4">Team Performance</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      data={[
                        { name: "Picking", value: 89, fill: "#3b82f6" },
                        { name: "Packing", value: 95, fill: "#10b981" },
                        { name: "Accuracy", value: 99, fill: "#f59e0b" },
                      ]}
                    >
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="#8884d8"
                      />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Master/Detail Activity View */}
            <MasterDetailView
              activities={activities}
              onActivitySelect={setSelectedActivity}
              selectedActivity={selectedActivity}
            />
          </motion.div>
        ) : (
          // Focus Mode
          <motion.div
            key="focus"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-8"
          >
            {/* Focus Header */}
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.1, x: -2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleBackToOverview}
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors flex items-center space-x-2"
                >
                  <ArrowLeft size={20} />
                  <span>Back to Overview</span>
                </motion.button>

                <div>
                  <h1 className="text-3xl font-bold">
                    {selectedStat === "todayOrders" && "Today's Orders Focus"}
                    {selectedStat === "pendingOrders" && "Pending Orders Focus"}
                    {selectedStat === "activePickingTasks" &&
                      "Active Picking Focus"}
                    {selectedStat === "packingQueue" && "Packing Queue Focus"}
                  </h1>
                  <p className="text-gray-400">
                    Deep dive into{" "}
                    {selectedStat?.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <PlayCircle className="inline mr-2" size={16} />
                  Take Action
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Filter className="inline mr-2" size={16} />
                  Filter
                </motion.button>
              </div>
            </motion.div>

            {/* Focused Stat Card */}
            <motion.div layout className="flex justify-center">
              <div className="w-80">
                <StatsCard
                  layoutId={`stat-${selectedStat}`}
                  title={
                    selectedStat === "todayOrders"
                      ? "Today's Orders"
                      : selectedStat === "pendingOrders"
                        ? "Pending Orders"
                        : selectedStat === "activePickingTasks"
                          ? "Active Picking"
                          : "Packing Queue"
                  }
                  value={stats[selectedStat]}
                  icon={
                    selectedStat === "todayOrders"
                      ? Package
                      : selectedStat === "pendingOrders"
                        ? Clock
                        : selectedStat === "activePickingTasks"
                          ? Activity
                          : Truck
                  }
                  color="primary"
                  isSelected={true}
                />
              </div>
            </motion.div>

            {/* Dynamic Chart */}
            <DynamicChart
              selectedStat={selectedStat}
              onDataPointClick={handleDataPointClick}
            />

            {/* Contextual Data List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 p-6 rounded-xl"
            >
              <h3 className="text-xl font-bold mb-6">
                {selectedStat === "todayOrders" && "Today's Order Details"}
                {selectedStat === "pendingOrders" && "Pending Order Queue"}
                {selectedStat === "activePickingTasks" &&
                  "Active Picking Tasks"}
                {selectedStat === "packingQueue" && "Packing Queue Items"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="p-4 bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-800 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-blue-400">
                        SO555{item}
                      </span>
                      <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                        High
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      Auckland Security Systems
                    </p>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>{2 + item} items</span>
                      <span>
                        {formatTimeAgo(
                          new Date(Date.now() - item * 15 * 60 * 1000),
                        )}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(75, 85, 99, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
