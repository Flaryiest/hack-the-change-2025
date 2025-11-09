# TelePod

**AI-powered village connection network for remote Senegalese communities via LoRa radio**

TelePod connects isolated villages using low-power LoRa radios, AI translation, and intelligent resource matching to facilitate community support and resource sharing without internet infrastructure.

## The Problem

Remote villages in Senegal lack internet connectivity, making it impossible to access help when they need medical supplies, educational resources, or agricultural support.

## The Solution

Villages broadcast needs via LoRa radio in their native language (French, Wolof). TelePod translates, analyzes with AI, and matches them with nearby communities that can help.

## Architecture

```
LoRa Radio → Serial Server → REST API → PostgreSQL
                ↓              ↓
            Translation    AI Matching
            (GPT-4o)      (GPT-4o)
                           ↓
                    MCP Server → Claude
```

### Components

- **`/api`** - Express.js REST API with OpenAI integration
- **`/mcp`** - Model Context Protocol server for AI assistants
- **`/server`** - Serial communication bridge for LoRa antenna
- **`/web`** - React dashboard for village management
- **`/hardware`** - LoRa antenna schematics and code

## Quick Start

### Prerequisites
- Node.js 22+
- PostgreSQL database (Railway)
- OpenAI API key

### API Server
```bash
cd api
npm install
npm run build
npm start
```

### MCP Server
```bash
cd mcp
npm install
npm run build
npm start
```

### Serial Server
```bash
cd server
npm install
npm run build
npm start
```

### Web Dashboard
```bash
cd web
npm install
npm run dev
```

## Environment Variables

### API Server (.env)
```
DATABASE_URL=postgresql://...
OPEN_AI_KEY=sk-...
```

### Serial Server (.env)
```
API_URL=https://telepod.up.railway.app
OPENAI_API_KEY=sk-...
```

## Serial Commands

## Serial Commands

- `RECV:<message>` - Translate and match villages
- `PING` - Health check

## API Endpoints

- `POST /api/match` - AI-powered village matching
- `POST /api/translate` - Translate text to any language
- `GET /api/search/location/:location` - Search by location
- `GET /api/search/skill/:keyword` - Search by capability
- `POST /auth/login` - Village authentication
- `GET /villages` - Browse all connected villages
- `GET /dashboard` - Manage village data

## MCP Tools

- `get_all_users` - List all villages
- `match_user_need` - Find matching villages for a need
- `search_users_by_location` - Filter by location
- `search_users_by_fact` - Search by capabilities
- `create_user` - Register new village

## Database Schema

```prisma
model User {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  location    String?
  coordinates String?
  facts       String[]
}
```

## Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (Prisma ORM)
- **AI**: OpenAI GPT-4o
- **Frontend**: React, Vite
- **Hardware**: LoRa SX1276 (433MHz)
- **Deployment**: Railway

## Features

- Real-time LoRa communication
- Multi-language translation (Wolof, French → English)
- AI-powered need matching with scoring
- 50+ pre-seeded Senegalese villages
- Web dashboard for village management
- MCP integration for Claude Desktop
- Zero internet infrastructure required

