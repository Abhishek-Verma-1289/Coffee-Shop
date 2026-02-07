import React from 'react';

function MetricsPanel({ metrics }) {
  // Default values if metrics not loaded yet
  const displayMetrics = {
    avgWaitTime: metrics.avgWaitTime || 0,
    maxWaitTime: metrics.maxWaitTime || 0,
    timeoutRate: metrics.timeoutRate || 0,
    queueLength: metrics.queueLength || 0,
    completedOrders: metrics.completedOrders || 0,
    activeOrders: metrics.activeOrders || 0,
    fairnessViolations: metrics.fairnessViolations || 0
  };

  // Calculate fairness violation rate
  const totalProcessed = displayMetrics.completedOrders + displayMetrics.activeOrders;
  const fairnessRate = totalProcessed > 0 
    ? ((displayMetrics.fairnessViolations / totalProcessed) * 100).toFixed(1)
    : 0;

  const MetricCard = ({ icon, label, value, unit, color }) => (
    <div className={`${color} rounded-lg p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-800">
            {value}
            <span className="text-lg text-gray-600 ml-1">{unit}</span>
          </p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-coffee-dark mb-4">📊 Performance Metrics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <MetricCard
          icon="⏱️"
          label="Avg Wait Time"
          value={displayMetrics.avgWaitTime.toFixed(1)}
          unit="min"
          color="bg-blue-50"
        />
        
        <MetricCard
          icon="⏰"
          label="Max Wait Time"
          value={displayMetrics.maxWaitTime.toFixed(1)}
          unit="min"
          color="bg-purple-50"
        />
        
        <MetricCard
          icon="⚠️"
          label="Timeout Rate"
          value={displayMetrics.timeoutRate.toFixed(1)}
          unit="%"
          color="bg-red-50"
        />
        
        <MetricCard
          icon="⚖️"
          label="Fairness Rate"
          value={fairnessRate}
          unit="%"
          color="bg-pink-50"
        />
        
        <MetricCard
          icon="📋"
          label="Queue Length"
          value={displayMetrics.queueLength}
          unit=""
          color="bg-yellow-50"
        />
        
        <MetricCard
          icon="✅"
          label="Completed"
          value={displayMetrics.completedOrders}
          unit=""
          color="bg-green-50"
        />
        
        <MetricCard
          icon="🔄"
          label="In Progress"
          value={displayMetrics.activeOrders}
          unit=""
          color="bg-orange-50"
        />
      </div>
    </div>
  );
}

export default MetricsPanel;
