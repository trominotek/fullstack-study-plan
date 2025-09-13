# Day 1-2: PostgreSQL Setup with Docker

## What is PostgreSQL?
PostgreSQL is a powerful, open-source relational database management system (RDBMS) known for:
- ACID compliance (Atomicity, Consistency, Isolation, Durability)
- Advanced data types and indexing
- Excellent performance and scalability
- Strong community support

## Why Use Docker for PostgreSQL?
- **Consistency**: Same environment across development, testing, production
- **Isolation**: Database runs in its own container
- **Easy Setup**: No complex installation process
- **Version Management**: Easy to switch PostgreSQL versions
- **Cleanup**: Remove everything cleanly when done

## Step 1: Install Docker
If you don't have Docker installed:

### macOS:
```bash
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
# Or using Homebrew:
brew install --cask docker
```

### Verify Docker Installation:
```bash
docker --version
docker-compose --version
```

## Step 2: Run PostgreSQL Container

### Basic PostgreSQL Container:
```bash
# Pull and run PostgreSQL 15
docker run --name fullstack-postgres \
  -e POSTGRES_USER=fullstack_user \
  -e POSTGRES_PASSWORD=fullstack_pass \
  -e POSTGRES_DB=fullstack_db \
  -p 5432:5432 \
  -d postgres:15
```

### Explanation of Parameters:
- `--name fullstack-postgres`: Container name
- `-e POSTGRES_USER=fullstack_user`: Database username
- `-e POSTGRES_PASSWORD=fullstack_pass`: Database password
- `-e POSTGRES_DB=fullstack_db`: Default database name
- `-p 5432:5432`: Port mapping (host:container)
- `-d`: Run in detached mode
- `postgres:15`: PostgreSQL version 15 image

### Using Docker Compose (Recommended):
Create `docker-compose.yml` in your project root:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: fullstack-postgres
    environment:
      POSTGRES_USER: fullstack_user
      POSTGRES_PASSWORD: fullstack_pass
      POSTGRES_DB: fullstack_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-scripts:/docker-entrypoint-initdb.d
    restart: unless-stopped

volumes:
  postgres_data:
```

### Start with Docker Compose:
```bash
# Start PostgreSQL
docker-compose up -d

# Check if running
docker-compose ps

# View logs
docker-compose logs postgres

# Stop PostgreSQL
docker-compose down

# Stop and remove volumes (deletes data)
docker-compose down -v
```

## Step 3: Connect to PostgreSQL

### Using Docker Command Line:
```bash
# Connect to running container
docker exec -it fullstack-postgres psql -U fullstack_user -d fullstack_db

# Once connected, try these commands:
\l          # List databases
\dt         # List tables
\d          # Describe tables
\q          # Quit
```

### Connection Details:
- **Host**: localhost
- **Port**: 5432
- **Database**: fullstack_db
- **Username**: fullstack_user
- **Password**: fullstack_pass

## Step 4: Database Client Tools

### 1. pgAdmin (Web Interface):
Add to your `docker-compose.yml`:

```yaml
services:
  # ... existing postgres service ...
  
  pgadmin:
    image: dpage/pgadmin4
    container_name: fullstack-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@example.com
      PGADMIN_DEFAULT_PASSWORD: admin_pass
    ports:
      - "8080:80"
    depends_on:
      - postgres
```

Access pgAdmin at: http://localhost:8080

### 2. Command Line Tools:
```bash
# Install PostgreSQL client tools (macOS)
brew install postgresql

# Connect from command line
psql -h localhost -p 5432 -U fullstack_user -d fullstack_db
```

### 3. GUI Applications:
- **TablePlus**: https://tableplus.com/
- **DBeaver**: https://dbeaver.io/
- **DataGrip**: https://www.jetbrains.com/datagrip/

## Step 5: Basic SQL Operations

### Create Your First Table:
```sql
-- Connect to database and run these commands
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Insert Sample Data:
```sql
INSERT INTO items (name, description) VALUES 
('Sample Item 1', 'This is a sample item for testing'),
('Sample Item 2', 'Another sample item'),
('Test Item', 'A test item with some description');
```

### Query Data:
```sql
-- Select all items
SELECT * FROM items;

-- Select specific columns
SELECT id, name FROM items;

-- Filter with WHERE
SELECT * FROM items WHERE name LIKE '%Sample%';

-- Count items
SELECT COUNT(*) FROM items;
```

## Step 6: Database Persistence

### With Volumes (Data Survives Container Restart):
```yaml
services:
  postgres:
    # ... other config ...
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
volumes:
  postgres_data:
```

### Without Volumes (Data Lost on Container Removal):
```bash
# Just run without volume mapping
docker run --name temp-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=pass \
  -e POSTGRES_DB=testdb \
  -p 5432:5432 \
  -d postgres:15
```

## Step 7: Initialization Scripts

### Create Init Script:
Create `init-scripts/01-init.sql`:

```sql
-- Create tables
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO items (name, description) VALUES 
('Welcome Item', 'This item was created automatically'),
('Docker Item', 'Created via initialization script');

-- Create indexes
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_users_username ON users(username);
```

This script runs automatically when container starts for the first time.

## Step 8: Environment Variables

### Create `.env` file:
```env
# Database Configuration
POSTGRES_USER=fullstack_user
POSTGRES_PASSWORD=fullstack_pass
POSTGRES_DB=fullstack_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# pgAdmin Configuration
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin_pass
```

### Update `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: fullstack-postgres
    env_file:
      - .env
    # ... rest of config
```

## Docker Commands Reference

### Container Management:
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop fullstack-postgres

# Start stopped container
docker start fullstack-postgres

# Remove container
docker rm fullstack-postgres

# Remove image
docker rmi postgres:15
```

### Database Backup & Restore:
```bash
# Backup database
docker exec fullstack-postgres pg_dump -U fullstack_user fullstack_db > backup.sql

# Restore database
docker exec -i fullstack-postgres psql -U fullstack_user -d fullstack_db < backup.sql
```

## Common Issues & Solutions

### Port Already in Use:
```bash
# Find what's using port 5432
lsof -i :5432

# Kill the process or change port mapping
docker run -p 5433:5432 # Use different host port
```

### Container Won't Start:
```bash
# Check container logs
docker logs fullstack-postgres

# Check if another postgres is running
brew services list | grep postgres
```

### Permission Denied:
```bash
# Fix volume permissions
docker-compose down
docker volume rm fullstack-study-plan_postgres_data
docker-compose up -d
```

## Next Steps
Once you have PostgreSQL running:
1. ✅ Container starts successfully
2. ✅ Can connect using psql or GUI tool
3. ✅ Can create tables and insert data
4. ✅ Data persists after container restart
5. ✅ pgAdmin accessible (if using)

Tomorrow we'll connect Python to this database!

## Practice Exercises
1. Create a `users` table with columns: id, username, email, created_at
2. Insert 3 sample users
3. Write queries to find users by email domain
4. Backup your database and restore it
5. Set up pgAdmin and explore the database structure