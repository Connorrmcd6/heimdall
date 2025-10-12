#!/bin/bash

set -e

echo "🚀 Initializing LocalStack for Heimdall Vault..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
LOCALSTACK_ENDPOINT="http://localhost:4566"
AWS_DEFAULT_REGION="us-east-1"
PROJECT_NAME="heimdall-vault"

# Function to check if LocalStack is ready
wait_for_localstack() {
    echo -e "${YELLOW}⏳ Waiting for LocalStack to be ready...${NC}"
    local max_attempts=60
    local attempt=0
    
    until curl -f ${LOCALSTACK_ENDPOINT}/_localstack/health > /dev/null 2>&1; do
        attempt=$((attempt + 1))
        if [ $attempt -eq $max_attempts ]; then
            echo -e "${RED}❌ LocalStack failed to start after ${max_attempts} attempts${NC}"
            echo -e "${YELLOW}💡 Troubleshooting steps:${NC}"
            echo -e "  1. Check LocalStack logs: docker-compose logs localstack"
            echo -e "  2. Check port 4566: lsof -i :4566"
            echo -e "  3. Try: docker-compose down -v && docker-compose up localstack"
            exit 1
        fi
        
        if [ $((attempt % 10)) -eq 0 ]; then
            echo -e "${BLUE}⏳ Still waiting... (${attempt}/${max_attempts}) - Checking LocalStack logs:${NC}"
            docker-compose logs --tail=5 localstack || true
        fi
        
        sleep 3
    done
    echo -e "${GREEN}✅ LocalStack is ready!${NC}"
}

# Test LocalStack connection first
test_localstack_connection() {
    echo -e "${BLUE}🔍 Testing LocalStack connection...${NC}"
    
    if ! curl -f ${LOCALSTACK_ENDPOINT}/_localstack/health > /dev/null 2>&1; then
        echo -e "${RED}❌ Cannot connect to LocalStack${NC}"
        echo -e "${YELLOW}💡 Is LocalStack running? Try: docker-compose up -d localstack${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ LocalStack connection successful${NC}"
}

# Function to create S3 buckets
create_s3_buckets() {
    echo -e "${BLUE}📦 Creating S3 buckets...${NC}"
    
    # Document storage bucket
    aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
        s3 mb s3://${PROJECT_NAME}-documents-dev 2>/dev/null || echo "Documents bucket already exists"
    
    # Upload staging bucket
    aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
        s3 mb s3://${PROJECT_NAME}-uploads-dev 2>/dev/null || echo "Uploads bucket already exists"
    
    # Frontend hosting bucket (for future S3 deployment)
    aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
        s3 mb s3://${PROJECT_NAME}-frontend-dev 2>/dev/null || echo "Frontend bucket already exists"
    
    echo -e "${GREEN}✅ S3 buckets created${NC}"
}

# Function to create DynamoDB tables
create_dynamodb_tables() {
    echo -e "${BLUE}🗄️  Creating DynamoDB tables...${NC}"
    
    # Users table
    aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
        dynamodb create-table \
        --table-name ${PROJECT_NAME}-users \
        --attribute-definitions \
            AttributeName=UserId,AttributeType=S \
            AttributeName=Email,AttributeType=S \
        --key-schema AttributeName=UserId,KeyType=HASH \
        --global-secondary-indexes \
            IndexName=EmailIndex,KeySchema='[{AttributeName=Email,KeyType=HASH}]',Projection='{ProjectionType=ALL}',BillingMode=PAY_PER_REQUEST \
        --billing-mode PAY_PER_REQUEST \
        --tags Key=Environment,Value=development Key=Project,Value=${PROJECT_NAME} \
        > /dev/null 2>&1 || echo "Users table already exists"
    
    # Documents table
    aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
        dynamodb create-table \
        --table-name ${PROJECT_NAME}-documents \
        --attribute-definitions \
            AttributeName=DocumentId,AttributeType=S \
            AttributeName=UserId,AttributeType=S \
            AttributeName=CreatedAt,AttributeType=S \
        --key-schema AttributeName=DocumentId,KeyType=HASH \
        --global-secondary-indexes \
            'IndexName=UserIdIndex,KeySchema=[{AttributeName=UserId,KeyType=HASH},{AttributeName=CreatedAt,KeyType=RANGE}],Projection={ProjectionType=ALL},BillingMode=PAY_PER_REQUEST' \
        --billing-mode PAY_PER_REQUEST \
        --tags Key=Environment,Value=development Key=Project,Value=${PROJECT_NAME} \
        > /dev/null 2>&1 || echo "Documents table already exists"
    
    # Shares table (for document sharing)
    aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
        dynamodb create-table \
        --table-name ${PROJECT_NAME}-shares \
        --attribute-definitions \
            AttributeName=ShareId,AttributeType=S \
            AttributeName=DocumentId,AttributeType=S \
        --key-schema AttributeName=ShareId,KeyType=HASH \
        --global-secondary-indexes \
            IndexName=DocumentIdIndex,KeySchema='[{AttributeName=DocumentId,KeyType=HASH}]',Projection='{ProjectionType=ALL}',BillingMode=PAY_PER_REQUEST \
        --billing-mode PAY_PER_REQUEST \
        --tags Key=Environment,Value=development Key=Project,Value=${PROJECT_NAME} \
        > /dev/null 2>&1 || echo "Shares table already exists"
    
    echo -e "${GREEN}✅ DynamoDB tables created${NC}"
}

