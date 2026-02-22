import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import { cREATE_AttachmentPublic, list_all_Content_for_AttachmentPublic, rEAD_AttachmentPublic, cREATE_Avatar, rEAD_Avatar, list_all_Device, list_all_DeviceServer, cREATE_DeviceServer, rEAD_DeviceServer, rEAD_Device } from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('API not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  bunqcom config set --api-key YOUR_API_KEY'));
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('bunqcom')
  .description(chalk.bold('bunq API CLI') + ' - Production-ready CLI')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'API key')
  .option('--base-url <url>', 'Base URL')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess('API key set');
    }
    if (options.baseUrl) {
      setConfig('baseUrl', options.baseUrl);
      printSuccess('Base URL set');
    }
    if (!options.apiKey && !options.baseUrl) {
      printError('No options provided. Use --api-key or --base-url');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');
    const baseUrl = getConfig('baseUrl');
    console.log(chalk.bold('\nbunq API CLI Configuration\n'));
    console.log('API Key:  ', apiKey ? chalk.green(apiKey.substring(0, 6) + '...' + apiKey.slice(-4)) : chalk.red('not set'));
    console.log('Base URL: ', baseUrl ? chalk.green(baseUrl) : chalk.dim('default'));
    console.log('');
  });

// ============================================================
// API Commands (placeholder - customize based on API)
// ============================================================

program
  .command('call')
  .description('Make an API call')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();

    try {
      const data = await withSpinner('Making API call...', () => cREATE_AttachmentPublic());

      if (options.json) {
        printJson(data);
        return;
      }

      console.log(chalk.bold('\nAPI Response\n'));
      console.log(data);
      console.log('');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
