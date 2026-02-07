import React, { useState } from 'react';
import * as api from '../services/api';

function SimulationControls({ onUpdate }) {
  const [poissonEnabled, setPoissonEnabled] = useState(false);

  const handleAddOrder = async () => {
    try {
      const response = await api.addRandomOrder();
      console.log('✅', response.message);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to add order:', error);
      alert('Error adding order');
    }
  };

  const handleSimulateMinute = async () => {
    try {
      const response = await api.simulateMinute();
      console.log('✅', response.message);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to simulate:', error);
      alert('Error simulating minute');
    }
  };

  const handleRushHour = async () => {
    try {
      const response = await api.triggerRushHour();
      console.log('✅', response.message);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to trigger rush:', error);
      alert('Error triggering rush hour');
    }
  };

  const handleReset = async () => {
    try {
      const response = await api.resetSystem();
      console.log('✅', response.message);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to reset:', error);
      alert('Error resetting system');
    }
  };

  const handleTogglePoisson = async () => {
    try {
      const newState = !poissonEnabled;
      const response = await api.togglePoissonArrivals(newState);
      setPoissonEnabled(newState);
      console.log('✅', response.message);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Failed to toggle Poisson:', error);
      alert('Error toggling Poisson arrivals');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold text-coffee-dark mb-4">🎮 Simulation Controls</h2>
      
      <div className="space-y-3">
        <button
          onClick={handleAddOrder}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          ➕ Add Random Order
        </button>
        
        <button
          onClick={handleSimulateMinute}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          ⏱️ Simulate 1 Minute
        </button>

        <button
          onClick={handleTogglePoisson}
          className={`w-full ${poissonEnabled ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-500 hover:bg-gray-600'} text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2`}
        >
          {poissonEnabled ? '🔥 Poisson ON (λ=1.4)' : '📊 Enable Poisson Arrivals'}
        </button>
        
        <button
          onClick={handleRushHour}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          🚨 Trigger Rush Hour
        </button>
        
        <button
          onClick={handleReset}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          🔄 Reset System
        </button>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>Tip:</strong> Enable Poisson arrivals for realistic customer flow simulation
        </p>
      </div>
    </div>
  );
}

export default SimulationControls;
