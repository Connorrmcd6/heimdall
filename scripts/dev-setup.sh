#!/bin/bash

set -e

echo "🚀 Setting up Heimdall development environment..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}📦 Starting LocalStack...${NC}"
docker-compose up -d localstack

echo -e "${BLUE}⏳ Waiting a bit for LocalStack to fully start...${NC}"
sleep 10

echo -e "${BLUE}🔧 Initializing AWS resources...${NC}"
./scripts/init-localstack.sh

echo -e "${BLUE}🖥️  Starting frontend development server...${NC}"
docker-compose up -d frontend

echo -e "\n${GREEN}✅ Development environment is ready!${NC}"
echo -e "${YELLOW}🌐 Frontend: http://localhost:5173${NC}"
echo -e "${YELLOW}📊 LocalStack: http://localhost:4566${NC}"

echo -e "\n${BLUE}💡 Available commands:${NC}"
echo -e "  • ./scripts/status.sh        - Check status"
echo -e "  • ./scripts/stop-dev.sh      - Stop (keep data)"
echo -e "  • ./scripts/cleanup-localstack.sh - Complete cleanup"
echo -e "  • docker-compose logs -f     - View logs"

echo -e "\n${YELLOW}⚠️  To stop: Use './scripts/stop-dev.sh' or './scripts/cleanup-localstack.sh'${NC}"