# Beacon Chain Explorer on Golem DB

A real-time Ethereum beacon chain explorer that continuously ingests beacon chain data into a Golem DB and provides free access via dashboards, API, and Golem DB RPC.

## Features

- **Real-time Data Ingestion**: Continuously polls beacon chain data and stores in Golem DB
- **Web Explorer**: Interactive UI for exploring slots, validators, and epochs
- **REST API**: JSON API with rate limiting for developers
- **Validator Search**: Search validators by index or public key
- **Performance Tracking**: Validator effectiveness and performance metrics
- **Data Retention**: 6-month BTL window with automatic cleanup

## Architecture

- **Ingestor Service**: Polls beacon node API and ingests data into Golem DB
- **API Service**: REST API with rate limiting and validation
- **Web Service**: Next.js frontend with real-time updates
- **Nginx**: Reverse proxy and load balancer
- **Golem DB**: Distributed database for beacon chain data

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Bun (preferred) or Node.js

### Development

```bash
# Clone and setup
git clone <repository>
cd beacon

# Copy environment variables
cp .env.example .env

# Start services
bun run dev
```

### Production

```bash
# Build and deploy
bun run build
bun run up

# View logs
bun run logs

# Stop services
bun run down
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

### Docker Hub

Images are available on Docker Hub under `moonplkr/beacon-explorer`:

- `moonplkr/beacon-explorer:ingestor-latest`
- `moonplkr/beacon-explorer:api-latest`
- `moonplkr/beacon-explorer:web-latest`

### Build and Push

```bash
# Build all services
bun run build

# Push to Docker Hub
bun run build-push
```

### Server Deployment

```bash
# On server (ubuntu@moon.dev.golem.network)
git pull
docker compose pull
docker compose up -d --build
```

## Configuration

### Environment Variables

See `.env.example` for all available configuration options.

### Beacon Node

The ingestor connects to a beacon node API. Configure `BEACON_NODE_URL` to point to your preferred endpoint.

### Golem DB

Ensure Golem DB is running and accessible at `GOLEM_DB_URL`.

## Development

### Project Structure

```
beacon/
├── services/
│   ├── ingestor/     # Beacon data ingestor
│   ├── api/          # REST API service
│   └── web/          # Next.js frontend
├── nginx/            # Nginx configuration
├── golem-config/     # Golem DB configuration
└── docker-compose.yml
```

### Adding Features

1. Update database schema in `init-schema.sql`
2. Modify ingestor to collect new data
3. Add API endpoints for new data
4. Update web UI components

### Testing

```bash
# Run type checking
bun run type-check

# Run linting
bun run lint
```

## License

MIT License - see LICENSE file for details.