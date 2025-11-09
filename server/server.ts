import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://telepod.up.railway.app';
const SERIAL_PORT = process.env.SERIAL_PORT || '/dev/tty.usbserial-0001';
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '9600');

console.log('TelePod Serial Server Starting...');
console.log(`API Base URL: ${API_BASE_URL}`);
console.log(`Serial Port: ${SERIAL_PORT}`);
console.log(`Baud Rate: ${BAUD_RATE}`);

// Command structure:
// MATCH:<village_name>:<query>
// SEARCH_LOC:<location>
// SEARCH_SKILL:<keyword>
// CREATE:<name>:<location>:<coordinates>:<fact1>|<fact2>|<fact3>
// STATUS

interface CommandResult {
  success: boolean;
  data?: any;
  error?: string;
}

async function processCommand(command: string): Promise<CommandResult> {
  const trimmed = command.trim();
  console.log(`\n[RX] Received: ${trimmed}`);

  try {
    const parts = trimmed.split(':');
    const cmd = parts[0].toUpperCase();

    switch (cmd) {
      case 'MATCH': {
        const villageName = parts[1];
        const query = parts.slice(2).join(':');
        
        console.log(`[MATCH] Village: ${villageName}, Query: ${query}`);
        
        const response = await axios.post(`${API_BASE_URL}/api/match`, {
          userName: villageName,
          query: query,
          useAI: true
        });
        
        return { success: true, data: response.data };
      }

      case 'SEARCH_LOC': {
        const location = parts.slice(1).join(':');
        
        console.log(`[SEARCH_LOC] Location: ${location}`);
        
        const response = await axios.get(
          `${API_BASE_URL}/api/search/location/${encodeURIComponent(location)}`
        );
        
        return { success: true, data: response.data };
      }

      case 'SEARCH_SKILL': {
        const keyword = parts.slice(1).join(':');
        
        console.log(`[SEARCH_SKILL] Keyword: ${keyword}`);
        
        const response = await axios.get(
          `${API_BASE_URL}/api/search/skill/${encodeURIComponent(keyword)}`
        );
        
        return { success: true, data: response.data };
      }

      case 'CREATE': {
        // CREATE:<name>:<location>:<coordinates>:<fact1>|<fact2>|<fact3>
        const name = parts[1];
        const location = parts[2];
        const coordinates = parts[3];
        const factsStr = parts[4] || '';
        const facts = factsStr.split('|').filter(f => f.trim());
        
        console.log(`[CREATE] Village: ${name}`);
        
        const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
          name,
          location,
          coordinates,
          facts
        });
        
        return { success: true, data: response.data };
      }

      case 'STATUS': {
        console.log(`[STATUS] Checking API status`);
        
        const response = await axios.get(`${API_BASE_URL}/api/test`);
        
        return { success: true, data: response.data };
      }

      case 'PING': {
        // PING - Simple echo
        return { success: true, data: 'PONG' };
      }

      default:
        return { 
          success: false, 
          error: `Unknown command: ${cmd}. Valid commands: MATCH, SEARCH_LOC, SEARCH_SKILL, CREATE, STATUS, PING` 
        };
    }
  } catch (error: any) {
    console.error('[ERROR] Command processing error:', error.message);
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

function formatResponse(result: CommandResult): string {
  if (result.success) {
    if (typeof result.data === 'string') {
      return `OK:${result.data}`;
    }
    
    if (result.data?.matches) {
      const matchCount = result.data.matchCount || 0;
      const topMatch = result.data.matches[0];
      
      if (topMatch) {
        return `MATCH_FOUND:${matchCount}:${topMatch.name}:${topMatch.location}:${topMatch.matchScore}:${topMatch.relevantCapabilities.join('|')}`;
      }
      return `NO_MATCH:0`;
    }
    
    if (result.data?.users) {
      const count = result.data.count || 0;
      if (count > 0) {
        const firstUser = result.data.users[0];
        return `FOUND:${count}:${firstUser.name}:${firstUser.location}`;
      }
      return `NOT_FOUND:0`;
    }
    
    // Generic success
    return `OK:${JSON.stringify(result.data)}`;
  } else {
    return `ERROR:${result.error}`;
  }
}

function initializeSerialPort(): SerialPort | null {
  try {
    const port = new SerialPort({
      path: SERIAL_PORT,
      baudRate: BAUD_RATE,
      autoOpen: false
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    parser.on('data', async (data: string) => {
      const result = await processCommand(data);
      const response = formatResponse(result);
      
      console.log(`[TX] Sending: ${response}`);
      
      port.write(response + '\n', (err) => {
        if (err) {
          console.error('[ERROR] Write error:', err.message);
        }
      });
    });

    // Handle port events
    port.on('open', () => {
      console.log('[OK] Serial port opened successfully');
    });

    port.on('error', (err) => {
      console.error('[ERROR] Serial port error:', err.message);
    });

    port.on('close', () => {
      console.log('[INFO] Serial port closed');
    });

    // Open the port
    port.open((err) => {
      if (err) {
        console.error('[ERROR] Failed to open serial port:', err.message);
        console.log('[INFO] Running in simulation mode (no serial connection)');
        startSimulationMode();
      }
    });

    return port;
  } catch (error: any) {
    console.error('[ERROR] Serial port initialization failed:', error.message);
    return null;
  }
}

/**
 * Simulation mode for testing without physical antenna
 */
function startSimulationMode() {
  console.log('\n[SIMULATION] Testing commands without serial connection');
  console.log('================================================================\n');

  const testCommands = [
    'PING',
    'STATUS',
    'MATCH:Kolda:Need doctors and medical supplies urgently',
    'SEARCH_LOC:Dakar Region',
    'SEARCH_SKILL:doctors',
  ];

  let index = 0;

  const runTest = async () => {
    if (index >= testCommands.length) {
      console.log('\n[OK] All simulation tests completed');
      return;
    }

    const command = testCommands[index];
    console.log(`\n[Test ${index + 1}/${testCommands.length}]`);
    
    const result = await processCommand(command);
    const response = formatResponse(result);
    
    console.log(`[TX] Response: ${response}`);
    console.log('================================================================');

    index++;
    setTimeout(runTest, 2000);
  };

  setTimeout(runTest, 1000);
}

/**
 * List available serial ports
 */
async function listPorts() {
  try {
    const { SerialPort } = await import('serialport');
    const ports = await SerialPort.list();
    
    console.log('\n[INFO] Available Serial Ports:');
    if (ports.length === 0) {
      console.log('   No serial ports found');
    } else {
      ports.forEach((port, index) => {
        console.log(`   ${index + 1}. ${port.path}`);
        if (port.manufacturer) console.log(`      Manufacturer: ${port.manufacturer}`);
        if (port.serialNumber) console.log(`      Serial: ${port.serialNumber}`);
      });
    }
    console.log('');
  } catch (error: any) {
    console.error('[ERROR] Error listing ports:', error.message);
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log('\n================================================================');
  console.log('   TelePod Serial Server v1.0.0');
  console.log('================================================================\n');
  
  // List available ports first
  await listPorts();

  // Initialize serial connection
  const port = initializeSerialPort();

  console.log('\n[OK] Server is running and listening for commands...');
  console.log('[INFO] Press Ctrl+C to stop the server\n');

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\n[INFO] Shutting down...');
    if (port && port.isOpen) {
      port.close();
    }
    console.log('[OK] Server stopped');
    process.exit(0);
  });

  // Keep the process alive
  process.stdin.resume();
}

// Start the server
console.log('[INFO] Initializing TelePod Serial Server...\n');
main().catch((error) => {
  console.error('[ERROR] Fatal error:', error);
  process.exit(1);
});