# Function to create Cognito User Pool
create_cognito_user_pool() {
    echo -e "${BLUE}🔐 Creating Cognito User Pool...${NC}"
    
    # Create user pool
    USER_POOL_ID=$(aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
        cognito-idp create-user-pool \
        --pool-name ${PROJECT_NAME}-user-pool \
        --policies '{
            "PasswordPolicy": {
                "MinimumLength": 8,
                "RequireUppercase": true,
                "RequireLowercase": true,
                "RequireNumbers": true,
                "RequireSymbols": true,
                "TemporaryPasswordValidityDays": 7
            }
        }' \
        --auto-verified-attributes email \
        --verification-message-template '{
            "DefaultEmailOption": "CONFIRM_WITH_CODE",
            "EmailSubject": "Heimdall Vault - Verify your email",
            "EmailMessage": "Your verification code is {####}"
        }' \
        --mfa-configuration OPTIONAL \
        --account-recovery-setting '{
            "RecoveryMechanisms": [
                {
                    "Priority": 1,
                    "Name": "verified_email"
                }
            ]
        }' \
        --query 'UserPool.Id' --output text 2>/dev/null || echo "existing-pool-id")
    
    if [ "$USER_POOL_ID" != "existing-pool-id" ]; then
        echo -e "${GREEN}✅ User Pool created: ${USER_POOL_ID}${NC}"
        
        # Create user pool client
        CLIENT_ID=$(aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
            cognito-idp create-user-pool-client \
            --user-pool-id ${USER_POOL_ID} \
            --client-name ${PROJECT_NAME}-web-client \
            --generate-secret \
            --explicit-auth-flows ADMIN_NO_SRP_AUTH USER_PASSWORD_AUTH \
            --query 'UserPoolClient.ClientId' --output text 2>/dev/null || echo "existing-client-id")
        
        if [ "$CLIENT_ID" != "existing-client-id" ]; then
            echo -e "${GREEN}✅ User Pool Client created: ${CLIENT_ID}${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  User Pool already exists${NC}"
    fi
}

# Function to create KMS key for encryption
create_kms_key() {
    echo -e "${BLUE}🔑 Creating KMS key for encryption...${NC}"
    
    KEY_ID=$(aws --endpoint-url=${LOCALSTACK_ENDPOINT} --region=${AWS_DEFAULT_REGION} \
        kms create-key \
        --description "Heimdall Vault document encryption key" \
        --key-usage ENCRYPT_DECRYPT \
        --key-spec SYMMETRIC_DEFAULT \
        --tags TagKey=Environment,TagValue=development TagKey=Project,TagValue=${PROJECT_NAME} \
        --query 'KeyMetadata.KeyId' --output text 2>/dev/null || echo "existing-key")
    
    if [ "$KEY_ID" != "existing-key" ]; then
        echo -e "${GREEN}✅ KMS key created: ${KEY_ID}${NC}"
    else
        echo -e "${YELLOW}⚠️  KMS key creation skipped${NC}"
    fi
}

# Function to display summary
display_summary() {
    echo -e "\n${GREEN}🎉 LocalStack initialization complete!${NC}\n"
    echo -e "${BLUE}📋 Resources created:${NC}"
    echo -e "  • S3 Buckets:"
    echo -e "    - ${PROJECT_NAME}-documents-dev"
    echo -e "    - ${PROJECT_NAME}-uploads-dev"
    echo -e "    - ${PROJECT_NAME}-frontend-dev"
    echo -e "  • DynamoDB Tables:"
    echo -e "    - ${PROJECT_NAME}-users"
    echo -e "    - ${PROJECT_NAME}-documents"
    echo -e "    - ${PROJECT_NAME}-shares"
    echo -e "  • Cognito User Pool: ${PROJECT_NAME}-user-pool"
    echo -e "  • KMS Key for encryption"
    echo -e "\n${BLUE}🔗 Useful endpoints:${NC}"
    echo -e "  • LocalStack Dashboard: http://localhost:4566/_localstack/health"
    echo -e "  • AWS CLI endpoint: --endpoint-url=http://localhost:4566"
    echo -e "\n${YELLOW}💡 Next steps:${NC}"
    echo -e "  1. Start your frontend: docker-compose up frontend"
    echo -e "  2. Test the setup: ./scripts/test-localstack.sh"
    echo -e "  3. Begin Go service development"
}

# Main execution with better error handling
main() {
    echo -e "${BLUE}🔍 Checking if LocalStack is already running...${NC}"
    
    if curl -f ${LOCALSTACK_ENDPOINT}/_localstack/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ LocalStack is already running!${NC}"
        test_localstack_connection
    else
        echo -e "${YELLOW}⚠️  LocalStack not detected. Starting wait...${NC}"
        wait_for_localstack
    fi
    
    create_s3_buckets
    create_dynamodb_tables
    create_cognito_user_pool
    create_kms_key
    display_summary
}

# Run main function
main "$@"