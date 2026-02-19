import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import {
  getUser,
  listMonetaryAccounts,
  getMonetaryAccount,
  createMonetaryAccount,
  listPayments,
  getPayment,
  createPayment,
  listCards,
  getCard,
  createCard,
  listRequestInquiries,
  createRequestInquiry,
  getRequestInquiry
} from './api.js';

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

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }

  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 50);
  });

  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));

  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });

  console.log(chalk.dim(`\n${data.length} result(s)`));
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
    printError('bunq credentials not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  bunqcom config set --api-key <key>'));
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('bunqcom')
  .description(chalk.bold('bunq CLI') + ' - Mobile banking from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set configuration values')
  .option('--api-key <key>', 'bunq API key')
  .option('--user-id <id>', 'bunq User ID')
  .option('--environment <env>', 'Environment (sandbox|production)', 'sandbox')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess(`API Key set`);
    }
    if (options.userId) {
      setConfig('userId', options.userId);
      printSuccess(`User ID set`);
    }
    if (options.environment) {
      setConfig('environment', options.environment);
      printSuccess(`Environment set to ${options.environment}`);
    }
    if (!options.apiKey && !options.userId && !options.environment) {
      printError('No options provided. Use --api-key, --user-id, or --environment');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');
    const userId = getConfig('userId');
    const environment = getConfig('environment');

    console.log(chalk.bold('\nbunq CLI Configuration\n'));
    console.log('API Key:       ', apiKey ? chalk.green('*'.repeat(8)) : chalk.red('not set'));
    console.log('User ID:       ', userId ? chalk.green(userId) : chalk.yellow('not set'));
    console.log('Environment:   ', chalk.green(environment || 'sandbox'));
    console.log('');
  });

// ============================================================
// USER
// ============================================================

const userCmd = program.command('user').description('Manage user information');

