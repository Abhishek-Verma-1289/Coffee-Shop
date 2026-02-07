import React from 'react';
import * as api from '../services/api';

function MenuOrder({ onUpdate }) {
  const menu = [
    { name: 'Cold Brew', prepTime: '1 min', frequency: '25%', price: '₹120', type: 'COLD_BREW' },
    { name: 'Espresso', prepTime: '2 min', frequency: '20%', price: '₹150', type: 'ESPRESSO' },
    { name: 'Americano', prepTime: '2 min', frequency: '15%', price: '₹140', type: 'AMERICANO' },
    { name: 'Cappuccino', prepTime: '4 min', frequency: '20%', price: '₹180', type: 'CAPPUCCINO' },
    { name: 'Latte', prepTime: '4 min', frequency: '12%', price: '₹200', type: 'LATTE' },
    { name: 'Specialty (Mocha)', prepTime: '6 min', frequency: '8%', price: '₹250', type: 'MOCHA' },
  ];

  const handleOrderDrink = async (drinkType) => {
    try {
      const response = await api.createOrder(drinkType);
      console.log('✅ Ordered:', response);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to order:', error);
      alert('Error placing order');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-coffee-dark mb-4">📋 Menu & Place Order</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-50">
              <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Drink Type</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Prep Time</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Frequency</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Price</th>
              <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Order</th>
            </tr>
          </thead>
          <tbody>
            {menu.map((item, index) => (
              <tr 
                key={index} 
                className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
              >
                <td className="px-4 py-3 font-medium text-gray-800">☕ {item.name}</td>
                <td className="px-4 py-3 text-center text-gray-600">{item.prepTime}</td>
                <td className="px-4 py-3 text-center text-gray-600">{item.frequency}</td>
                <td className="px-4 py-3 text-center font-semibold text-green-600">{item.price}</td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleOrderDrink(item.type)}
                    className="bg-coffee-brown hover:bg-coffee-dark text-white font-semibold py-1.5 px-4 rounded-lg transition-colors text-sm"
                  >
                    Order
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Click "Order" to place a specific drink. Watch it appear in the queue and get auto-assigned to a free barista!
        </p>
      </div>
    </div>
  );
}

export default MenuOrder;
