import React from 'react';

function BaristaBoard({ baristas }) {
  const getStatusColor = (status) => {
    return status === 'FREE' ? 'bg-green-500' : 'bg-orange-500';
  };

  const getStatusIcon = (status) => {
    return status === 'FREE' ? '✅' : '⏳';
  };

  const getWorkloadColor = (workloadRatio) => {
    if (workloadRatio > 1.2) return 'text-red-600 font-bold'; // Overloaded
    if (workloadRatio < 0.8) return 'text-blue-600'; // Underutilized
    return 'text-green-600'; // Balanced
  };

  const getWorkloadLabel = (workloadRatio) => {
    if (workloadRatio > 1.2) return '🔥 Overloaded';
    if (workloadRatio < 0.8) return '❄️ Light';
    return '✅ Balanced';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-coffee-dark mb-4">👨‍🍳 Barista Dashboard</h2>
      
      <div className="space-y-3">
        {baristas.map((barista) => (
          <div
            key={barista.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getStatusIcon(barista.status)}</span>
                <span className="font-semibold text-gray-800">{barista.name}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor(barista.status)}`}>
                {barista.status}
              </span>
            </div>

            {/* Workload metrics */}
            <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
              <div className="text-gray-600">
                📊 Workload: <span className={getWorkloadColor(barista.workloadRatio)}>
                  {barista.workloadRatio.toFixed(2)}x
                </span>
              </div>
              <div className="text-gray-600">
                ⏱️ Total: {barista.totalWorkMinutes.toFixed(1)}m
              </div>
              <div className="text-gray-600">
                ✅ Completed: {barista.ordersCompleted}
              </div>
            </div>

            <div className="text-xs mb-2">
              {getWorkloadLabel(barista.workloadRatio)}
            </div>

            {barista.status === 'BUSY' ? (
              <div className="mt-2">
                <div className="text-sm text-gray-600">
                  ☕ Making: <span className="font-medium">{barista.currentOrder}</span>
                  {barista.customerType && (
                    <span className="ml-2 text-xs text-gray-500">({barista.customerType})</span>
                  )}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  ⏱️ {barista.timeRemaining.toFixed(1)} min remaining
                </div>
                
                {/* Progress bar */}
                <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-coffee-brown h-full transition-all"
                    style={{ width: `${(barista.timeRemaining / 5) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-sm text-green-600 font-medium">
                Ready for next order
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BaristaBoard;