userCmd
  .command('get')
  .description('Get user information')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const data = await withSpinner('Fetching user info...', () => getUser());

      if (options.json) {
        printJson(data);
        return;
      }

      const response = data?.Response?.[0];
      if (!response) {
        printError('No user data found');
        return;
      }

      const userType = Object.keys(response)[0];
      const user = response[userType];

      console.log(chalk.bold('\nUser Information\n'));
      console.log('ID:            ', chalk.cyan(user.id));
      console.log('Type:          ', userType);
      console.log('Display Name:  ', user.display_name || 'N/A');
      console.log('Public Nick:   ', user.public_nick_name || 'N/A');
      console.log('Created:       ', user.created ? new Date(user.created).toLocaleString() : 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// ACCOUNTS
// ============================================================

const accountsCmd = program.command('accounts').description('Manage monetary accounts');

accountsCmd
  .command('list')
  .description('List all monetary accounts')
  .option('--user-id <id>', 'User ID (or use config)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    const userId = options.userId || getConfig('userId');

    if (!userId) {
      printError('User ID not configured. Use --user-id or run: bunqcom config set --user-id <id>');
      process.exit(1);
    }

    try {
      const data = await withSpinner('Fetching accounts...', () => listMonetaryAccounts(userId));

      if (options.json) {
        printJson(data);
        return;
      }

      const accounts = data?.Response || [];
      const accountsList = accounts.map(r => {
        const accountType = Object.keys(r)[0];
        return r[accountType];
      });

      printTable(accountsList, [
        { key: 'id', label: 'ID' },
        { key: 'description', label: 'Description' },
        { key: 'currency', label: 'Currency' },
        { key: 'balance', label: 'Balance', format: (v) => v?.value || '0.00' },
        { key: 'status', label: 'Status' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

accountsCmd
  .command('get <account-id>')
  .description('Get a specific monetary account')
  .option('--user-id <id>', 'User ID (or use config)')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    requireAuth();
    const userId = options.userId || getConfig('userId');

    if (!userId) {
      printError('User ID not configured. Use --user-id or run: bunqcom config set --user-id <id>');
      process.exit(1);
    }

    try {
      const data = await withSpinner('Fetching account...', () => getMonetaryAccount(userId, accountId));

      if (options.json) {
        printJson(data);
        return;
      }

      const response = data?.Response?.[0];
      if (!response) {
        printError('Account not found');
        return;
      }

      const accountType = Object.keys(response)[0];
      const account = response[accountType];

      console.log(chalk.bold('\nAccount Details\n'));
      console.log('ID:            ', chalk.cyan(account.id));
      console.log('Description:   ', account.description);
      console.log('Currency:      ', account.currency);
      console.log('Balance:       ', chalk.bold(account.balance?.value || '0.00'), account.currency);
      console.log('Status:        ', account.status);
      console.log('Created:       ', new Date(account.created).toLocaleString());
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// PAYMENTS
// ============================================================

const paymentsCmd = program.command('payments').description('Manage payments');

paymentsCmd
  .command('list <account-id>')
  .description('List payments for an account')
  .option('--user-id <id>', 'User ID (or use config)')
  .option('--count <n>', 'Number of payments to retrieve', '50')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    requireAuth();
    const userId = options.userId || getConfig('userId');

    if (!userId) {
      printError('User ID not configured. Use --user-id or run: bunqcom config set --user-id <id>');
      process.exit(1);
    }

    try {
      const data = await withSpinner('Fetching payments...', () =>
        listPayments(userId, accountId, { count: options.count })
      );

      if (options.json) {
        printJson(data);
        return;
      }

      const payments = data?.Response || [];
      const paymentsList = payments.map(r => r.Payment);

      printTable(paymentsList, [
        { key: 'id', label: 'ID' },
        { key: 'type', label: 'Type' },
        { key: 'amount', label: 'Amount', format: (v) => `${v?.value} ${v?.currency}` },
        { key: 'description', label: 'Description', format: (v) => v?.substring(0, 30) || 'N/A' },
        { key: 'created', label: 'Date', format: (v) => new Date(v).toLocaleDateString() }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

paymentsCmd
  .command('get <account-id> <payment-id>')
  .description('Get a specific payment')
  .option('--user-id <id>', 'User ID (or use config)')
  .option('--json', 'Output as JSON')
  .action(async (accountId, paymentId, options) => {
    requireAuth();
    const userId = options.userId || getConfig('userId');

    if (!userId) {
      printError('User ID not configured. Use --user-id or run: bunqcom config set --user-id <id>');
      process.exit(1);
    }

    try {
      const data = await withSpinner('Fetching payment...', () => getPayment(userId, accountId, paymentId));

      if (options.json) {
        printJson(data);
        return;
      }

      const payment = data?.Response?.[0]?.Payment;
      if (!payment) {
        printError('Payment not found');
        return;
      }

      console.log(chalk.bold('\nPayment Details\n'));
      console.log('ID:            ', chalk.cyan(payment.id));
      console.log('Type:          ', payment.type);
      console.log('Amount:        ', chalk.bold(payment.amount?.value), payment.amount?.currency);
      console.log('Description:   ', payment.description);
      console.log('Created:       ', new Date(payment.created).toLocaleString());
      console.log('Counterparty:  ', payment.counterparty_alias?.display_name || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

paymentsCmd
  .command('create <account-id>')
  .description('Create a new payment')
  .option('--user-id <id>', 'User ID (or use config)')
  .requiredOption('--amount <amount>', 'Payment amount')
  .requiredOption('--currency <currency>', 'Currency code (e.g., EUR)')
  .requiredOption('--counterparty <iban>', 'Counterparty IBAN')
  .requiredOption('--description <desc>', 'Payment description')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    requireAuth();
    const userId = options.userId || getConfig('userId');

    if (!userId) {
      printError('User ID not configured. Use --user-id or run: bunqcom config set --user-id <id>');
      process.exit(1);
    }

    const paymentData = {
      amount: {
        value: options.amount,
        currency: options.currency
      },
      counterparty_alias: {
        type: 'IBAN',
        value: options.counterparty
      },
      description: options.description
    };

    try {
      const data = await withSpinner('Creating payment...', () =>
        createPayment(userId, accountId, paymentData)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      const paymentId = data?.Response?.[0]?.Id?.id;
      printSuccess(`Payment created: ${chalk.bold(paymentId)}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// CARDS
// ============================================================

const cardsCmd = program.command('cards').description('Manage cards');

cardsCmd
  .command('list')
  .description('List all cards')
  .option('--user-id <id>', 'User ID (or use config)')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    const userId = options.userId || getConfig('userId');

    if (!userId) {
      printError('User ID not configured. Use --user-id or run: bunqcom config set --user-id <id>');
      process.exit(1);
    }

    try {
      const data = await withSpinner('Fetching cards...', () => listCards(userId));

      if (options.json) {
        printJson(data);
        return;
      }

      const cards = data?.Response || [];
      const cardsList = cards.map(r => {
        const cardType = Object.keys(r)[0];
        return r[cardType];
      });

      printTable(cardsList, [
        { key: 'id', label: 'ID' },
        { key: 'type', label: 'Type' },
        { key: 'name_on_card', label: 'Name on Card' },
        { key: 'status', label: 'Status' },
        { key: 'created', label: 'Created', format: (v) => new Date(v).toLocaleDateString() }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

cardsCmd
  .command('get <card-id>')
  .description('Get a specific card')
  .option('--user-id <id>', 'User ID (or use config)')
  .option('--json', 'Output as JSON')
  .action(async (cardId, options) => {
    requireAuth();
    const userId = options.userId || getConfig('userId');

    if (!userId) {
      printError('User ID not configured. Use --user-id or run: bunqcom config set --user-id <id>');
      process.exit(1);
    }

    try {
      const data = await withSpinner('Fetching card...', () => getCard(userId, cardId));

      if (options.json) {
        printJson(data);
        return;
      }

      const response = data?.Response?.[0];
      if (!response) {
        printError('Card not found');
        return;
      }

      const cardType = Object.keys(response)[0];
      const card = response[cardType];

      console.log(chalk.bold('\nCard Details\n'));
      console.log('ID:            ', chalk.cyan(card.id));
      console.log('Type:          ', card.type);
      console.log('Name on Card:  ', card.name_on_card);
      console.log('Status:        ', card.status);
      console.log('Created:       ', new Date(card.created).toLocaleString());
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// REQUEST INQUIRIES
// ============================================================

const requestsCmd = program.command('requests').description('Manage payment requests');

requestsCmd
  .command('list <account-id>')
  .description('List payment requests for an account')
  .option('--user-id <id>', 'User ID (or use config)')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    requireAuth();
    const userId = options.userId || getConfig('userId');

    if (!userId) {
      printError('User ID not configured. Use --user-id or run: bunqcom config set --user-id <id>');
      process.exit(1);
    }

    try {
      const data = await withSpinner('Fetching payment requests...', () =>
        listRequestInquiries(userId, accountId)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      const requests = data?.Response || [];
      const requestsList = requests.map(r => r.RequestInquiry);

      printTable(requestsList, [
        { key: 'id', label: 'ID' },
        { key: 'status', label: 'Status' },
        { key: 'amount_inquired', label: 'Amount', format: (v) => `${v?.value} ${v?.currency}` },
        { key: 'description', label: 'Description', format: (v) => v?.substring(0, 30) || 'N/A' },
        { key: 'created', label: 'Created', format: (v) => new Date(v).toLocaleDateString() }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

requestsCmd
  .command('create <account-id>')
  .description('Create a payment request')
  .option('--user-id <id>', 'User ID (or use config)')
  .requiredOption('--amount <amount>', 'Request amount')
  .requiredOption('--currency <currency>', 'Currency code (e.g., EUR)')
  .requiredOption('--counterparty <email>', 'Counterparty email')
  .requiredOption('--description <desc>', 'Request description')
  .option('--json', 'Output as JSON')
  .action(async (accountId, options) => {
    requireAuth();
    const userId = options.userId || getConfig('userId');

    if (!userId) {
      printError('User ID not configured. Use --user-id or run: bunqcom config set --user-id <id>');
      process.exit(1);
    }

    const requestData = {
      amount_inquired: {
        value: options.amount,
        currency: options.currency
      },
      counterparty_alias: {
        type: 'EMAIL',
        value: options.counterparty
      },
      description: options.description,
      allow_bunqme: true
    };

    try {
      const data = await withSpinner('Creating payment request...', () =>
        createRequestInquiry(userId, accountId, requestData)
      );

      if (options.json) {
        printJson(data);
        return;
      }

      const requestId = data?.Response?.[0]?.Id?.id;
      printSuccess(`Payment request created: ${chalk.bold(requestId)}`);
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
