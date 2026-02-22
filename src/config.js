import Conf from 'conf';

const config = new Conf({
  projectName: 'ktmcp-bunqcom',
  schema: {
    apiKey: {
      type: 'string',
      default: ''
    },
    baseUrl: {
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
  return !!config.get('apiKey') || !!config.get('baseUrl');
}

export default config;
