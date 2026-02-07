import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import OrderQueue from '../components/OrderQueue';
import BaristaBoard from '../components/BaristaBoard';
import MetricsPanel from '../components/MetricsPanel';
import SimulationControls from '../components/SimulationControls';
import MenuOrder from '../components/MenuOrder';
import * as api from '../services/api';

function Dashboard() {
  const [queueMode, setQueueMode] = useState('SMART'); // FIFO or SMART
  const [orders, setOrders] = useState([]);
  const [baristas, setBaristas] = useState([]);
  const [metrics, setMetrics] = useState({});

  // Polling interval for updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 3000); // Poll every 3 seconds

    fetchData(); // Initial fetch
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, baristasData, metricsData] = await Promise.all([
        api.getOrderQueue(),
        api.getBaristaStatus(),
        api.getMetrics()
      ]);
      
      setOrders(ordersData);
      setBaristas(baristasData);
      setMetrics(metricsData);
      
      // Update mode from backend
      if (metricsData.currentMode) {
        setQueueMode(metricsData.currentMode);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const toggleMode = async () => {
    const newMode = queueMode === 'FIFO' ? 'SMART' : 'FIFO';
    try {
      await api.switchQueueMode(newMode);
      setQueueMode(newMode);
      fetchData(); // Refresh data after mode switch
    } catch (error) {
      console.error('Failed to switch mode:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-coffee-dark">
            ☕ Smart Coffee Queue
          </h1>
          
          {/* Mode Toggle & Analytics Link */}
          <div className="flex items-center gap-4">
            <Link 
              to="/analytics"
              className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors"
            >
              📊 View Analytics
            </Link>
            
            <span className="text-gray-600 font-medium">Queue Mode:</span>
            <button
              onClick={toggleMode}
              className={`px-6 py-2 rounded-lg font-bold text-white transition-all ${
                queueMode === 'SMART'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-500 hover:bg-gray-600'
              }`}
            >
              {queueMode === 'SMART' ? '🧠 SMART MODE' : '📋 FIFO MODE'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Queue */}
        <div className="lg:col-span-2">
          <OrderQueue orders={orders} mode={queueMode} />
        </div>

        {/* Right Column - Baristas & Controls */}
        <div className="space-y-6">
          <BaristaBoard baristas={baristas} />
          <SimulationControls onUpdate={fetchData} />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="max-w-7xl mx-auto mt-6">
        <MetricsPanel metrics={metrics} />
      </div>

      {/* Menu Order Section */}
      <div className="max-w-7xl mx-auto mt-6">
        <MenuOrder onUpdate={fetchData} />
      </div>
    </div>
  );
}

export default Dashboard;
