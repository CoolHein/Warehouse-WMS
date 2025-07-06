import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  Package, 
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Calendar,
  BarChart3,
  FileText,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  X,
  Send,
  AlertTriangle,
  MapPin,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Home,
  Target,
  Route,
  Timer,
  Users,
  Globe,
  List,
  MousePointer
} from 'lucide-react';

// Mock warehouse context hook
const useWarehouse = () => ({
  user: { name: 'John Doe', stats: { ordersShipped: 150 } },
  addXP: (points, reason) => console.log(`+${points} XP: ${reason}`),
  playSound: (sound) => console.log(`Playing sound: ${sound}`),
  updateStats: (stats) => console.log('Stats updated:', stats)
});

const toast = {
  success: (msg) => console.log('Success:', msg),
  error: (msg) => console.log('Error:', msg)
};

// New Zealand cities with approximate coordinates for map visualization
const NZ_CITIES = {
  'Auckland': { x: 500, y: 150, name: 'Auckland' },
  'Wellington': { x: 520, y: 400, name: 'Wellington' },
  'Christchurch': { x: 580, y: 500, name: 'Christchurch' },
  'Hamilton': { x: 480, y: 200, name: 'Hamilton' },
  'Tauranga': { x: 540, y: 220, name: 'Tauranga' },
  'Dunedin': { x: 560, y: 600, name: 'Dunedin' },
  'Palmerston North': { x: 500, y: 350, name: 'Palmerston North' },
  'Napier': { x: 580, y: 320, name: 'Napier' },
  'Nelson': { x: 480, y: 420, name: 'Nelson' },
  'Rotorua': { x: 520, y: 250, name: 'Rotorua' }
};

// Warehouse location (Auckland)
const WAREHOUSE_LOCATION = { x: 500, y: 150 };

