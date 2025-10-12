#!/bin/bash

echo "📊 Heimdall Development Environment Status"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\n${BLUE}🐳 Docker Containers:${NC}"
docker-compose ps

echo -e "\n${BLUE}💾 Docker Volumes:${NC}"
docker volume ls | grep heimdall || echo "No Heimdall volumes found"

echo -e "\n${BLUE}🌐 Service Endpoints:${NC}"
# Check if services are responding
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend: http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Frontend: http://localhost:5173 (not responding)${NC}"
fi

if curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ LocalStack: http://localhost:4566${NC}"
else
    echo -e "${RED}❌ LocalStack: http://localhost:4566 (not responding)${NC}"
fi

echo -e "\n${BLUE}💽 Docker Resource Usage:${NC}"
docker system df

echo -e "\n${YELLOW}💡 Available commands:${NC}"
echo -e "  • ./scripts/dev-setup.sh     - Start everything"
echo -e "  • ./scripts/stop-dev.sh      - Stop (keep data)"  
echo -e "  • ./scripts/cleanup-localstack.sh - Complete cleanup"
echo -e "  • ./scripts/test-localstack.sh     - Test LocalStack"
echo -e "  • ./scripts/status.sh        - Show this status"