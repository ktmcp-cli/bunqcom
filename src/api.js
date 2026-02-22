import axios from 'axios';
import { getConfig } from './config.js';

function getBaseURL() {
  const configuredUrl = getConfig('baseUrl');
  return configuredUrl || 'https://public-api.sandbox.bunq.com/{basePath}';
}

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const apiKey = getConfig('apiKey');
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

async function request(endpoint, method = 'GET', data = null) {
  const baseURL = getBaseURL();
  try {
    const config = {
      method,
      url: `${baseURL}${endpoint}`,
      headers: getHeaders()
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(`API Error: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}

// ============================================================
// API Methods
// ============================================================

/**
 * /attachment-public
 */
export async function cREATE_AttachmentPublic(params = {}) {
  const endpoint = '/attachment-public';
  return await request(endpoint, 'POST', params);
}

/**
 * /attachment-public/{attachment-publicUUID}/content
 */
export async function list_all_Content_for_AttachmentPublic(params = {}) {
  const endpoint = '/attachment-public/{attachment-publicUUID}/content';
  return await request(endpoint, 'GET', params);
}

/**
 * /attachment-public/{itemId}
 */
export async function rEAD_AttachmentPublic(params = {}) {
  const endpoint = '/attachment-public/{itemId}';
  return await request(endpoint, 'GET', params);
}

/**
 * /avatar
 */
export async function cREATE_Avatar(params = {}) {
  const endpoint = '/avatar';
  return await request(endpoint, 'POST', params);
}

/**
 * /avatar/{itemId}
 */
export async function rEAD_Avatar(params = {}) {
  const endpoint = '/avatar/{itemId}';
  return await request(endpoint, 'GET', params);
}

/**
 * /device
 */
export async function list_all_Device(params = {}) {
  const endpoint = '/device';
  return await request(endpoint, 'GET', params);
}

/**
 * /device-server
 */
export async function list_all_DeviceServer(params = {}) {
  const endpoint = '/device-server';
  return await request(endpoint, 'GET', params);
}

/**
 * /device-server
 */
export async function cREATE_DeviceServer(params = {}) {
  const endpoint = '/device-server';
  return await request(endpoint, 'POST', params);
}

/**
 * /device-server/{itemId}
 */
export async function rEAD_DeviceServer(params = {}) {
  const endpoint = '/device-server/{itemId}';
  return await request(endpoint, 'GET', params);
}

/**
 * /device/{itemId}
 */
export async function rEAD_Device(params = {}) {
  const endpoint = '/device/{itemId}';
  return await request(endpoint, 'GET', params);
}

