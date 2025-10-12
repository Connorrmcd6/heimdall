# Vault Platform

## Overview

Heimdall is a secure, enterprise-grade data sharing system designed to provide users with private "vaults" for storing, managing, and sharing sensitive documents. It emphasizes security, compliance, and operational transparency, leveraging a modern AWS microservices architecture, Golang services, Terraform-based infrastructure as code, and a React + TypeScript frontend.

The system is designed to be modular, scalable, and fully testable. Core features include:

- Multi-factor authentication (MFA)
- Encrypted data at rest and in transit
- Fast and effective document search
- Automated document classification
- Lifecycle management with expiration and storage tiering
- Secure APIs for programmatic access

The platform is structured to allow smooth migration between AWS accounts, fully testable services via LocalStack, and automated CI/CD pipelines with GitHub Actions and OIDC for secure AWS access.

---

## Project Goals

### 1. Security-first design

- Leverage AWS KMS, Cognito, and IAM for robust access control
- Encrypt all data at rest (S3, DynamoDB) and in transit (TLS)

### 2. Modular and maintainable architecture

- Each service is isolated, testable, and deployable independently
- Terraform modules allow reusable, versioned infrastructure

### 3. Test-driven development

- Full unit test coverage for business logic in Go services
- Integration tests using LocalStack for AWS service emulation
- End-to-end tests in a staging AWS account

### 4. Ease of feature integration

- Monorepo structure supports rapid development and CI/CD
- Clear separation between frontend, backend services, and infrastructure

---

## Repository Structure

```
/repo-root
├── /infra                # Terraform modules + environment overlays
│   ├── /modules
│   │   ├── network       # VPC, subnets, security groups
│   │   ├── s3-kms        # S3 buckets + KMS encryption modules
│   │   ├── ecs-service   # ECS task definitions, services, scaling
│   │   └── opensearch    # OpenSearch domains for document search
│   ├── /envs
│   │   ├── bootstrap     # Initial remote-state buckets and IAM roles
│   │   ├── staging       # Staging environment overlay
│   │   └── prod          # Production environment overlay
│   └── README.md
│
├── /services
│   ├── /vault-api        # Golang microservice handling vault APIs
│   │   ├── cmd/          # Service entrypoint (main)
│   │   ├── internal/
│   │   │   ├── api/      # HTTP request handlers
│   │   │   ├── service/  # Business logic (interface-driven)
│   │   │   ├── store/    # Interfaces for persistence (S3, DynamoDB)
│   │   │   └── adapters/ # Concrete SDK implementations
│   │   ├── tests/        # Integration tests against LocalStack
│   │   ├── Dockerfile
│   │   └── go.mod
│   └── other-services... # Placeholder for future microservices
│
├── /frontend             # React + TypeScript frontend
│   ├── src/              # React source code
│   ├── public/           # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── /.github/workflows    # CI/CD pipelines
│   ├── ci.yaml           # Continuous integration (unit tests, linting, plan)
│   └── cd.yaml           # Continuous deployment (apply, image push)
│
└── README.md             # Project overview and documentation
```

### Repository Design Notes

- **Monorepo design**: Frontend, backend services, and infrastructure co-exist for synchronous development, versioning, and CI/CD
- **Terraform modules**: Encapsulate infrastructure for reusability and account migration
- **Service layering**: Backend services follow Go best practices (interfaces, dependency injection, mocks) to support unit testing and integration testing
- **Frontend**: Developed in React + TypeScript, connects to backend APIs, supports authentication, and can be deployed as static assets via S3 + CloudFront

---

## Development Workflow

### 1. Local Development

- Use Docker Compose to run LocalStack and services for local testing
- Frontend runs via Vite development server (`npm run dev`)
- Backend services run locally with Go (`go run ./services/vault-api/cmd`)

### 2. Testing

- **Unit tests**: `go test ./...` for services, Jest for frontend
- **Integration tests**: LocalStack simulates AWS services
- **End-to-end tests**: Deployed in staging AWS environment

### 3. CI/CD

- GitHub Actions handles linting, testing, building, Terraform plan/apply, and frontend deployments
- Uses OIDC to assume AWS roles, avoiding long-lived secrets

### 4. Feature Development

- New features should live in `services/` or `frontend/` subdirectories
- Backend interfaces ensure testability and code coverage
- Terraform modules are versioned and environment-specific overlays manage configuration

---

## Key Principles

- **Security first**: KMS, IAM, Cognito, encrypted communication
- **Test-driven and modular**: Services are small, isolated, and mockable
- **Infrastructure as code**: Terraform modules, reusable and versioned
- **Monorepo**: Frontend + backend + infra for full-stack coherence
- **Automation**: CI/CD, LocalStack for local dev, staging account for full integration

---

## Documentation Purpose

This README serves as a living document for:

- Future developers onboarding the platform
- LLMs analyzing repo structure for automated code suggestions
- CI/CD and IaC pipelines reference
