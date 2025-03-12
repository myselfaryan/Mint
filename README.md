# Mint

A modern platform for conducting programming contests and managing coding problems.

## Development Setup

### Prerequisites

- Node.js 22.2.0+ and npm
- Docker
- [Bun](https://bun.sh) (recommended package manager)

### Quick Start

1. Clone the repository

2. Install dependencies

```bash
bun install
```

3. Set up environment variables

```bash
cp .env.example .env
```

4. Start the database

```bash
bun pg
```

5. Run migrations and seed data

```bash
bun db:migrate
bun db:superuser  # Create an admin user
bun db:seed      # Add test data (optional)
```

6. Start the development server

```bash
bun dev
```

Visit `http://localhost:3000` to see the application.

## Available Commands

### Development

```bash
bun dev          # Start development server
bun build        # Build for production
bun start        # Start production server
bun lint         # Run ESLint
bun format       # Format code with Prettier
bun format:check # Check code formatting
```

### Database Management

#### PostgreSQL Control

```bash
bun pg           # Start PostgreSQL container
bun pg:stop      # Stop and remove PostgreSQL container
```

Connection Details:

- Host: `localhost` (from host) or `mint-postgres` (from containers)
- Port: `5432`
- Database: `mint`
- Username: `postgres`
- Password: `postgres`
- URL: `postgres://postgres:postgres@localhost:5432/mint`

#### pgAdmin (Database UI)

```bash
bun pg-admin     # Start pgAdmin web interface
bun pg-admin:stop # Stop and remove pgAdmin container
```

Access Details:

- URL: http://localhost:5050
- Email: `admin@admin.com`
- Password: `admin`

#### Database Operations

```bash
bun db:migrate   # Generate and apply database migrations
bun db:seed     # Add test data to database
bun db:clear    # Clear all data from database
bun db:superuser # Create an admin user interactively
```

### Test Data

The seeding process creates:

- Admin users (2)
- Organizer users (3)
- Regular users (5)
- Organizations (3)
- Problems per organization (2)
- Contests per organization (2)
- Groups per organization (2)

All test users are created with password: `password123`

## Project Structure

```bash
mint/
├── app/            # Next.js app router pages
│   ├── api-doc/    # Swagger API documentation
│   └── api/       # API routes
├── components/     # React components
├── db/            # Database schema and migrations
├── lib/           # Utility functions and shared logic
├── middleware/    # Request middleware (logging, metrics, error handling)
├── public/        # Static assets
└── scripts/       # CLI scripts for development
```

## Monitoring

The application includes built-in monitoring with Prometheus metrics:

- HTTP request counts and durations
- Active user counts
- Database query durations

Metrics are available at: `http://localhost:3000/api/metrics`

### Available Metrics

- `http_requests_total`: Counter of HTTP requests
- `http_request_duration_ms`: Histogram of HTTP request durations
- `active_users`: Gauge of currently active users
- `db_query_duration_ms`: Histogram of database query durations

### Prometheus Configuration

Add to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'mint'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/api/metrics'
```

## Troubleshooting

### Database Issues

1. If containers are already running:

```bash
docker stop mint-postgres mint-pgadmin
docker rm mint-postgres mint-pgadmin
```

1. If ports are in use:

- Check if PostgreSQL is running locally: `sudo lsof -i :5432`
- Check if something is using pgAdmin port: `sudo lsof -i :5050`

2. To completely reset:

```bash
bun pg:stop
bun pg-admin:stop
bun pg
bun pg-admin
bun db:clear
bun db:migrate
bun db:seed
```

> [!NOTE]
> While Bun is recommended, you can still use npm by replacing `bun` with `npm run` in all commands.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## API Documentation

The API documentation is available at `/api-doc` when running the development server.
It provides:

- Interactive API documentation
- Request/response examples
- API endpoint testing interface

### Adding Documentation

Add JSDoc comments with Swagger annotations to your API routes:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Endpoint description
 *     responses:
 *       200:
 *         description: Success response
 */
```