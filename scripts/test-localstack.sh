#!/bin/bash

set -e

echo "🧪 Testing LocalStack setup..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

LOCALSTACK_ENDPOINT="http://localhost:4566"
AWS_DEFAULT_REGION="us-east-1"

# Test S3
echo -e "${BLUE}🧪 Testing S3...${NC}"
aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
    s3 ls | grep heimdall-vault && echo -e "${GREEN}✅ S3 buckets found${NC}" || echo -e "${RED}❌ S3 test failed${NC}"

# Test DynamoDB
echo -e "${BLUE}🧪 Testing DynamoDB...${NC}"
aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
    dynamodb list-tables | grep heimdall-vault && echo -e "${GREEN}✅ DynamoDB tables found${NC}" || echo -e "${RED}❌ DynamoDB test failed${NC}"

# Test Cognito
echo -e "${BLUE}🧪 Testing Cognito...${NC}"
aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
    cognito-idp list-user-pools --max-results 10 | grep heimdall-vault && echo -e "${GREEN}✅ Cognito User Pool found${NC}" || echo -e "${RED}❌ Cognito test failed${NC}"

echo -e "\n${GREEN}🎉 LocalStack tests complete!${NC}"