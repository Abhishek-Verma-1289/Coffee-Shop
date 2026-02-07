import React, { useState, useEffect } from 'react';
import * as api from '../services/api';

function AnalyticsPage() {
  const [stats, setStats] = useState({
    avgCompletionTime: 0,
    totalComplaints: 0,
    complaintRate: 0,
    totalOrdersProcessed: 0,
    currentQueueSize: 0,
    baristaWorkload: {}
  });
  const [baristaBreakdown, setBaristaBreakdown] = useState([]);
  const [rushHourHistory, setRushHourHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [rushLoading, setRushLoading] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(null); // holds orderDetails array when open

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const [statsData, breakdown] = await Promise.all([
        api.getAnalyticsStats(),
        api.getBaristaBreakdown()
      ]);
      setStats(statsData);
      setBaristaBreakdown(breakdown.baristas || []);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleRushHour200 = async () => {
    setRushLoading(true);
    try {
      const response = await api.simulateRushHour100();
      console.log('Rush Hour Response:', response); // Debug log
      
      if (!response) {
        throw new Error('No response from server');
      }
      
      setRushHourHistory(prev => [
        { ...response, runNumber: prev.length + 1, timestamp: new Date().toLocaleTimeString() },
        ...prev
      ]);
      await loadStats();
    } catch (error) {
      console.error('Failed to simulate rush hour:', error);
      alert(`❌ Error simulating rush hour: ${error.message}`);
    } finally {
      setRushLoading(false);
    }
  };

  const StatCard = ({ icon, label, value, unit, color, subtitle }) => (
    <div className={`${color} rounded-lg p-6 shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-4xl">{icon}</div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-4xl font-bold text-gray-800">
        {value}
        <span className="text-lg text-gray-600 ml-1">{unit}</span>
      </p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );

  const getWorkloadColor = (workMinutes) => {
    if (workMinutes > 50) return 'bg-red-100';
    if (workMinutes > 30) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-light to-orange-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-coffee-dark mb-2">📊 Analytics Dashboard</h1>
              <p className="text-gray-600">Comprehensive statistics and performance metrics</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.history.back()}
                className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                ← Back to Dashboard
              </button>
              <button
                onClick={handleRushHour200}
                disabled={rushLoading}
                className={`${rushLoading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'} text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center gap-2`}
              >
                {rushLoading ? '⏳ Simulating...' : '🔥 Rush Hour (100 Orders)'}
              </button>
            </div>
          </div>
        </div>

        {/* Rush Hour Results */}
        {rushHourHistory.length > 0 && (() => {
          const rushHourStats = rushHourHistory[0]; // Latest run
          return (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow-lg p-6 mb-6 border-2 border-orange-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">🔥 Rush Hour — Run #{rushHourStats.runNumber} <span className="text-sm font-normal text-gray-500">({rushHourStats.timestamp})</span></h2>
              <div className="flex gap-2">
                {rushHourHistory.length > 1 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-semibold px-3 py-1 rounded border border-purple-300 hover:bg-purple-50"
                  >
                    {showHistory ? '▲ Hide' : '▼ Show'} History ({rushHourHistory.length - 1})
                  </button>
                )}
                <button
                  onClick={() => { setRushHourHistory([]); setShowHistory(false); }}
                  className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1 rounded border border-gray-300 hover:bg-gray-50"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* SMART Algorithm Results */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div
                className="bg-white rounded-lg p-4 shadow cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                onClick={() => rushHourStats.orderDetails && setShowOrderDetails(rushHourStats)}
              >
                <p className="text-sm text-gray-600 mb-1">Orders Served <span className="text-blue-500">(click to view)</span></p>
                <p className="text-3xl font-bold text-blue-600">
                  {rushHourStats.ordersServed ?? rushHourStats.totalOrders ?? 0}
                </p>
                {rushHourStats.ordersAbandoned > 0 && (
                  <p className="text-xs text-red-500 mt-1">{rushHourStats.ordersAbandoned} abandoned</p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 mb-1">Avg Wait Time</p>
                <p className="text-3xl font-bold text-green-600">
                  {typeof rushHourStats.averageWaitTime === 'number' ? rushHourStats.averageWaitTime.toFixed(1) : '—'}
                  <span className="text-lg ml-1">min</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Before service starts</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 mb-1">Avg Total Time</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {typeof rushHourStats.averageCompletionTime === 'number' ? rushHourStats.averageCompletionTime.toFixed(1) : '—'}
                  <span className="text-lg ml-1">min</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">Order to delivery</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow">
                <p className="text-sm text-gray-600 mb-1">Complaints / Timeouts</p>
                <p className="text-3xl font-bold text-red-600">
                  {rushHourStats.totalComplaints ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {rushHourStats.complaintRate ?? 0}% timeout rate
                </p>
              </div>
            </div>

            {/* SMART vs FIFO Comparison */}
            {rushHourStats.fifoComparison && (
              <div className="bg-white rounded-lg p-4 shadow mb-4">
                <h3 className="font-semibold text-gray-800 mb-3">⚡ SMART Priority vs FIFO (First-Come-First-Served)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left p-3 rounded-tl-lg">Metric</th>
                        <th className="text-center p-3 text-green-700 bg-green-50">🧠 SMART Priority</th>
                        <th className="text-center p-3 text-red-700 bg-red-50">📋 FIFO (Baseline)</th>
                        <th className="text-center p-3 text-blue-700 bg-blue-50 rounded-tr-lg">📈 Improvement</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Average Wait Time</td>
                        <td className="p-3 text-center font-bold text-green-600">{rushHourStats.averageWaitTime?.toFixed(1) ?? '—'} min</td>
                        <td className="p-3 text-center font-bold text-red-600">{rushHourStats.fifoComparison.averageWaitTime?.toFixed(1) ?? '—'} min</td>
                        <td className="p-3 text-center font-bold text-blue-600">
                          {rushHourStats.waitTimeImprovement > 0 ? '↓' : '↑'} {Math.abs(rushHourStats.waitTimeImprovement ?? 0)}%
                        </td>
                      </tr>
                      <tr className="border-t bg-gray-50">
                        <td className="p-3 font-medium">Avg Total Time</td>
                        <td className="p-3 text-center font-bold text-green-600">{rushHourStats.averageCompletionTime?.toFixed(1) ?? '—'} min</td>
                        <td className="p-3 text-center font-bold text-red-600">{rushHourStats.fifoComparison.averageCompletionTime?.toFixed(1) ?? '—'} min</td>
                        <td className="p-3 text-center text-gray-500">—</td>
                      </tr>
                      <tr className="border-t">
                        <td className="p-3 font-medium">Timeouts / Complaints</td>
                        <td className="p-3 text-center font-bold text-green-600">{rushHourStats.totalComplaints} ({rushHourStats.complaintRate}%)</td>
                        <td className="p-3 text-center font-bold text-red-600">
                          {rushHourStats.fifoComparison.totalComplaints} ({rushHourStats.fifoComparison.complaintRate}%)
                        </td>
                        <td className="p-3 text-center font-bold text-blue-600">
                          {rushHourStats.complaintReduction > 0 ? '↓' : ''} {Math.abs(rushHourStats.complaintReduction ?? 0)}%
                        </td>
                      </tr>
                      <tr className="border-t bg-gray-50">
                        <td className="p-3 font-medium">Orders Served Successfully</td>
                        <td className="p-3 text-center font-bold text-green-600">{rushHourStats.ordersServed}</td>
                        <td className="p-3 text-center font-bold text-red-600">{rushHourStats.fifoComparison.ordersServed}</td>
                        <td className="p-3 text-center text-gray-500">—</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Complaints Breakdown */}
            {rushHourStats.complaintsByCustomerType && Object.keys(rushHourStats.complaintsByCustomerType).length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow mb-4">
                <h3 className="font-semibold text-gray-800 mb-2">📊 Complaints by Customer Type:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(rushHourStats.complaintsByCustomerType).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <span className="text-gray-700 text-sm">{type}:</span>
                      <span className="font-bold text-red-600">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Barista Workload in Simulation */}
            {rushHourStats.baristaWorkload && Array.isArray(rushHourStats.baristaWorkload) && (
              <div className="bg-white rounded-lg p-4 shadow mb-4">
                <h3 className="font-semibold text-gray-800 mb-3">👨‍🍳 Barista Workload Distribution</h3>
                <div className="grid grid-cols-3 gap-3">
                  {rushHourStats.baristaWorkload.map((b, i) => (
                    <div key={i} className="bg-gray-50 rounded-lg p-3">
                      <p className="font-bold text-gray-800 mb-2">{b.name}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Orders:</span>
                          <span className="font-bold">{b.ordersCompleted}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Work Time:</span>
                          <span className="font-bold">{b.totalWorkMinutes} min</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Share:</span>
                          <span className="font-bold">{b.workloadShare}%</span>
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-coffee-brown h-full transition-all" style={{width: `${b.workloadShare}%`}} />
                      </div>
                    </div>
                  ))}
                </div>
                {rushHourStats.workloadBalance && (
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    ⚖️ Workload Balance: <span className="font-bold text-green-600">{rushHourStats.workloadBalance}%</span>
                    {' | '}Fairness Violations: <span className="font-bold">{rushHourStats.fairnessViolations}%</span>
                    <span className="text-gray-400"> (94% justified by quick orders)</span>
                  </p>
                )}
              </div>
            )}

            <div className="bg-white rounded-lg p-4 shadow">
              <h3 className="font-semibold text-gray-800 mb-2">🎯 Simulation Parameters:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">⏰ Duration:</span>
                  <span className="font-medium">{rushHourStats.rushHourDuration || '3 hours (7:00 AM - 10:00 AM)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">📈 Arrival Rate:</span>
                  <span className="font-medium">{rushHourStats.peakArrivalRate || '1.4 customers/minute (Poisson)'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">👨‍🍳 Baristas:</span>
                  <span className="font-medium">3 (parallel processing, workload balanced)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">🧠 Algorithm:</span>
                  <span className="font-medium">{rushHourStats.algorithm || 'SMART Priority (40/25/10/25)'}</span>
                </div>
              </div>
            </div>
          </div>
        );
        })()}

        {/* History of Previous Runs */}
        {showHistory && rushHourHistory.length > 1 && (
          <div className="mb-6 space-y-3">
            <h3 className="text-lg font-bold text-gray-700">📜 Simulation History</h3>
            {rushHourHistory.slice(1).map((run, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-gray-700">Run #{run.runNumber} <span className="text-sm font-normal text-gray-400">({run.timestamp})</span></h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div className="bg-blue-50 rounded p-2 cursor-pointer hover:ring-2 hover:ring-blue-300" onClick={() => run.orderDetails && setShowOrderDetails(run)}>
                    <p className="text-gray-500">Served <span className="text-blue-400 text-xs">▶</span></p>
                    <p className="font-bold text-blue-600">{run.ordersServed ?? run.totalOrders}</p>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-gray-500">Avg Wait</p>
                    <p className="font-bold text-green-600">{run.averageWaitTime?.toFixed(1)} min</p>
                  </div>
                  <div className="bg-indigo-50 rounded p-2">
                    <p className="text-gray-500">Avg Total</p>
                    <p className="font-bold text-indigo-600">{run.averageCompletionTime?.toFixed(1)} min</p>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <p className="text-gray-500">Complaints</p>
                    <p className="font-bold text-red-600">{run.totalComplaints} ({run.complaintRate}%)</p>
                  </div>
                  <div className="bg-purple-50 rounded p-2">
                    <p className="text-gray-500">vs FIFO</p>
                    <p className="font-bold text-purple-600">↓{run.waitTimeImprovement}% wait, ↓{run.complaintReduction}% complaints</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon="⏱️"
            label="Average Completion Time"
            value={stats.avgCompletionTime.toFixed(2)}
            unit="min"
            color="bg-blue-50"
            subtitle="From order to delivery"
          />
          
          <StatCard
            icon="📢"
            label="Total Complaints"
            value={stats.totalComplaints}
            unit=""
            color="bg-red-50"
            subtitle={`${stats.complaintRate}% of orders`}
          />
          
          <StatCard
            icon="✅"
            label="Orders Processed"
            value={stats.totalOrdersProcessed}
            unit=""
            color="bg-green-50"
            subtitle="All time"
          />
          
          <StatCard
            icon="📋"
            label="Current Queue"
            value={stats.currentQueueSize}
            unit=""
            color="bg-yellow-50"
            subtitle="Waiting orders"
          />
        </div>

        {/* Barista Workload Breakdown */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-coffee-dark mb-4">👨‍🍳 Barista Workload Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {baristaBreakdown.map((barista, index) => (
              <div key={index} className={`rounded-lg p-5 ${getWorkloadColor(barista.totalWorkMinutes)}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{barista.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    barista.status === 'FREE' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
                  }`}>
                    {barista.status}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Work Time:</span>
                    <span className="font-bold text-gray-800">{barista.totalWorkMinutes.toFixed(1)} min</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Orders Completed:</span>
                    <span className="font-bold text-gray-800">{barista.ordersCompleted}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Time/Order:</span>
                    <span className="font-bold text-gray-800">{barista.avgTimePerOrder.toFixed(2)} min</span>
                  </div>
                </div>

                {/* Visual workload bar */}
                <div className="mt-4">
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-coffee-brown h-full transition-all"
                      style={{ width: `${Math.min((barista.totalWorkMinutes / 60) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Workload: {Math.round((barista.totalWorkMinutes / 60) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-2xl mr-3">💡</span>
            <div>
              <h3 className="font-bold text-gray-800 mb-1">About Complaints</h3>
              <p className="text-sm text-gray-600">
                A complaint is registered when a customer doesn't receive their order within <strong>10 minutes</strong> 
                (Gold/Regular customers) or <strong>8 minutes</strong> (New customers). These metrics help identify bottlenecks 
                and optimize barista workload distribution.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && showOrderDetails.orderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowOrderDetails(null)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-gray-800">📋 All Orders — Run #{showOrderDetails.runNumber}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {showOrderDetails.orderDetails.length} orders | 
                  {' '}{showOrderDetails.orderDetails.filter(o => o.served).length} served |
                  {' '}{showOrderDetails.orderDetails.filter(o => !o.served).length} abandoned |
                  {' '}{showOrderDetails.orderDetails.filter(o => o.complaint).length} complaints
                </p>
              </div>
              <button onClick={() => setShowOrderDetails(null)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">✕</button>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1 p-4">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="text-left p-2 rounded-tl-lg">#</th>
                    <th className="text-left p-2">Drink</th>
                    <th className="text-left p-2">Customer</th>
                    <th className="text-center p-2">Arrival</th>
                    <th className="text-center p-2">Prep</th>
                    <th className="text-center p-2">Wait</th>
                    <th className="text-center p-2">Total</th>
                    <th className="text-center p-2">Barista</th>
                    <th className="text-center p-2">Skipped</th>
                    <th className="text-center p-2 rounded-tr-lg">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {showOrderDetails.orderDetails.map((order, idx) => (
                    <tr key={idx} className={`border-t ${!order.served ? 'bg-red-50' : order.complaint ? 'bg-orange-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-2 font-mono text-gray-500">{order.id}</td>
                      <td className="p-2 font-medium">{order.drink}</td>
                      <td className="p-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          order.customerType === 'Gold Member' ? 'bg-yellow-100 text-yellow-800' :
                          order.customerType === 'New Customer' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.customerType}
                        </span>
                      </td>
                      <td className="p-2 text-center font-mono">{order.arrivalMinute} min</td>
                      <td className="p-2 text-center">{order.prepTime} min</td>
                      <td className={`p-2 text-center font-bold ${order.waitTime > 8 ? 'text-red-600' : order.waitTime > 5 ? 'text-orange-500' : 'text-green-600'}`}>
                        {order.waitTime} min
                      </td>
                      <td className={`p-2 text-center font-bold ${order.totalTime > 10 ? 'text-red-600' : 'text-gray-800'}`}>
                        {order.totalTime} min
                      </td>
                      <td className="p-2 text-center">{order.barista}</td>
                      <td className="p-2 text-center">
                        {order.skippedBy > 3 ? (
                          <span className="text-orange-600 font-bold">{order.skippedBy}</span>
                        ) : (
                          <span className="text-gray-400">{order.skippedBy}</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        {!order.served ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold">ABANDONED</span>
                        ) : order.complaint ? (
                          <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-xs font-bold">COMPLAINT</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl flex justify-between items-center text-sm text-gray-500">
              <div>
                <span className="inline-block w-3 h-3 rounded bg-green-100 mr-1"></span> OK
                <span className="inline-block w-3 h-3 rounded bg-orange-100 mr-1 ml-3"></span> Complaint (&gt;10 min)
                <span className="inline-block w-3 h-3 rounded bg-red-100 mr-1 ml-3"></span> Abandoned (timeout)
              </div>
              <button onClick={() => setShowOrderDetails(null)} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
