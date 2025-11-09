# TelePod MCP Server

AI superconnector MCP server for the TelePod project - connecting villages and communities through radio with LoRa waves.

## Overview

This MCP (Model Context Protocol) server provides AI assistants with access to the TelePod database, enabling:
- User/village information retrieval
- Location-based searches
- Skill and capability matching
- Demand-to-supplier matching
- Community network management

## Features

### Available Tools

1. **get_all_users** - List all users/villages in the TelePod network
2. **get_user_by_name** - Retrieve specific user/village information
3. **search_users_by_location** - Find users in a specific location
4. **search_users_by_fact** - Search for users with specific skills/capabilities
5. **create_user** - Add new user/village to the network
6. **match_user_need** - Intelligently match user demands with suppliers

## Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Build the TypeScript code
npm run build
```

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Configuration

Create a `.env` file or link to your API's `.env`:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Usage with Claude Desktop

Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "telepod": {
      "command": "node",
      "args": [
        "/path/to/hack-the-change-2025/mcp/dist/server.js"
      ],
      "env": {
        "DATABASE_URL": "postgresql://user:password@host:port/database"
      }
    }
  }
}
```

## Example Queries

Once connected, you can ask Claude:

- "Show me all villages in the TelePod network"
- "Find users in Calgary, AB"
- "Who has medical supplies?"
- "Match Village A's need for farming equipment with potential suppliers"
- "Add a new village with capabilities in education and healthcare"

## Project Context

**TelePod** is an AI superconnector mixed with a low-cost phone that:
- Sends information to other villages through radio with LoRa waves
- Maintains a central database with community information
- Uses AI to match user/village demands with those who can help
- Enables communication in areas with limited infrastructure

## Architecture

```
┌─────────────────┐
│  Claude/AI      │
│  Assistant      │
└────────┬────────┘
         │ MCP Protocol
         │
┌────────▼────────┐
│  TelePod MCP    │
│  Server         │
└────────┬────────┘
         │ Prisma ORM
         │
┌────────▼────────┐
│  PostgreSQL     │
│  Database       │
└─────────────────┘
```

## Database Schema

```prisma
model User {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  location    String?
  coordinates String?
  facts       String[]  // Skills, capabilities, needs
}
```

## License

ISC
