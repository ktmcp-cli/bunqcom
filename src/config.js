import Conf from 'conf';

const config = new Conf({
  projectName: 'bunqcom-cli',
  schema: {
    apiKey: {
      type: 'string',
      default: ''
    },
    environment: {
      type: 'string',
      default: 'sandbox'
    },
    installationToken: {
      type: 'string',
      default: ''
    },
    sessionToken: {
      type: 'string',
      default: ''
    },
    userId: {
      type: 'string',
      default: ''
    }
  }
});

export function getConfig(key) {
  return config.get(key);
}

export function setConfig(key, value) {
  config.set(key, value);
}

export function getAllConfig() {
  return config.store;
}

export function clearConfig() {
  config.clear();
}

export function isConfigured() {
  const apiKey = config.get('apiKey');
  return !!apiKey;
}

export function hasValidSession() {
  const sessionToken = config.get('sessionToken');
  return !!sessionToken;
}

export default config;
