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
  
  // Ignore empty messages
  if (!trimmed) {
    return { success: true, data: null };
  }
  
  console.log(`\n[RX] Received: ${trimmed}`);

  // Ignore echo messages (messages that start with SENT, ERROR, OK, RECV responses)
  const firstWord = trimmed.split(':')[0].toUpperCase();
  if (firstWord === 'SENT' || firstWord === 'ERROR' || firstWord === 'OK') {
    console.log(`[IGNORE] Ignoring echo message`);
    return { success: true, data: null };
  }

  try {
    const parts = trimmed.split(':');
    const cmd = parts[0].toUpperCase();

    switch (cmd) {
      case 'RECV': {
        // RECV:<foreign_language_message>
        const foreignMessage = parts.slice(1).join(':');
        
        console.log(`[RECV] Original message: ${foreignMessage}`);
        
        // Step 1: Translate the message to English
        console.log(`[TRANSLATE] Translating to English...`);
        const translateResponse = await axios.post(`${API_BASE_URL}/api/translate`, {
          text: foreignMessage,
          targetLanguage: 'English'
        });
        
        const englishMessage = translateResponse.data.translatedText;
        console.log(`[TRANSLATE] English translation: ${englishMessage}`);
        
        // Step 2: Use the translated message to find matching villages
        console.log(`[MATCH] Finding matching villages...`);
        const matchResponse = await axios.post(`${API_BASE_URL}/api/match`, {
          query: englishMessage,
          useAI: true
        });
        
        const matches = matchResponse.data.matches;
        const topMatch = matches && matches.length > 0 ? matches[0] : null;
        
        if (topMatch) {
          console.log(`[MATCH] Top match found: ${topMatch.name} (Score: ${topMatch.matchScore})`);
          
          return {
            success: true,
            data: {
              originalMessage: foreignMessage,
              translatedMessage: englishMessage,
              topMatch: {
                name: topMatch.name,
                location: topMatch.location,
                score: topMatch.matchScore,
                capabilities: topMatch.relevantCapabilities
              }
            }
          };
        } else {
          console.log(`[MATCH] No matches found`);
          return {
            success: true,
            data: {
              originalMessage: foreignMessage,
              translatedMessage: englishMessage,
              topMatch: null
            }
          };
        }
      }

      case 'PING': {
        // PING - Simple echo
        return { success: true, data: 'PONG' };
      }

      default:
        return { 
          success: false, 
          error: ` ` 
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

function formatResponse(result: CommandResult): string | null {
  if (result.success) {
    // Don't respond to ignored messages
    if (result.data === null) {
      return null;
    }
    
    if (typeof result.data === 'string') {
      return `OK:${result.data}`;
    }
    
    // Handle RECV response with translation and match
    if (result.data?.translatedMessage !== undefined) {
      const topMatch = result.data.topMatch;
      
      if (topMatch) {
        // Format: RECV:translated_message:match_name:match_location:score
        return `RECV:${result.data.translatedMessage}:${topMatch.name}:${topMatch.location}:${topMatch.score.toFixed(2)}`;
      } else {
        // No match found
        return `RECV:${result.data.translatedMessage}:NO_MATCH`;
      }
    }
    
    // Generic success
    return `OK:${JSON.stringify(result.data)}`;
  } else {
    // Don't send errors back to antenna - just log them
    console.error(`[ERROR] ${result.error}`);
    return null;
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
      
      // Only write if there's a response (null means ignore)
      if (response !== null) {
        console.log(`[TX] Sending: ${response}`);
        
        port.write(response + '\n', (err) => {
          if (err) {
            console.error('[ERROR] Write error:', err.message);
          }
        });
      }
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
    'RECV:Nous avons besoin de médecins et de fournitures médicales',
    'RECV:J\'ai besoin d\'aide pour l\'agriculture',
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
    
    if (response !== null) {
      console.log(`[TX] Response: ${response}`);
    } else {
      console.log(`[TX] No response (message ignored)`);
    }
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