const Shipping = () => {
  const { user, addXP, playSound, updateStats } = useWarehouse();
  
  // Core state
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);
  
  // Map state
  const [mapView, setMapView] = useState('map'); // 'map' or 'list'
  const [mapZoom, setMapZoom] = useState(1);
  const [mapCenter, setMapCenter] = useState({ x: 0, y: 0 });
  const [clusteredShipments, setClusteredShipments] = useState({});
  
  // Timeline state
  const [timelineActive, setTimelineActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(24); // Hours from now (24 = current time)
  const [timelineRange] = useState(48); // 48 hours
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCarrier, setFilterCarrier] = useState('all');
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  // Alerts
  const [stalledShipments, setStalledShipments] = useState([]);
  const [showReportIssue, setShowReportIssue] = useState(false);
  const [issueDetails, setIssueDetails] = useState({ shipmentId: '', issue: '', notes: '' });
  
  // Stats
  const [stats, setStats] = useState({
    totalShipped: 0,
    inTransit: 0,
    delivered: 0,
    avgDeliveryTime: 0,
    accuracyRate: 100
  });
  
  const mapRef = useRef(null);
  const timelineRef = useRef(null);
  
  const carriers = ['NZ Post', 'CourierPost', 'DHL Express', 'FedEx', 'Aramex'];
  const issueTypes = [
    'Potential Delay',
    'Wrong items shipped',
    'Missing items',
    'Damaged packaging',
    'Incorrect address',
    'Delivery issues',
    'Other'
  ];

  useEffect(() => {
    loadShipments();
    const interval = setInterval(loadShipments, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    calculateStats();
    clusterShipments();
    detectStalledShipments();
  }, [shipments]);

  useEffect(() => {
    if (timelineActive) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev <= 0) {
            setTimelineActive(false);
            return 24;
          }
          return prev - 0.5;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [timelineActive]);

  const loadShipments = () => {
    // Generate realistic mock shipment data
    const mockShipments = Array.from({ length: 25 }, (_, i) => {
      const cities = Object.keys(NZ_CITIES);
      const destinationCity = cities[Math.floor(Math.random() * cities.length)];
      const carrier = carriers[Math.floor(Math.random() * carriers.length)];
      const hoursAgo = Math.floor(Math.random() * 48);
      const status = Math.random() < 0.3 ? 'delivered' : Math.random() < 0.7 ? 'in-transit' : 'shipped';
      
      return {
        id: `SHP-${String(i + 1).padStart(4, '0')}`,
        orderId: `ORD-${String(i + 100).padStart(4, '0')}`,
        customer: {
          name: `Customer ${i + 1}`,
          address: `${Math.floor(Math.random() * 999) + 1} ${['Queen St', 'King St', 'Main St', 'High St'][Math.floor(Math.random() * 4)]}, ${destinationCity}`
        },
        destination: destinationCity,
        carrier,
        trackingNumber: `${carrier.replace(' ', '').toUpperCase()}${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`,
        status,
        shippedDate: new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString(),
        deliveredDate: status === 'delivered' ? new Date(Date.now() - Math.floor(Math.random() * 24) * 60 * 60 * 1000).toISOString() : null,
        estimatedDelivery: new Date(Date.now() + (24 + Math.floor(Math.random() * 48)) * 60 * 60 * 1000).toISOString(),
        items: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, j) => ({
          name: `Product ${j + 1}`,
          sku: `SKU-${String(j + 1).padStart(4, '0')}`,
          quantity: Math.floor(Math.random() * 5) + 1
        })),
        cost: Math.floor(Math.random() * 5000) / 100 + 5.99,
        weight: Math.floor(Math.random() * 500) / 100 + 0.5,
        hasIssue: Math.random() < 0.1,
        issueType: Math.random() < 0.1 ? issueTypes[Math.floor(Math.random() * issueTypes.length)] : null,
        hoursInTransit: hoursAgo,
        progress: Math.min(hoursAgo / 24, 1) // Progress between 0 and 1
      };
    });
    
    setShipments(mockShipments);
  };

  const calculateStats = () => {
    const totalShipped = shipments.length;
    const inTransit = shipments.filter(s => s.status === 'in-transit' || s.status === 'shipped').length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const avgDeliveryTime = 1.8; // Mock average
    const ordersWithIssues = shipments.filter(s => s.hasIssue).length;
    const accuracyRate = totalShipped > 0 ? ((totalShipped - ordersWithIssues) / totalShipped * 100) : 100;
    
    setStats({
      totalShipped,
      inTransit,
      delivered,
      avgDeliveryTime,
      accuracyRate: Math.round(accuracyRate)
    });
  };

  const clusterShipments = () => {
    const clusters = {};
    const clusterRadius = 50;
    
    shipments.forEach(shipment => {
      if (shipment.status === 'delivered') return;
      
      const destination = NZ_CITIES[shipment.destination];
      if (!destination) return;
      
      let clustered = false;
      
      for (const clusterKey in clusters) {
        const cluster = clusters[clusterKey];
        const distance = Math.sqrt(
          Math.pow(cluster.x - destination.x, 2) + 
          Math.pow(cluster.y - destination.y, 2)
        );
        
        if (distance < clusterRadius) {
          cluster.shipments.push(shipment);
          clustered = true;
          break;
        }
      }
      
      if (!clustered) {
        clusters[shipment.destination] = {
          x: destination.x,
          y: destination.y,
          destination: shipment.destination,
          shipments: [shipment]
        };
      }
    });
    
    setClusteredShipments(clusters);
  };

  const detectStalledShipments = () => {
    const stalled = shipments.filter(shipment => {
      if (shipment.status !== 'in-transit' && shipment.status !== 'shipped') return false;
      
      const hoursInTransit = shipment.hoursInTransit;
      const expectedDeliveryHours = 24; // Base expectation
      
      return hoursInTransit > expectedDeliveryHours * 1.5;
    });
    
    setStalledShipments(stalled);
  };

  const getShipmentPosition = (shipment) => {
    const destination = NZ_CITIES[shipment.destination];
    if (!destination) return WAREHOUSE_LOCATION;
    
    const progress = Math.min(shipment.progress, 1);
    
    return {
      x: WAREHOUSE_LOCATION.x + (destination.x - WAREHOUSE_LOCATION.x) * progress,
      y: WAREHOUSE_LOCATION.y + (destination.y - WAREHOUSE_LOCATION.y) * progress
    };
  };

  const getCarrierColor = (carrier) => {
    const colors = {
      'NZ Post': '#ef4444',
      'CourierPost': '#06b6d4',
      'DHL Express': '#f59e0b',
      'FedEx': '#8b5cf6',
      'Aramex': '#10b981'
    };
    return colors[carrier] || '#6b7280';
  };

  const handleShipmentClick = (shipment) => {
    setSelectedShipment(shipment);
    setShowSidePanel(true);
  };

  const handleClusterClick = (cluster) => {
    if (cluster.shipments.length === 1) {
      handleShipmentClick(cluster.shipments[0]);
    } else {
      // Zoom to cluster
      setMapCenter({
        x: -cluster.x * mapZoom + 400,
        y: -cluster.y * mapZoom + 300
      });
      setMapZoom(prev => Math.min(prev * 1.5, 3));
    }
  };

  const handleTimelineChange = (hours) => {
    setCurrentTime(hours);
  };

  const handleReportIssue = (shipmentId = null, suggestedIssue = null) => {
    setIssueDetails({
      shipmentId: shipmentId || '',
      issue: suggestedIssue || '',
      notes: ''
    });
    setShowReportIssue(true);
  };

  const submitIssueReport = () => {
    if (!issueDetails.shipmentId || !issueDetails.issue) {
      toast.error('Please fill all required fields');
      return;
    }

    const updatedShipments = shipments.map(s => {
      if (s.id === issueDetails.shipmentId) {
        return {
          ...s,
          hasIssue: true,
          issueType: issueDetails.issue,
          issueNotes: issueDetails.notes,
          issueReportedBy: user.name,
          issueReportedAt: new Date().toISOString()
        };
      }
      return s;
    });

    setShipments(updatedShipments);
    playSound('success');
    toast.success('Issue reported successfully');
    
    setShowReportIssue(false);
    setIssueDetails({ shipmentId: '', issue: '', notes: '' });
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         shipment.trackingNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || shipment.status === filterStatus;
    const matchesCarrier = filterCarrier === 'all' || shipment.carrier === filterCarrier;
    
    return matchesSearch && matchesStatus && matchesCarrier;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="glass-card border-b border-gray-700/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Live Logistics Map
            </h1>
            <p className="text-gray-400 mt-1">Real-time shipment tracking and analytics</p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center space-x-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.totalShipped}</div>
              <div className="text-xs text-gray-400 font-medium">Total Shipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats.inTransit}</div>
              <div className="text-xs text-gray-400 font-medium">In Transit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.delivered}</div>
              <div className="text-xs text-gray-400 font-medium">Delivered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{stalledShipments.length}</div>
              <div className="text-xs text-gray-400 font-medium">Stalled</div>
            </div>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMapView('map')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                mapView === 'map' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'glass-card hover:bg-white/10'
              }`}
            >
              <Globe size={20} />
            </button>
            <button
              onClick={() => setMapView('list')}
              className={`p-3 rounded-xl transition-all duration-200 ${
                mapView === 'list' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'glass-card hover:bg-white/10'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Controls Sidebar */}
        <div className="w-80 glass-card border-r border-gray-700/50 p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shipments..."
              className="input-field w-full pl-10"
            />
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-300">Filters</h3>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Status</option>
              <option value="shipped">Shipped</option>
              <option value="in-transit">In Transit</option>
              <option value="delivered">Delivered</option>
            </select>
            
            <select
              value={filterCarrier}
              onChange={(e) => setFilterCarrier(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">All Carriers</option>
              {carriers.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>

          {/* Stalled Shipments Alert */}
          {stalledShipments.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card bg-red-500/10 border border-red-500/30 rounded-xl p-4"
            >
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="text-red-400" size={20} />
                <h3 className="font-semibold text-red-400">Stalled Shipments</h3>
              </div>
              <p className="text-sm text-gray-300 mb-4">
                {stalledShipments.length} shipments may be experiencing delays
              </p>
              <div className="space-y-2">
                {stalledShipments.slice(0, 3).map(shipment => (
                  <motion.div
                    key={shipment.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg cursor-pointer hover:bg-red-500/30 transition-colors"
                    onClick={() => handleReportIssue(shipment.id, 'Potential Delay')}
                  >
                    <div>
                      <p className="font-medium text-sm">{shipment.id}</p>
                      <p className="text-xs text-gray-400">{shipment.hoursInTransit}h in transit</p>
                    </div>
                    <AlertTriangle size={16} className="text-red-400" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Map Controls */}
          {mapView === 'map' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300">Map Controls</h3>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setMapZoom(prev => Math.min(prev * 1.2, 3))}
                  className="flex-1 p-3 glass-card hover:bg-white/10 rounded-lg transition-all"
                >
                  <ZoomIn size={18} className="mx-auto" />
                </button>
                <button
                  onClick={() => setMapZoom(prev => Math.max(prev / 1.2, 0.5))}
                  className="flex-1 p-3 glass-card hover:bg-white/10 rounded-lg transition-all"
                >
                  <ZoomOut size={18} className="mx-auto" />
                </button>
                <button
                  onClick={() => { setMapZoom(1); setMapCenter({ x: 0, y: 0 }); }}
                  className="flex-1 p-3 glass-card hover:bg-white/10 rounded-lg transition-all"
                >
                  <Home size={18} className="mx-auto" />
                </button>
              </div>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={(e) => setShowHeatmap(e.target.checked)}
                  className="w-4 h-4 rounded accent-blue-500"
                />
                <span className="text-sm text-gray-300">Show Delivery Heatmap</span>
              </label>
            </div>
          )}

          {/* Timeline Controls */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-300">Timeline Playback</h3>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTimelineActive(!timelineActive)}
                className={`p-3 rounded-lg transition-all ${
                  timelineActive 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                } text-white shadow-lg`}
              >
                {timelineActive ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={() => { setCurrentTime(24); setTimelineActive(false); }}
                className="p-3 glass-card hover:bg-white/10 rounded-lg transition-all"
              >
                <RotateCcw size={18} />
              </button>
              <span className="text-sm text-gray-400 font-medium">
                {Math.round(currentTime)}h ago
              </span>
            </div>
            
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max={timelineRange}
                value={currentTime}
                onChange={(e) => handleTimelineChange(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / timelineRange) * 100}%, #374151 ${(currentTime / timelineRange) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>48h ago</span>
                <span>24h ago</span>
                <span>Now</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleReportIssue()}
              className="w-full btn-primary flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              <AlertTriangle className="mr-2" size={18} />
              Report Issue
            </button>
            
            <button
              onClick={() => window.print()}
              className="w-full p-3 glass-card hover:bg-white/10 rounded-xl transition-all flex items-center justify-center"
            >
              <Printer className="mr-2" size={18} />
              Print Reports
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative bg-gray-900/50">
          {mapView === 'map' ? (
            <MapView
              shipments={filteredShipments}
              clusteredShipments={clusteredShipments}
              mapZoom={mapZoom}
              mapCenter={mapCenter}
              showHeatmap={showHeatmap}
              currentTime={currentTime}
              onShipmentClick={handleShipmentClick}
              onClusterClick={handleClusterClick}
              getShipmentPosition={getShipmentPosition}
              getCarrierColor={getCarrierColor}
              stalledShipments={stalledShipments}
              onReportIssue={handleReportIssue}
            />
          ) : (
            <ListView
              shipments={filteredShipments}
              onShipmentClick={handleShipmentClick}
              getCarrierColor={getCarrierColor}
              stalledShipments={stalledShipments}
            />
          )}
        </div>

        {/* Side Panel */}
        <AnimatePresence>
          {showSidePanel && selectedShipment && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-96 glass-card border-l border-gray-700/50 p-6 overflow-y-auto"
            >
              <ShipmentDetailPanel
                shipment={selectedShipment}
                onClose={() => setShowSidePanel(false)}
                onReportIssue={handleReportIssue}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Report Issue Modal */}
      <AnimatePresence>
        {showReportIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="modal-content max-w-lg w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Report Shipping Issue</h3>
                <button
                  onClick={() => setShowReportIssue(false)}
                  className="close-btn"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Shipment ID</label>
                  <select
                    value={issueDetails.shipmentId}
                    onChange={(e) => setIssueDetails({...issueDetails, shipmentId: e.target.value})}
                    className="input-field w-full"
                  >
                    <option value="">Select shipment...</option>
                    {shipments.map(shipment => (
                      <option key={shipment.id} value={shipment.id}>
                        {shipment.id} - {shipment.customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Issue Type</label>
                  <select
                    value={issueDetails.issue}
                    onChange={(e) => setIssueDetails({...issueDetails, issue: e.target.value})}
                    className="input-field w-full"
                  >
                    <option value="">Select issue type...</option>
                    {issueTypes.map(issue => (
                      <option key={issue} value={issue}>{issue}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Additional Notes</label>
                  <textarea
                    value={issueDetails.notes}
                    onChange={(e) => setIssueDetails({...issueDetails, notes: e.target.value})}
                    className="input-field w-full resize-none"
                    rows={3}
                    placeholder="Provide additional details..."
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={submitIssueReport}
                    className="flex-1 btn-primary"
                    style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
                  >
                    Submit Report
                  </button>
                  <button
                    onClick={() => setShowReportIssue(false)}
                    className="flex-1 p-3 glass-card hover:bg-white/10 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Map View Component
const MapView = ({
  shipments,
  clusteredShipments,
  mapZoom,
  mapCenter,
  showHeatmap,
  currentTime,
  onShipmentClick,
  onClusterClick,
  getShipmentPosition,
  getCarrierColor,
  stalledShipments,
  onReportIssue
}) => {
  const timeAdjustedShipments = shipments.filter(shipment => {
    const hoursAgo = (Date.now() - new Date(shipment.shippedDate).getTime()) / (1000 * 60 * 60);
    return hoursAgo <= currentTime;
  });

  return (
    <div className="h-full relative overflow-hidden">
      {/* NZ Map SVG */}
      <div
        className="w-full h-full"
        style={{
          transform: `scale(${mapZoom}) translate(${mapCenter.x}px, ${mapCenter.y}px)`,
          transformOrigin: 'center center',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <svg className="w-full h-full" viewBox="0 0 800 700">
          {/* Map background glow */}
          <defs>
            <radialGradient id="mapGlow">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </radialGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Simplified NZ Map Outline */}
          <path
            d="M 450 100 Q 480 80 520 100 Q 560 120 580 160 Q 600 200 590 250 Q 580 300 560 340 Q 540 380 520 400 Q 500 420 480 440 Q 460 460 450 480 Q 440 500 450 520 Q 460 540 480 560 Q 500 580 520 590 Q 540 600 560 610 Q 580 620 600 640 Q 620 660 600 680 Q 580 700 560 690 Q 540 680 520 670 Q 500 660 480 650 Q 460 640 440 630 Q 420 620 410 600 Q 400 580 410 560 Q 420 540 430 520 Q 440 500 430 480 Q 420 460 410 440 Q 400 420 410 400 Q 420 380 430 360 Q 440 340 450 320 Q 460 300 470 280 Q 480 260 470 240 Q 460 220 450 200 Q 440 180 430 160 Q 420 140 430 120 Q 440 100 450 100 Z"
            fill="#0a0a0a"
            stroke="#1e293b"
            strokeWidth="2"
            filter="url(#glow)"
          />
          
          {/* Warehouse Location */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <circle
              cx={WAREHOUSE_LOCATION.x}
              cy={WAREHOUSE_LOCATION.y}
              r="10"
              fill="#3b82f6"
              stroke="#1e40af"
              strokeWidth="3"
              filter="url(#glow)"
            />
            <text
              x={WAREHOUSE_LOCATION.x}
              y={WAREHOUSE_LOCATION.y - 18}
              textAnchor="middle"
              className="fill-white text-sm font-semibold"
              style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
            >
              Warehouse
            </text>
          </motion.g>
          
          {/* Cities */}
          {Object.entries(NZ_CITIES).map(([city, pos]) => (
            <g key={city}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="5"
                fill="#374151"
                stroke="#4b5563"
                strokeWidth="1.5"
              />
              <text
                x={pos.x}
                y={pos.y - 12}
                textAnchor="middle"
                className="fill-gray-400 text-xs font-medium"
                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
              >
                {city}
              </text>
            </g>
          ))}
          
          {/* Delivery Heatmap */}
          {showHeatmap && Object.entries(NZ_CITIES).map(([city, pos]) => {
            const deliveries = shipments.filter(s => s.destination === city && s.status === 'delivered').length;
            const intensity = Math.min(deliveries / 5, 1);
            
            return (
              <motion.circle
                key={`heatmap-${city}`}
                cx={pos.x}
                cy={pos.y}
                r={30}
                fill="url(#mapGlow)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: intensity * 0.5, scale: 1 }}
                transition={{ duration: 0.5 }}
              />
            );
          })}
          
          {/* Shipment Clusters */}
          {Object.entries(clusteredShipments).map(([destination, cluster]) => {
            const clusterShipments = cluster.shipments.filter(s => 
              timeAdjustedShipments.includes(s) && s.status !== 'delivered'
            );
            
            if (clusterShipments.length === 0) return null;
            
            return (
              <g key={destination}>
                {clusterShipments.length > 1 ? (
                  <motion.g
                    className="cursor-pointer"
                    onClick={() => onClusterClick(cluster)}
                    whileHover={{ scale: 1.1 }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <circle
                      cx={cluster.x}
                      cy={cluster.y}
                      r="18"
                      fill="#3b82f6"
                      stroke="#1e40af"
                      strokeWidth="2"
                      filter="url(#glow)"
                    />
                    <text
                      x={cluster.x}
                      y={cluster.y + 5}
                      textAnchor="middle"
                      className="fill-white text-sm font-bold pointer-events-none"
                    >
                      {clusterShipments.length}
                    </text>
                  </motion.g>
                ) : (
                  <IndividualShipment
                    shipment={clusterShipments[0]}
                    position={getShipmentPosition(clusterShipments[0])}
                    color={getCarrierColor(clusterShipments[0].carrier)}
                    isStalled={stalledShipments.includes(clusterShipments[0])}
                    onClick={() => onShipmentClick(clusterShipments[0])}
                    onReportIssue={onReportIssue}
                  />
                )}
              </g>
            );
          })}
          
          {/* Delivered Shipments (last 24h) */}
          {timeAdjustedShipments
            .filter(s => s.status === 'delivered')
            .map(shipment => {
              const destination = NZ_CITIES[shipment.destination];
              if (!destination) return null;
              
              return (
                <motion.g 
                  key={`delivered-${shipment.id}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <circle
                    cx={destination.x}
                    cy={destination.y}
                    r="7"
                    fill="#10b981"
                    stroke="#059669"
                    strokeWidth="2"
                    opacity="0.8"
                    filter="url(#glow)"
                  />
                  <CheckCircle
                    x={destination.x - 4}
                    y={destination.y - 4}
                    width="8"
                    height="8"
                    className="fill-white"
                  />
                </motion.g>
              );
            })}
        </svg>
      </div>
    </div>
  );
};

// Individual Shipment Component
const IndividualShipment = ({
  shipment,
  position,
  color,
  isStalled,
  onClick,
  onReportIssue
}) => {
  return (
    <motion.g 
      className="cursor-pointer" 
      onClick={onClick}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.2 }}
    >
      {/* Route Line */}
      <line
        x1={WAREHOUSE_LOCATION.x}
        y1={WAREHOUSE_LOCATION.y}
        x2={position.x}
        y2={position.y}
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4,4"
        opacity="0.4"
      />
      
      {/* Shipment Icon */}
      <circle
        cx={position.x}
        cy={position.y}
        r="10"
        fill={color}
        stroke={isStalled ? '#ef4444' : '#1e293b'}
        strokeWidth={isStalled ? "3" : "2"}
        filter="url(#glow)"
      />
      
      {/* Truck Icon */}
      <Truck
        x={position.x - 5}
        y={position.y - 5}
        width="10"
        height="10"
        className="fill-white pointer-events-none"
      />
      
      {/* Stalled Alert */}
      {isStalled && (
        <motion.g
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onReportIssue(shipment.id, 'Potential Delay');
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <circle
            cx={position.x + 12}
            cy={position.y - 12}
            r="8"
            fill="#ef4444"
          />
          <AlertTriangle
            x={position.x + 8}
            y={position.y - 16}
            width="8"
            height="8"
            className="fill-white"
          />
        </motion.g>
      )}
    </motion.g>
  );
};

// List View Component
const ListView = ({ shipments, onShipmentClick, getCarrierColor, stalledShipments }) => {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-4">
        {shipments.map((shipment, index) => (
          <motion.div
            key={shipment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6 rounded-xl hover:bg-white/5 cursor-pointer transition-all group"
            onClick={() => onShipmentClick(shipment)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h3 className="font-semibold text-lg">{shipment.id}</h3>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCarrierColor(shipment.carrier) }}
                  />
                  <span className="text-sm text-gray-400">{shipment.carrier}</span>
                  {stalledShipments.includes(shipment) && (
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full font-medium">
                      STALLED
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-gray-400 mb-1">Customer</p>
                    <p className="font-medium">{shipment.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Destination</p>
                    <p className="font-medium">{shipment.destination}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Status</p>
                    <p className={`font-medium ${
                      shipment.status === 'delivered' ? 'text-green-400' :
                      shipment.status === 'in-transit' ? 'text-blue-400' :
                      'text-yellow-400'
                    }`}>
                      {shipment.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">
                  {shipment.hoursInTransit}h in transit
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  {shipment.trackingNumber}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Shipment Detail Panel Component
const ShipmentDetailPanel = ({ shipment, onClose, onReportIssue }) => {
  const journeySteps = [
    { label: 'Packed', completed: true, timestamp: shipment.shippedDate },
    { label: 'Shipped', completed: true, timestamp: shipment.shippedDate },
    { label: 'In Transit', completed: shipment.status !== 'shipped', timestamp: shipment.shippedDate },
    { label: 'Delivered', completed: shipment.status === 'delivered', timestamp: shipment.deliveredDate }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{shipment.id}</h2>
        <button
          onClick={onClose}
          className="close-btn"
        >
          <X size={20} />
        </button>
      </div>

      {/* Journey Tracker */}
      <div className="glass-card p-4 rounded-xl">
        <h3 className="font-semibold mb-4 text-gray-300">Delivery Journey</h3>
        <div className="space-y-3">
          {journeySteps.map((step, index) => (
            <div key={step.label} className="flex items-center space-x-3">
              <motion.div 
                className={`w-4 h-4 rounded-full ${
                  step.completed ? 'bg-green-500' : 'bg-gray-600'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
              <div className="flex-1">
                <p className={`font-medium ${
                  step.completed ? 'text-white' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                {step.timestamp && (
                  <p className="text-xs text-gray-500">
                    {new Date(step.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini Map */}
      <div className="glass-card p-4 rounded-xl">
        <h3 className="font-semibold mb-3 text-gray-300">Route</h3>
        <div className="h-32 bg-gray-800/50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500 text-sm">Mini route map visualization</p>
        </div>
      </div>

      {/* Shipment Details */}
      <div className="glass-card p-4 rounded-xl">
        <h3 className="font-semibold mb-4 text-gray-300">Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400 mb-1">Carrier</p>
            <p className="font-medium">{shipment.carrier}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Tracking</p>
            <p className="font-medium font-mono text-xs">{shipment.trackingNumber}</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Weight</p>
            <p className="font-medium">{shipment.weight}kg</p>
          </div>
          <div>
            <p className="text-gray-400 mb-1">Cost</p>
            <p className="font-medium">${shipment.cost.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="glass-card p-4 rounded-xl">
        <h3 className="font-semibold mb-4 text-gray-300">Items ({shipment.items.length})</h3>
        <div className="space-y-2">
          {shipment.items.map((item, index) => (
            <motion.div 
              key={index} 
              className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-gray-400">{item.sku}</p>
              </div>
              <span className="font-mono text-gray-300">×{item.quantity}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => onReportIssue(shipment.id)}
          className="w-full btn-primary flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
        >
          <AlertTriangle className="mr-2" size={18} />
          Report Issue
        </button>
        
        <button
          onClick={() => console.log('Print label')}
          className="w-full btn-primary flex items-center justify-center"
        >
          <Printer className="mr-2" size={18} />
          Print Label
        </button>
        
        <button
          onClick={() => window.open(`https://tracking.${shipment.carrier.toLowerCase().replace(' ', '')}.com/${shipment.trackingNumber}`, '_blank')}
          className="w-full p-3 glass-card hover:bg-white/10 rounded-xl transition-all flex items-center justify-center"
        >
          <Navigation className="mr-2" size={18} />
          Track with Carrier
        </button>
      </div>
    </div>
  );
};

export default Shipping;