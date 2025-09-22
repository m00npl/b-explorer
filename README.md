# Beacon Chain Explorer

A real-time Ethereum beacon chain explorer that continuously ingests beacon chain data and provides free access via interactive dashboards and REST API. Features rotational validator fetching system that systematically processes 2M+ validators over 3.5-hour cycles.

## Features

- **Real-time Data Ingestion**: Continuously polls beacon chain data with 60-second intervals
- **Rotational Validator System**: Fetches 10,000 validators per cycle, completing full rotation in ~3.5 hours
- **Web Explorer**: Interactive UI for exploring slots, validators, and epochs with responsive design
- **REST API**: JSON API with rate limiting (100 req/15min) for developers
- **Validator Search**: Search validators by index or public key prefix
- **Performance Tracking**: Validator effectiveness and performance metrics (planned)
- **Data Retention**: 6-month TTL window with automatic cleanup

## Architecture

- **Ingestor Service**: TypeScript service that polls Lighthouse beacon node API with rotational validator fetching
- **API Service**: Express.js REST API with PostgreSQL database, rate limiting and trust proxy configuration
- **Web Service**: Next.js frontend with TypeScript, TailwindCSS, and responsive design
- **PostgreSQL Database**: Stores beacon chain data with 6-month TTL and automatic cleanup
- **Docker**: Multi-platform containerization (linux/amd64) with buildx support

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Bun (preferred) or Node.js
- Access to a Lighthouse beacon node (or other Ethereum consensus client)

### Development

```bash
# Clone repository
git clone https://github.com/m00npl/b-explorer.git
cd b-explorer

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your beacon node URL and database credentials

# Start services with Docker Compose
docker compose up -d

# View logs
docker compose logs -f
```

### Production Deployment

```bash
# Clone on server
git clone https://github.com/m00npl/b-explorer.git
cd b-explorer

# Configure environment
cp .env.example .env
# Edit .env with production values

# Build and deploy with buildx
docker buildx bake --push
docker compose up -d

# Monitor logs
docker compose logs -f ingestor
```

## API Endpoints

### Slots
- `GET /api/v1/slots` - List latest slots (paginated)
- `GET /api/v1/slots/{slot}` - Get specific slot
- `GET /api/v1/slots/{slot}/attestations` - Get slot attestations

### Validators
- `GET /api/v1/validators` - List validators (paginated)
- `GET /api/v1/validators/{index}` - Get specific validator
- `GET /api/v1/validators/{index}/performance` - Get validator performance
- `GET /api/v1/validators/search?q={query}` - Search validators

### Epochs
- `GET /api/v1/epochs` - List epochs (paginated)
- `GET /api/v1/epochs/{epoch}` - Get specific epoch

### Health
- `GET /api/v1/health` - Service health status
- `GET /api/v1/health/stats` - Network statistics

## Rate Limits

- 100 requests per 15 minutes per IP
- Configurable via environment variables

## Data Retention

- 6-month sliding window (configurable)
- Automatic cleanup of expired data
- Optimized for recent data queries

## Deployment

### Docker Hub Images

Pre-built multi-platform images are available:

- `moonplkr/beacon-explorer:ingestor-latest`
- `moonplkr/beacon-explorer:api-latest`
- `moonplkr/beacon-explorer:web-latest`

### Building Images

```bash
# Build all services for multiple platforms
docker buildx bake

# Build and push to Docker Hub
docker buildx bake --push
```

### Server Deployment

1. **Set up environment**:
   ```bash
   cp .env.example .env
   # Configure BEACON_NODE_URL, database credentials, and API_BASE_URL
   ```

2. **Deploy services**:
   ```bash
   docker compose up -d
   ```

3. **Configure reverse proxy** (nginx proxy manager):
   - Point domain to API service (port 3001) for `/api/*` routes
   - Point domain to Web service (port 3000) for all other routes

### Environment Configuration

Key environment variables:

- `BEACON_NODE_URL`: Your Lighthouse beacon node endpoint (e.g., `http://65.21.215.154:5052`)
- `DB_USERNAME`, `DB_PASSWORD`: PostgreSQL credentials
- `API_BASE_URL`: Public API URL for web frontend (e.g., `https://your-domain.com`)
- `POLL_INTERVAL`: Data ingestion interval in milliseconds (default: 60000)

## Technical Details

### Rotational Validator System

The ingestor implements a sophisticated rotational system for handling 2M+ validators:

- Fetches 10,000 validators per 60-second cycle
- Cycles through entire validator set over ~3.5 hours (210 cycles)
- Automatically handles Ethereum's large exit_epoch values (converts to NULL for PostgreSQL compatibility)
- Processes validators in batches of 100 to optimize API calls

### Database Schema

PostgreSQL tables with 6-month TTL:
- `slots`: Block information with proposer and attestation data
- `validators`: Complete validator data with effectiveness ratings
- `epochs`: Epoch summaries with finality information
- `attestations`: Individual attestation records
- Automatic cleanup via `cleanup_expired_data()` function

### Rate Limiting

API implements rate limiting with trust proxy support:
- 100 requests per 15-minute window per IP
- Configurable via `RATE_LIMIT_WINDOW` and `RATE_LIMIT_MAX`
- Proper handling of proxy headers (X-Forwarded-For)

## Development

### Project Structure

```
b-explorer/
├── services/
│   ├── ingestor/          # TypeScript beacon data ingestor
│   │   ├── src/
│   │   │   ├── beacon/    # Lighthouse API client
│   │   │   ├── database/  # PostgreSQL client
│   │   │   └── types/     # TypeScript interfaces
│   │   └── Dockerfile
│   ├── api/               # Express.js REST API
│   │   ├── src/
│   │   │   ├── routes/    # API endpoints
│   │   │   ├── database/  # Database client
│   │   │   └── middleware/# Rate limiting, error handling
│   │   └── Dockerfile
│   └── web/               # Next.js frontend
│       ├── src/
│       │   ├── pages/     # React pages with dynamic routing
│       │   ├── components/# Reusable UI components
│       │   └── hooks/     # Custom React hooks
│       └── Dockerfile
├── docker-compose.yml     # Service orchestration
├── docker-bake.hcl       # Multi-platform build configuration
├── init-schema.sql       # PostgreSQL database schema
├── .env.example          # Environment variables template
└── README.md
```

### Local Development

```bash
# Install dependencies (each service)
cd services/ingestor && bun install
cd services/api && bun install
cd services/web && bun install

# Run individual services
cd services/ingestor && bun run dev
cd services/api && bun run dev
cd services/web && bun run dev
```

### Adding Features

1. **Database changes**: Update `init-schema.sql` with new tables/columns
2. **Data ingestion**: Modify `services/ingestor/src/ingestor.ts` and API client
3. **API endpoints**: Add routes in `services/api/src/routes/`
4. **Frontend**: Create pages in `services/web/src/pages/` and components
5. **Types**: Update TypeScript interfaces in `src/types/` directories

## License

MIT License - see LICENSE file for details.