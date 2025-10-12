#!/bin/bash

echo "🧹 Cleaning up LocalStack resources..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Show current status
echo -e "${BLUE}🔍 Current Docker status:${NC}"
docker-compose ps
echo ""

echo -e "${YELLOW}⚠️  This will destroy all LocalStack data and stop all services. Continue? (y/N)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo -e "${RED}🛑 Stopping all services...${NC}"
    docker-compose down
    
    echo -e "${RED}🗑️  Removing volumes and data...${NC}"
    docker-compose down -v
    
    echo -e "${RED}🗑️  Removing LocalStack data volume...${NC}"
    docker volume rm heimdall_localstack_data 2>/dev/null || true
    
    echo -e "${RED}🗑️  Cleaning up unused Docker resources...${NC}"
    docker system prune -f
    
    echo -e "${RED}🗑️  Removing any orphaned containers...${NC}"
    docker container prune -f
    
    echo -e "${GREEN}✅ Complete cleanup finished!${NC}"
    echo -e "${YELLOW}💡 Run './scripts/dev-setup.sh' to reinitialize${NC}"
    
    # Show final status
    echo -e "\n${BLUE}📊 Final Docker status:${NC}"
    docker ps -a | grep heimdall || echo "No Heimdall containers running"
    docker volume ls | grep heimdall || echo "No Heimdall volumes remaining"
else
    echo -e "${YELLOW}❌ Cleanup cancelled${NC}"
fi