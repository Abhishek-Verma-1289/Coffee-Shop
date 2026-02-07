import React from 'react';

function OrderQueue({ orders, mode }) {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'bg-red-100 border-red-500';
      case 'elevated': return 'bg-yellow-100 border-yellow-500';
      default: return 'bg-green-50 border-green-500';
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'urgent': return '🔴 URGENT';
      case 'elevated': return '🟡 ELEVATED';
      default: return '🟢 NORMAL';
    }
  };

  const getCustomerBadge = (customerType) => {
    switch (customerType) {
      case 'Gold': return '⭐ Gold';
      case 'Regular': return '👤 Regular';
      case 'New': return '🆕 New';
      default: return customerType;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-coffee-dark">📋 Order Queue</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
          {orders.length} orders
        </span>
      </div>

      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No orders in queue</p>
            <p className="text-sm">Add orders using simulation controls</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className={`border-l-4 rounded-lg p-4 transition-all ${getUrgencyColor(order.urgency)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-gray-800">#{order.id}</span>
                    <span className="text-xl">☕</span>
                    <span className="font-semibold text-gray-700">{order.drinkType}</span>
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                      {getCustomerBadge(order.customerType)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>⏱️ Wait: {order.waitTime.toFixed(1)} min</span>
                    <span>Est: {order.estimatedWaitMinutes.toFixed(1)} min</span>
                    <span>Priority: <strong>{order.priority}</strong></span>
                  </div>
                  
                  {order.peopleServedAhead > 0 && (
                    <div className="mt-1 text-xs text-orange-600 font-medium">
                      ⚠️ {order.peopleServedAhead} people served ahead
                    </div>
                  )}
                  
                  {mode === 'SMART' && (
                    <div className="mt-2 text-xs text-gray-500 italic">
                      💡 {order.reason}
                    </div>
                  )}
                </div>

                <div className="text-xs font-bold">
                  {getUrgencyBadge(order.urgency)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default OrderQueue;
