#!/bin/bash

echo "🛑 Stopping Heimdall development environment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🔍 Checking running services...${NC}"
docker-compose ps

echo -e "${BLUE}🛑 Stopping all services (keeping data)...${NC}"
docker-compose stop

echo -e "${GREEN}✅ All services stopped${NC}"
echo -e "${YELLOW}💡 Data is preserved. Use './scripts/dev-setup.sh' to restart${NC}"
echo -e "${YELLOW}💡 Or use './scripts/cleanup-localstack.sh' to remove all data${NC}"