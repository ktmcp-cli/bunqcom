import axios from 'axios';
import { getConfig } from './config.js';

const BUNQ_SANDBOX_URL = 'https://public-api.sandbox.bunq.com/v1';
const BUNQ_PRODUCTION_URL = 'https://api.bunq.com/v1';

function getBaseUrl() {
  const env = getConfig('environment') || 'sandbox';
  return env === 'production' ? BUNQ_PRODUCTION_URL : BUNQ_SANDBOX_URL;
}

/**
 * Make an authenticated API request
 */
async function apiRequest(method, endpoint, data = null, params = null) {
  const apiKey = getConfig('apiKey');
  const sessionToken = getConfig('sessionToken');

  if (!apiKey) {
    throw new Error('API key not configured. Run: bunqcom config set --api-key <key>');
  }

  const config = {
    method,
    url: `${getBaseUrl()}${endpoint}`,
    headers: {
      'X-Bunq-Client-Authentication': sessionToken || apiKey,
      'Cache-Control': 'no-cache',
      'User-Agent': 'bunqcom-cli/1.0.0',
      'X-Bunq-Geolocation': '0 0 0 0 000',
      'X-Bunq-Language': 'en_US',
      'X-Bunq-Region': 'en_US',
      'Content-Type': 'application/json'
    }
  };

  if (params) config.params = params;
  if (data) config.data = data;

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      throw new Error('Authentication failed. Check your API key or session token.');
    } else if (status === 403) {
      throw new Error('Access forbidden. Check your permissions.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait before retrying.');
    } else {
      const message = data?.Error?.[0]?.error_description || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error('No response from bunq API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// USER
// ============================================================

export async function getUser() {
  return await apiRequest('GET', '/user');
}

// ============================================================
// MONETARY ACCOUNTS
// ============================================================

export async function listMonetaryAccounts(userId) {
  return await apiRequest('GET', `/user/${userId}/monetary-account`);
}

export async function getMonetaryAccount(userId, accountId) {
  return await apiRequest('GET', `/user/${userId}/monetary-account/${accountId}`);
}

export async function createMonetaryAccount(userId, data) {
  return await apiRequest('POST', `/user/${userId}/monetary-account`, data);
}

// ============================================================
// PAYMENTS
// ============================================================

export async function listPayments(userId, accountId, params = {}) {
  return await apiRequest('GET', `/user/${userId}/monetary-account/${accountId}/payment`, null, params);
}

export async function getPayment(userId, accountId, paymentId) {
  return await apiRequest('GET', `/user/${userId}/monetary-account/${accountId}/payment/${paymentId}`);
}

export async function createPayment(userId, accountId, data) {
  return await apiRequest('POST', `/user/${userId}/monetary-account/${accountId}/payment`, data);
}

// ============================================================
// CARDS
// ============================================================

export async function listCards(userId) {
  return await apiRequest('GET', `/user/${userId}/card`);
}

export async function getCard(userId, cardId) {
  return await apiRequest('GET', `/user/${userId}/card/${cardId}`);
}

export async function createCard(userId, data) {
  return await apiRequest('POST', `/user/${userId}/card`, data);
}

// ============================================================
// REQUEST INQUIRIES
// ============================================================

export async function listRequestInquiries(userId, accountId) {
  return await apiRequest('GET', `/user/${userId}/monetary-account/${accountId}/request-inquiry`);
}

export async function createRequestInquiry(userId, accountId, data) {
  return await apiRequest('POST', `/user/${userId}/monetary-account/${accountId}/request-inquiry`, data);
}

export async function getRequestInquiry(userId, requestId) {
  return await apiRequest('GET', `/user/${userId}/request-inquiry/${requestId}`);
}
