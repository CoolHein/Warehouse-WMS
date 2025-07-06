import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Edit,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  Package,
  BarChart3,
  Filter,
  RefreshCw,
  AlertCircle,
  MapPin,
  Clock,
  FileText,
  Activity,
  X,
  ChevronRight,
  Eye,
  Settings,
  Plus,
  Minus,
  History,
  Info,
  MoveHorizontal,
  Merge,
  Split,
  Trash2,
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  ArrowUpDown,
  Copy,
  Database,
  Layers,
  Zap,
  ZoomIn,
  ZoomOut,
  Home,
  Target,
  Thermometer,
  Crosshair,
} from "lucide-react";
import { useWarehouse } from "../hooks/useWarehouseContext";
import toast from "react-hot-toast";

// Simple date formatting function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const StockControl = () => {
  const { user, addXP, playSound, updateStats } = useWarehouse();

  // Centralized Layout Configuration
  const layoutConfig = {
    paddingX: 100, // Horizontal padding around the entire map
    paddingY: 140, // Vertical padding (extra space for zone header)
    aisleWidth: 250, // Width allocated for bins in an aisle (wider for 2 rows)
    aisleGap: 40, // The empty space between aisles
    rowGap: 60, // Horizontal gap between the two rows within an aisle
    binSpacing: 45, // Vertical spacing between bins in a row
    binSize: 32, // Size of individual bins
    zoneHeaderHeight: 80, // Height of the zone header area
  };

  // Main application state
  const [stockLevels, setStockLevels] = useState([]);
  const [bins, setBins] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  // Map interaction state
  const [selectedBin, setSelectedBin] = useState(null);
  const [selectedBins, setSelectedBins] = useState([]);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [transferMode, setTransferMode] = useState(false);
  const [transferSource, setTransferSource] = useState(null);

  // Map view state
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [focusedZone, setFocusedZone] = useState(null);

  // Data layer toggles
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showAlerts, setShowAlerts] = useState(true);
  const [showTransferPaths, setShowTransferPaths] = useState(false);
  const [filterEmpty, setFilterEmpty] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);

  // Modal states
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCreateBinModal, setShowCreateBinModal] = useState(false);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef(null);

  // Calculate dynamic viewBox dimensions
  const calculateViewBox = () => {
    const numAisles = 4; // 4 aisles
    const numBinsPerRow = 6; // Number of bins vertically in each row

    const totalWidth =
      layoutConfig.paddingX * 2 +
      numAisles * layoutConfig.aisleWidth +
      (numAisles - 1) * layoutConfig.aisleGap;

    const totalHeight =
      layoutConfig.paddingY * 2 + numBinsPerRow * layoutConfig.binSpacing + 100; // Extra padding at bottom

    return { width: totalWidth, height: totalHeight };
  };

  const viewBox = calculateViewBox();

  useEffect(() => {
    loadStockData();
    const interval = setInterval(loadStockData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStockData = () => {
    const mockData = generateMockStockData();
    setStockLevels(mockData.stockLevels);
    setBins(mockData.bins);
    setTransfers(mockData.transfers);
    setLowStockAlerts(mockData.lowStockAlerts);
  };

  const generateMockStockData = () => {
    const zones = ["A"];
    const bins = [];
    const stockLevels = [];

    zones.forEach((zone) => {
      for (let aisle = 1; aisle <= 4; aisle++) {
        // 4 aisles
        for (let row = 1; row <= 2; row++) {
          // 2 rows per aisle (side by side)
          for (let position = 1; position <= 6; position++) {
            // 6 bins per row (vertically)
            const binId = `${zone}${aisle.toString().padStart(2, "0")}-${row}${position}`;
            const hasStock = Math.random() > 0.3;

            // Calculate position
            const aisleIndex = aisle - 1;
            const rowIndex = row - 1;
            const positionIndex = position - 1;

            // Calculate aisle center position
            const aisleX =
              layoutConfig.paddingX +
              aisleIndex * (layoutConfig.aisleWidth + layoutConfig.aisleGap) +
              layoutConfig.aisleWidth / 2;

            // Position bins horizontally by row (left or right)
            const x =
              aisleX +
              (rowIndex === 0
                ? -layoutConfig.rowGap / 2
                : layoutConfig.rowGap / 2);

            // Position bins vertically - adjusted to start from within the aisle container
            const y =
              layoutConfig.paddingY +
              20 +
              positionIndex * layoutConfig.binSpacing;

            const bin = {
              id: binId,
              location: { zone, aisle, row, position },
              type:
                position <= 2 ? "floor" : position >= 5 ? "high" : "standard",
              capacity: 100,
              currentVolume: hasStock ? Math.floor(Math.random() * 80) + 20 : 0,
              isEmpty: !hasStock,
              isLocked: false,
              lastActivity: new Date(
                Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
              ).toISOString(),
              position: { x, y },
            };

            bins.push(bin);

            if (hasStock) {
              const numItems = Math.floor(Math.random() * 2) + 1;
              for (let i = 0; i < numItems; i++) {
                const systemQty = Math.floor(Math.random() * 50) + 1;
                const reorderPoint = Math.floor(Math.random() * 20) + 10;

                stockLevels.push({
                  id: `STK-${binId}-${i}`,
                  binId,
                  barcode: `10${Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, "0")}`,
                  sku: `SKU-${Math.floor(Math.random() * 1000)
                    .toString()
                    .padStart(4, "0")}`,
                  name: `Product ${binId}-${i}`,
                  systemQuantity: systemQty,
                  physicalQuantity: systemQty,
                  reorderPoint,
                  status:
                    systemQty <= reorderPoint
                      ? "low"
                      : systemQty <= reorderPoint * 1.5
                        ? "warning"
                        : "healthy",
                  lastCounted: bin.lastActivity,
                  expiryDate:
                    Math.random() > 0.7
                      ? new Date(
                          Date.now() +
                            Math.random() * 365 * 24 * 60 * 60 * 1000,
                        ).toISOString()
                      : null,
                });
              }
            }
          }
        }
      }
    });

    const transfers = Array.from({ length: 5 }, (_, i) => ({
      id: `TRF-${Date.now() - i * 1000}`,
      type: "bin-to-bin",
      sourceBin: bins[Math.floor(Math.random() * bins.length)].id,
      destinationBin: bins[Math.floor(Math.random() * bins.length)].id,
      items: [
        {
          sku: `SKU-${Math.floor(Math.random() * 1000)}`,
          quantity: Math.floor(Math.random() * 20) + 1,
        },
      ],
      status: "completed",
      createdBy: "John Doe",
      createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
    }));

    const lowStockAlerts = stockLevels
      .filter((item) => item.status === "low" || item.status === "warning")
      .map((item) => ({
        ...item,
        daysUntilStockout: Math.floor(Math.random() * 10) + 1,
        averageDailyUsage: Math.floor(item.systemQuantity / 10),
      }));

    return { bins, stockLevels, transfers, lowStockAlerts };
  };

  // Map interaction handlers
  const handleBinClick = (bin) => {
    if (transferMode) {
      if (!transferSource) {
        setTransferSource(bin);
        toast.success(`Selected source bin: ${bin.id}`);
      } else if (transferSource.id !== bin.id) {
        setShowTransferModal(true);
        setSelectedBin(bin);
      } else {
        toast.error("Cannot transfer to the same bin");
      }
      return;
    }

    setSelectedBin(bin);
    setShowSidePanel(true);
  };

  const handleZoomIn = () => {
    setMapZoom((prev) => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setMapZoom((prev) => Math.max(prev / 1.2, 0.5));
  };

  const handleResetView = () => {
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
    setFocusedZone(null);
  };

  const focusOnZone = (zone) => {
    setMapZoom(1);
    setMapPan({ x: 0, y: 0 });
    setFocusedZone(zone);
  };

  const getBinColor = (bin) => {
    const binStock = stockLevels.filter((s) => s.binId === bin.id);

    if (bin.isEmpty) return "#374151"; // Gray
    if (binStock.some((s) => s.status === "low")) return "#ef4444"; // Red
    if (binStock.some((s) => s.status === "warning")) return "#f59e0b"; // Yellow

    const utilization = bin.currentVolume / bin.capacity;
    if (utilization > 0.9) return "#f59e0b"; // Yellow for high utilization
    return "#10b981"; // Green for healthy
  };

  const getHeatmapOpacity = (bin) => {
    if (!showHeatmap) return 0;
    const utilization = bin.currentVolume / bin.capacity;
    return utilization * 0.7;
  };

  const filteredBins = bins.filter((bin) => {
    if (filterEmpty && !bin.isEmpty) return false;
    if (
      filterLowStock &&
      !stockLevels.some(
        (s) =>
          s.binId === bin.id && (s.status === "low" || s.status === "warning"),
      )
    )
      return false;
    if (searchQuery) {
      const matchesBin = bin.id
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStock = stockLevels.some(
        (s) =>
          s.binId === bin.id &&
          (s.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name.toLowerCase().includes(searchQuery.toLowerCase())),
      );
      return matchesBin || matchesStock;
    }
    return true;
  });

  const handleTransferStock = (transfer) => {
    // Update stock levels logic here
    setTransfers((prev) => [
      {
        ...transfer,
        id: `TRF-${Date.now()}`,
        status: "completed",
        createdBy: user.name,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    addXP(30, "Stock Transfer");
    playSound("success");
    toast.success("Transfer completed successfully");

    // Reset transfer mode
    setTransferMode(false);
    setTransferSource(null);
    setShowTransferModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Interactive Warehouse Map
            </h1>
            <p className="text-gray-400 mt-2">
              Unified inventory management and control center
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center space-x-6">
            <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-green-500">
                {bins.length}
              </div>
              <div className="text-sm text-gray-400 font-medium">
                Total Bins
              </div>
            </motion.div>
            <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-blue-500">
                {stockLevels.length}
              </div>
              <div className="text-sm text-gray-400 font-medium">
                Active SKUs
              </div>
            </motion.div>
            <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-yellow-500">
                {lowStockAlerts.length}
              </div>
              <div className="text-sm text-gray-400 font-medium">Low Stock</div>
            </motion.div>
            <motion.div className="text-center" whileHover={{ scale: 1.05 }}>
              <div className="text-3xl font-bold text-purple-500">
                {Math.round(
                  (bins.filter((b) => !b.isEmpty).length / bins.length) * 100,
                )}
                %
              </div>
              <div className="text-sm text-gray-400 font-medium">
                Utilization
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-6">
        {/* Map Controls Sidebar */}
        <div className="w-80 glass-card p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bins, SKUs..."
              className="input-field w-full pl-10"
            />
          </div>

          {/* Data Layer Controls */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-300">Data Layers</h3>

            <label className="flex items-center space-x-3 cursor-pointer hover-lift">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
              />
              <Thermometer size={16} className="text-orange-500" />
              <span className="text-sm text-gray-300">Utilization Heatmap</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer hover-lift">
              <input
                type="checkbox"
                checked={showAlerts}
                onChange={(e) => setShowAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
              />
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-sm text-gray-300">Low Stock Alerts</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer hover-lift">
              <input
                type="checkbox"
                checked={showTransferPaths}
                onChange={(e) => setShowTransferPaths(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
              />
              <MoveHorizontal size={16} className="text-blue-500" />
              <span className="text-sm text-gray-300">Transfer Paths</span>
            </label>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-300">Filters</h3>

            <label className="flex items-center space-x-3 cursor-pointer hover-lift">
              <input
                type="checkbox"
                checked={filterEmpty}
                onChange={(e) => setFilterEmpty(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Empty Bins Only</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer hover-lift">
              <input
                type="checkbox"
                checked={filterLowStock}
                onChange={(e) => setFilterLowStock(e.target.checked)}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-300">Low Stock Only</span>
            </label>
          </div>

          {/* Zone Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-300">Zone Overview</h3>
            <div className="glass-card p-4">
              {["A"].map((zone) => {
                const zoneBins = bins.filter((b) => b.location.zone === zone);
                const utilization =
                  zoneBins.length > 0
                    ? (zoneBins.filter((b) => !b.isEmpty).length /
                        zoneBins.length) *
                      100
                    : 0;

                return (
                  <div key={zone} className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      Zone {zone}
                    </div>
                    <div className="text-lg text-blue-400 mb-1">
                      {Math.round(utilization)}% Utilized
                    </div>
                    <div className="text-sm text-gray-400">
                      {zoneBins.filter((b) => !b.isEmpty).length} /{" "}
                      {zoneBins.length} bins occupied
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="glass-card p-2">
                        <div className="text-green-400 font-bold">
                          {
                            stockLevels.filter((s) => s.status === "healthy")
                              .length
                          }
                        </div>
                        <div className="text-gray-500">Healthy</div>
                      </div>
                      <div className="glass-card p-2">
                        <div className="text-yellow-400 font-bold">
                          {
                            stockLevels.filter((s) => s.status === "warning")
                              .length
                          }
                        </div>
                        <div className="text-gray-500">Warning</div>
                      </div>
                      <div className="glass-card p-2">
                        <div className="text-red-400 font-bold">
                          {stockLevels.filter((s) => s.status === "low").length}
                        </div>
                        <div className="text-gray-500">Low</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTransferMode(!transferMode)}
              className={`btn-primary w-full flex items-center justify-center ${
                transferMode ? "bg-gradient-to-r from-blue-600 to-blue-700" : ""
              }`}
            >
              <MoveHorizontal className="mr-2" size={18} />
              {transferMode ? "Cancel Transfer" : "Transfer Mode"}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowCreateBinModal(true)}
              className="btn-primary w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500"
            >
              <Plus className="mr-2" size={18} />
              Create Bin
            </motion.button>
          </div>
        </div>

        {/* Main Map Area */}
        <div className="flex-1 glass-card relative overflow-hidden">
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="p-3 glass-card hover-glow"
            >
              <ZoomIn size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="p-3 glass-card hover-glow"
            >
              <ZoomOut size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleResetView}
              className="p-3 glass-card hover-glow"
            >
              <Home size={20} />
            </motion.button>
          </div>

          {/* Transfer Mode Indicator */}
          {transferMode && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-4 z-10 glass-card px-4 py-2"
            >
              <div className="flex items-center space-x-2">
                <Target size={20} className="text-blue-400" />
                <span className="text-sm">
                  {transferSource
                    ? `Select destination for ${transferSource.id}`
                    : "Select source bin to transfer from"}
                </span>
              </div>
            </motion.div>
          )}

          {/* Warehouse Map SVG */}
          <div
            ref={mapRef}
            className="w-full h-full p-8"
            style={{
              transform: `scale(${mapZoom}) translate(${mapPan.x}px, ${mapPan.y}px)`,
              transformOrigin: "center center",
              transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <svg
              className="w-full h-full"
              viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
            >
              {/* Zone A Background */}
              <motion.g>
                {/* Zone Background */}
                <motion.rect
                  x={20}
                  y={20}
                  width={viewBox.width - 40}
                  height={viewBox.height - 40}
                  className="glass-card"
                  fill="rgba(255, 255, 255, 0.02)"
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={1}
                  rx={16}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{
                    fill: "rgba(59, 130, 246, 0.05)",
                    transition: { duration: 0.3 },
                  }}
                />

                {/* Zone Label */}
                <motion.rect
                  x={20}
                  y={20}
                  width={viewBox.width - 40}
                  height={layoutConfig.zoneHeaderHeight}
                  fill="rgba(59, 130, 246, 0.1)"
                  rx={16}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 20, opacity: 1 }}
                  transition={{ type: "spring" }}
                />
                <motion.text
                  x={viewBox.width / 2}
                  y={60}
                  textAnchor="middle"
                  className="fill-white text-2xl font-bold"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Zone A - Main Warehouse
                </motion.text>

                {/* Zone Stats */}
                <motion.text
                  x={viewBox.width / 2}
                  y={viewBox.height - 30}
                  textAnchor="middle"
                  className="fill-gray-400 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {
                    bins.filter((b) => b.location.zone === "A" && !b.isEmpty)
                      .length
                  }{" "}
                  / {bins.filter((b) => b.location.zone === "A").length} bins
                  occupied
                </motion.text>
              </motion.g>

              {/* Aisle Backgrounds and Labels */}
              {Array.from({ length: 4 }, (_, aisleIndex) => {
                // Changed from 6 to 4
                const aisleX =
                  layoutConfig.paddingX +
                  aisleIndex *
                    (layoutConfig.aisleWidth + layoutConfig.aisleGap) +
                  layoutConfig.aisleWidth / 2;

                return (
                  <g key={`A-aisle-${aisleIndex}`}>
                    {/* Aisle Background */}
                    <motion.rect
                      x={aisleX - layoutConfig.aisleWidth / 2}
                      y={layoutConfig.paddingY - 20}
                      width={layoutConfig.aisleWidth}
                      height={6 * layoutConfig.binSpacing + 40} // Height to contain all 6 positions
                      fill="rgba(59, 130, 246, 0.03)"
                      stroke="rgba(59, 130, 246, 0.1)"
                      strokeWidth={1}
                      strokeDasharray="8,4"
                      rx={12}
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: aisleIndex * 0.1,
                        ease: "easeOut",
                      }}
                    />

                    {/* Row Labels (A1, A2, etc.) */}
                    <motion.g
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: aisleIndex * 0.1 + 0.5 }}
                    >
                      {/* Left Row Label */}
                      <rect
                        x={aisleX - layoutConfig.rowGap / 2 - 20}
                        y={layoutConfig.paddingY - 35}
                        width={40}
                        height={25}
                        fill="rgba(59, 130, 246, 0.2)"
                        rx={6}
                      />
                      <text
                        x={aisleX - layoutConfig.rowGap / 2}
                        y={layoutConfig.paddingY - 18}
                        textAnchor="middle"
                        className="fill-white text-sm font-bold"
                      >
                        A{aisleIndex * 2 + 1}
                      </text>

                      {/* Right Row Label */}
                      <rect
                        x={aisleX + layoutConfig.rowGap / 2 - 20}
                        y={layoutConfig.paddingY - 35}
                        width={40}
                        height={25}
                        fill="rgba(59, 130, 246, 0.2)"
                        rx={6}
                      />
                      <text
                        x={aisleX + layoutConfig.rowGap / 2}
                        y={layoutConfig.paddingY - 18}
                        textAnchor="middle"
                        className="fill-white text-sm font-bold"
                      >
                        A{aisleIndex * 2 + 2}
                      </text>
                    </motion.g>
                    {/* Row indicators inside aisle - removed since we now have A1, A2, etc. */}
                  </g>
                );
              })}

              {/* Position Labels on the left */}
              {Array.from({ length: 6 }, (_, posIndex) => (
                <motion.text
                  key={`pos-${posIndex}`}
                  x={60}
                  y={
                    layoutConfig.paddingY +
                    20 +
                    posIndex * layoutConfig.binSpacing +
                    5
                  }
                  textAnchor="middle"
                  className="fill-gray-500 text-xs font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: posIndex * 0.05 }}
                >
                  P{posIndex + 1}
                </motion.text>
              ))}

              {/* Bins with Enhanced Effects */}
              {filteredBins.map((bin, index) => {
                const binStock = stockLevels.filter((s) => s.binId === bin.id);
                const hasLowStock = binStock.some(
                  (s) => s.status === "low" || s.status === "warning",
                );
                const isTransferTarget =
                  transferMode &&
                  transferSource &&
                  transferSource.id !== bin.id;

                return (
                  <motion.g
                    key={bin.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: index * 0.002,
                      type: "spring",
                      stiffness: 200,
                    }}
                    style={{
                      transformOrigin: `${bin.position.x}px ${bin.position.y}px`,
                    }}
                  >
                    {/* Glow Effect for Interactive State */}
                    {isTransferTarget && (
                      <motion.circle
                        cx={bin.position.x}
                        cy={bin.position.y}
                        r={40}
                        fill="url(#transferGlow)"
                        opacity={0.3}
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}

                    {/* Heatmap overlay with animation */}
                    {showHeatmap && (
                      <rect
                        x={bin.position.x - layoutConfig.binSize / 2 - 5}
                        y={bin.position.y - layoutConfig.binSize / 2 - 5}
                        width={layoutConfig.binSize + 10}
                        height={layoutConfig.binSize + 10}
                        fill="url(#heatmapGradient)"
                        opacity={getHeatmapOpacity(bin)}
                        rx={8}
                        className="pointer-events-none"
                      />
                    )}

                    {/* 3D Effect Shadow */}
                    <ellipse
                      cx={bin.position.x}
                      cy={bin.position.y + layoutConfig.binSize / 2 + 5}
                      rx={layoutConfig.binSize / 2}
                      ry={6}
                      fill="rgba(0, 0, 0, 0.3)"
                      className="pointer-events-none"
                    />

                    {/* Main Bin with 3D Effect */}
                    <motion.g
                      whileHover={{
                        scale: 1.1,
                        y: -3,
                        transition: {
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        },
                      }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBinClick(bin)}
                      className="cursor-pointer"
                      style={{
                        transformOrigin: `${bin.position.x}px ${bin.position.y}px`,
                      }}
                    >
                      {/* Bin Back Face (3D Effect) */}
                      <rect
                        x={bin.position.x - layoutConfig.binSize / 2 + 2}
                        y={bin.position.y - layoutConfig.binSize / 2 + 2}
                        width={layoutConfig.binSize - 4}
                        height={layoutConfig.binSize - 4}
                        fill={getBinColor(bin)}
                        opacity={0.6}
                        rx={6}
                        transform={`translate(4, 4)`}
                      />

                      {/* Bin Main Face */}
                      <rect
                        x={bin.position.x - layoutConfig.binSize / 2}
                        y={bin.position.y - layoutConfig.binSize / 2}
                        width={layoutConfig.binSize}
                        height={layoutConfig.binSize}
                        fill={getBinColor(bin)}
                        stroke={
                          selectedBin?.id === bin.id ? "#3b82f6" : "transparent"
                        }
                        strokeWidth={selectedBin?.id === bin.id ? 2 : 0}
                        rx={8}
                        filter="url(#binGlow)"
                      />

                      {/* Selection Glow Effect */}
                      {selectedBin?.id === bin.id && (
                        <rect
                          x={bin.position.x - layoutConfig.binSize / 2 - 4}
                          y={bin.position.y - layoutConfig.binSize / 2 - 4}
                          width={layoutConfig.binSize + 8}
                          height={layoutConfig.binSize + 8}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth={1}
                          opacity={0.5}
                          rx={10}
                          className="pointer-events-none"
                        />
                      )}

                      {/* Level Indicator */}
                      <text
                        x={bin.position.x}
                        y={bin.position.y + 4}
                        textAnchor="middle"
                        className="fill-white text-xs font-bold pointer-events-none"
                        opacity={0.9}
                      >
                        L{bin.location.level}
                      </text>
                    </motion.g>

                    {/* Low Stock Alert - Outside hover group, above selection */}
                    {showAlerts && hasLowStock && (
                      <motion.g
                        initial={{ scale: 1 }}
                        animate={{
                          scale: 1,
                          y: selectedBin?.id === bin.id ? -3 : 0,
                        }}
                        style={{
                          transformOrigin: `${bin.position.x + layoutConfig.binSize / 2 + 5}px ${bin.position.y - layoutConfig.binSize / 2 - 5}px`,
                        }}
                        className="pointer-events-none"
                      >
                        <motion.circle
                          cx={bin.position.x + layoutConfig.binSize / 2 + 5}
                          cy={bin.position.y - layoutConfig.binSize / 2 - 5}
                          r={12}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth={1.5}
                          initial={{ scale: 0.8, opacity: 1 }}
                          animate={{
                            scale: [0.8, 1.5, 0.8],
                            opacity: [1, 0, 1],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle
                          cx={bin.position.x + layoutConfig.binSize / 2 + 5}
                          cy={bin.position.y - layoutConfig.binSize / 2 - 5}
                          r={6}
                          fill="#f59e0b"
                          animate={{
                            scale: [1, 1.1, 1],
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          <animate
                            attributeName="fill"
                            values="#f59e0b;#ef4444;#f59e0b"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </motion.circle>
                      </motion.g>
                    )}

                    {/* Floating Info on Hover - Outside the clickable group */}
                    {selectedBin?.id !== bin.id && (
                      <motion.g
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        className="pointer-events-none"
                        style={{ pointerEvents: "none" }}
                      >
                        <rect
                          x={bin.position.x - 40}
                          y={bin.position.y - 55}
                          width={80}
                          height={30}
                          fill="rgba(0, 0, 0, 0.9)"
                          rx={8}
                          className="pointer-events-none"
                        />
                        <text
                          x={bin.position.x}
                          y={bin.position.y - 35}
                          textAnchor="middle"
                          className="fill-white text-sm font-medium pointer-events-none"
                        >
                          {bin.id}
                        </text>
                      </motion.g>
                    )}

                    {/* Transfer Source Indicator with Pulse */}
                    {transferSource?.id === bin.id && (
                      <>
                        <motion.circle
                          cx={bin.position.x}
                          cy={bin.position.y}
                          r={35}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          strokeDasharray="8,4"
                          initial={{ scale: 0, rotate: 0 }}
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: 360,
                          }}
                          transition={{
                            scale: { duration: 1.5, repeat: Infinity },
                            rotate: {
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear",
                            },
                          }}
                        />
                        <motion.text
                          x={bin.position.x}
                          y={bin.position.y - 45}
                          textAnchor="middle"
                          className="fill-blue-400 text-sm font-bold"
                          initial={{ opacity: 0, y: 5 }}
                          animate={{
                            opacity: [0, 1, 1, 0],
                            y: [5, 0, 0, -5],
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          SOURCE
                        </motion.text>
                      </>
                    )}
                  </motion.g>
                );
              })}

              {/* Transfer Paths with Animated Particles */}
              {showTransferPaths &&
                transfers.slice(0, 5).map((transfer, index) => {
                  const sourceBin = bins.find(
                    (b) => b.id === transfer.sourceBin,
                  );
                  const destBin = bins.find(
                    (b) => b.id === transfer.destinationBin,
                  );

                  if (!sourceBin || !destBin) return null;

                  return (
                    <g key={transfer.id}>
                      <motion.line
                        x1={sourceBin.position.x}
                        y1={sourceBin.position.y}
                        x2={destBin.position.x}
                        y2={destBin.position.y}
                        stroke="url(#transferGradient)"
                        strokeWidth={2}
                        strokeDasharray="5,5"
                        opacity={0.4}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: index * 0.2 }}
                      />
                      {/* Animated Particle Along Path */}
                      <motion.circle
                        r={5}
                        fill="#3b82f6"
                        filter="url(#particleGlow)"
                        initial={{
                          x: sourceBin.position.x,
                          y: sourceBin.position.y,
                        }}
                        animate={{
                          x: destBin.position.x,
                          y: destBin.position.y,
                        }}
                        transition={{
                          duration: 3,
                          delay: index * 0.3,
                          repeat: Infinity,
                          repeatDelay: 1,
                        }}
                      />
                    </g>
                  );
                })}

              {/* SVG Filters and Gradients */}
              <defs>
                <linearGradient
                  id="transferGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                </linearGradient>

                <radialGradient id="transferGlow">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>

                <radialGradient id="heatmapGradient">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#eab308" />
                </radialGradient>

                <filter id="binGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <filter id="particleGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </div>
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {showSidePanel && selectedBin && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-96 glass-card p-6 overflow-y-auto"
            >
              <SidePanel
                bin={selectedBin}
                stockLevels={stockLevels.filter(
                  (s) => s.binId === selectedBin.id,
                )}
                onClose={() => setShowSidePanel(false)}
                onTransfer={() => {
                  setTransferMode(true);
                  setTransferSource(selectedBin);
                  setShowSidePanel(false);
                }}
                onEdit={() => console.log("Edit bin")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTransferModal && (
          <TransferModal
            sourceBin={transferSource}
            destinationBin={selectedBin}
            stockLevels={stockLevels}
            onTransfer={handleTransferStock}
            onClose={() => {
              setShowTransferModal(false);
              setTransferMode(false);
              setTransferSource(null);
            }}
          />
        )}

        {showCreateBinModal && (
          <CreateBinModal
            onCreateBin={(newBin) => {
              // Calculate position for new bin using layoutConfig
              const aisleIndex = newBin.aisle - 1;
              const rowIndex = newBin.row - 1;
              const positionIndex = newBin.position - 1;

              // Calculate aisle center position
              const aisleX =
                layoutConfig.paddingX +
                aisleIndex * (layoutConfig.aisleWidth + layoutConfig.aisleGap) +
                layoutConfig.aisleWidth / 2;

              const x =
                aisleX +
                (rowIndex === 0
                  ? -layoutConfig.rowGap / 2
                  : layoutConfig.rowGap / 2);
              const y =
                layoutConfig.paddingY +
                20 +
                positionIndex * layoutConfig.binSpacing;

              setBins((prev) => [
                ...prev,
                {
                  ...newBin,
                  id: `${newBin.zone}${newBin.aisle.toString().padStart(2, "0")}-${newBin.row}${newBin.position}`,
                  location: newBin,
                  capacity: 100,
                  currentVolume: 0,
                  isEmpty: true,
                  isLocked: false,
                  lastActivity: new Date().toISOString(),
                  position: { x, y },
                },
              ]);
              toast.success(
                `Created bin ${newBin.zone}${newBin.aisle.toString().padStart(2, "0")}-${newBin.row}${newBin.position}`,
              );
              setShowCreateBinModal(false);
            }}
            onClose={() => setShowCreateBinModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Side Panel Component
const SidePanel = ({ bin, stockLevels, onClose, onTransfer, onEdit }) => {
  const utilizationPercent = (bin.currentVolume / bin.capacity) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{bin.id}</h2>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="close-btn"
        >
          <X size={20} />
        </motion.button>
      </div>

      {/* Bin Info */}
      <div className="space-y-4">
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-3 text-gray-300">Bin Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Zone:</span>
              <span className="ml-2 font-medium text-white">
                {bin.location.zone}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Type:</span>
              <span className="ml-2 font-medium text-white capitalize">
                {bin.type}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Aisle:</span>
              <span className="ml-2 font-medium text-white">
                {bin.location.aisle}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Rack:</span>
              <span className="ml-2 font-medium text-white">
                {bin.location.rack}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Utilization</span>
              <span className="font-medium">
                {utilizationPercent.toFixed(0)}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className={`progress-fill ${
                  utilizationPercent > 90
                    ? "bg-gradient-to-r from-red-500 to-red-600"
                    : utilizationPercent > 70
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-green-500 to-emerald-500"
                }`}
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stock Levels */}
        <div className="glass-card p-4">
          <h3 className="font-semibold mb-3 text-gray-300">
            Stock Items ({stockLevels.length})
          </h3>
          {stockLevels.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No items in this bin
            </p>
          ) : (
            <div className="space-y-3">
              {stockLevels.map((item) => (
                <motion.div
                  key={item.id}
                  className="pillar-card p-3"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium font-mono text-blue-400">
                        {item.sku}
                      </p>
                      <p className="text-sm text-gray-400">{item.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl">{item.systemQuantity}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.status === "low"
                            ? "bg-red-500/20 text-red-400"
                            : item.status === "warning"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                  {item.expiryDate && (
                    <p className="text-xs text-yellow-400 mt-2 flex items-center">
                      <AlertCircle size={12} className="mr-1" />
                      Expires: {formatDate(item.expiryDate)}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onTransfer}
            className="btn-primary w-full flex items-center justify-center"
          >
            <MoveHorizontal className="mr-2" size={18} />
            Transfer Stock
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onEdit}
            className="w-full p-3 glass-card hover:bg-gray-800/50 rounded-lg transition-all flex items-center justify-center"
          >
            <Edit className="mr-2" size={18} />
            Adjust Stock
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full p-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg transition-all flex items-center justify-center"
          >
            <Eye className="mr-2" size={18} />
            Cycle Count
          </motion.button>
        </div>
      </div>
    </div>
  );
};

// Transfer Modal Component
const TransferModal = ({
  sourceBin,
  destinationBin,
  stockLevels,
  onTransfer,
  onClose,
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  const sourceStock = stockLevels.filter((s) => s.binId === sourceBin?.id);

  const handleTransfer = () => {
    const items = selectedItems
      .map((sku) => ({
        sku,
        quantity: parseInt(quantities[sku] || 0),
      }))
      .filter((item) => item.quantity > 0);

    if (items.length === 0) {
      toast.error("Select items and quantities to transfer");
      return;
    }

    onTransfer({
      sourceBin: sourceBin.id,
      destinationBin: destinationBin.id,
      items,
      type: "bin-to-bin",
    });
  };

  return (
    <div className="modal-backdrop flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-content max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Transfer Stock</h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="close-btn"
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between p-4 glass-card">
            <motion.div
              className="text-center flex-1"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-sm text-gray-400">From</p>
              <p className="text-xl font-bold text-blue-400">{sourceBin?.id}</p>
            </motion.div>
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="text-gray-400 mx-4" size={24} />
            </motion.div>
            <motion.div
              className="text-center flex-1"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-sm text-gray-400">To</p>
              <p className="text-xl font-bold text-green-400">
                {destinationBin?.id}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h4 className="font-semibold text-gray-300">
            Select Items to Transfer
          </h4>
          {sourceStock.map((item) => (
            <motion.div
              key={item.sku}
              className="flex items-center space-x-4 p-3 glass-card"
              whileHover={{ scale: 1.01 }}
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(item.sku)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedItems([...selectedItems, item.sku]);
                  } else {
                    setSelectedItems(
                      selectedItems.filter((s) => s !== item.sku),
                    );
                  }
                }}
                className="w-4 h-4 rounded text-blue-500 focus:ring-blue-500"
              />
              <div className="flex-1">
                <p className="font-medium font-mono text-blue-400">
                  {item.sku}
                </p>
                <p className="text-sm text-gray-400">{item.name}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">
                  Available: {item.systemQuantity}
                </p>
              </div>
              <input
                type="number"
                min="0"
                max={item.systemQuantity}
                value={quantities[item.sku] || ""}
                onChange={(e) =>
                  setQuantities({ ...quantities, [item.sku]: e.target.value })
                }
                className="input-field w-20 text-center"
                placeholder="Qty"
                disabled={!selectedItems.includes(item.sku)}
              />
            </motion.div>
          ))}
        </div>

        <div className="flex space-x-4">
          <motion.button
            onClick={handleTransfer}
            className="btn-primary flex-1"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Confirm Transfer
          </motion.button>
          <motion.button
            onClick={onClose}
            className="flex-1 py-3 glass-card hover:bg-gray-800/50 rounded-lg transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// Create Bin Modal Component
const CreateBinModal = ({ onCreateBin, onClose }) => {
  const [binData, setBinData] = useState({
    zone: "A",
    aisle: 1,
    row: 1,
    position: 1,
    type: "standard",
  });

  const handleCreate = () => {
    onCreateBin(binData);
  };

  return (
    <div className="modal-backdrop flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="modal-content max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold">Create New Bin</h3>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="close-btn"
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Zone
              </label>
              <select
                value={binData.zone}
                onChange={(e) =>
                  setBinData({ ...binData, zone: e.target.value })
                }
                className="input-field w-full"
              >
                <option value="A">A</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aisle
              </label>
              <input
                type="number"
                min="1"
                max="4"
                value={binData.aisle}
                onChange={(e) =>
                  setBinData({ ...binData, aisle: parseInt(e.target.value) })
                }
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Row
              </label>
              <select
                value={binData.row}
                onChange={(e) =>
                  setBinData({ ...binData, row: parseInt(e.target.value) })
                }
                className="input-field w-full"
              >
                <option value={1}>Row 1 (Left)</option>
                <option value={2}>Row 2 (Right)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Position
              </label>
              <input
                type="number"
                min="1"
                max="6"
                value={binData.position}
                onChange={(e) =>
                  setBinData({ ...binData, position: parseInt(e.target.value) })
                }
                className="input-field w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bin Type
            </label>
            <select
              value={binData.type}
              onChange={(e) => setBinData({ ...binData, type: e.target.value })}
              className="input-field w-full"
            >
              <option value="floor">Floor Level</option>
              <option value="standard">Standard</option>
              <option value="high">High Level</option>
            </select>
          </div>

          <motion.div
            className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-sm text-blue-400">
              New bin ID:{" "}
              <span className="font-mono font-bold text-lg">
                {binData.zone}
                {binData.aisle.toString().padStart(2, "0")}-{binData.row}
                {binData.position}
              </span>
            </p>
          </motion.div>
        </div>

        <div className="flex space-x-4 mt-6">
          <motion.button
            onClick={handleCreate}
            className="btn-primary flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Create Bin
          </motion.button>
          <motion.button
            onClick={onClose}
            className="flex-1 py-3 glass-card hover:bg-gray-800/50 rounded-lg transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default StockControl;
