/**
 * API Service - Centralized API calls to backend
 * Base URL uses Vite proxy (/api -> http://localhost:8080)
 */

const API_BASE = '/api';

// Order APIs
export const getOrderQueue = async () => {
  const response = await fetch(`${API_BASE}/orders/queue`);
  return response.json();
};

export const addRandomOrder = async () => {
  const response = await fetch(`${API_BASE}/orders/random`, {
    method: 'POST',
  });
  return response.json();
};

export const createOrder = async (drinkType) => {
  const response = await fetch(`${API_BASE}/orders/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ drinkType }),
  });
  return response.json();
};

// Barista APIs
export const getBaristaStatus = async () => {
  const response = await fetch(`${API_BASE}/baristas/status`);
  return response.json();
};

export const getBaristaStats = async () => {
  const response = await fetch(`${API_BASE}/baristas/stats`);
  return response.json();
};

// Simulation APIs
export const simulateMinute = async () => {
  const response = await fetch(`${API_BASE}/simulate/minute`, {
    method: 'POST',
  });
  return response.json();
};

export const triggerRushHour = async () => {
  const response = await fetch(`${API_BASE}/simulate/rush`, {
    method: 'POST',
  });
  return response.json();
};

export const resetSystem = async () => {
  const response = await fetch(`${API_BASE}/simulate/reset`, {
    method: 'POST',
  });
  return response.json();
};

export const switchQueueMode = async (mode) => {
  const response = await fetch(`${API_BASE}/simulate/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode }),
  });
  return response.json();
};

export const getMetrics = async () => {
  const response = await fetch(`${API_BASE}/simulate/metrics`);
  return response.json();
};

export const toggleAutoSimulation = async (enabled) => {
  const response = await fetch(`${API_BASE}/simulate/auto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  return response.json();
};

export const togglePoissonArrivals = async (enabled) => {
  const response = await fetch(`${API_BASE}/simulate/poisson`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }),
  });
  return response.json();
};

// Analytics APIs
export const getAnalyticsStats = async () => {
  const response = await fetch(`${API_BASE}/analytics/stats`);
  return response.json();
};

export const getBaristaBreakdown = async () => {
  const response = await fetch(`${API_BASE}/analytics/barista-breakdown`);
  return response.json();
};

export const generateTest100Orders = async () => {
  const response = await fetch(`${API_BASE}/analytics/test100`, {
    method: 'POST',
  });
  return response.json();
};

export const getLast100Stats = async () => {
  const response = await fetch(`${API_BASE}/analytics/last100`);
  return response.json();
};

export const simulateRushHour100 = async () => {
  const response = await fetch(`${API_BASE}/analytics/rush-hour-100`, {
    method: 'POST',
  });
  return response.json();
};
