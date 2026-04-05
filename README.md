# Checkit Backend Engineer Technical Assessment Submission

This repository contains a scalable, maintainable backend system built with NestJS, Prisma, PostgreSQL, and gRPC communication. The project follows a Monorepo architecture and borrows thought principles Hexagonal Architecture (Ports and Adapters,  interfaces and implementation) within the NestJS framework to ensure concerns remain separated, bounded by context and testable.

## Tech Stack
- Framework: NestJs(Microservices)
- Database: PostgresSQL
- ORM: Prisma
- Communication: gRPC
- Package Manager: pnpm

## Environment Setup

### Requirements:
- Nodejs (v20+ recommended)
- Docker (for database orchestration) or postgres installed on your local-machine or a remote postgre database you can access
- Pnpm(preferred) or any package manager of your choice
- grpcurl (for testing endpoints), or any grpc api client.

N.B: This Project was developed in a unix environment and documentation assumes user is operating with a unix like operating system
### Steps to have project running:
1. Clone the repository and install dependencies:
```bash
git clone https://github.com/ekefan/checkit-backend
cd checkit-backend
pnpm install
```
2. Environment Configuration
Copy the example environment file:
```bash
cp .env.example .env
```
_Note: The default connnection strings in `.env.example` are pre-configured to work the the Docker setup below.

3. Database Setup:
  Spin up the PostgesSQL containers for both the User and Wallet services:
```bash
cd infra
docker compose up user-postgres wallet-postgres -d
cd ..
```
4. Migrations & Prisma Client
Run the migrations to initialize your database schemas and generate the Prisma client stubs:
  - User Service:
    ```bash
    pnpm run prisma:migrate:user
    pnpm run prisma:gen:user
    ```
  - Wallet Service:
    ```bash
    pnpm run prisma:migrate:wallet
    pnpm run prisma:gen:wallet
    ```
5. Running the Services
To see the microservices in action, open two terminal windows and run:

Start User Microservice in one window:
```bash
pnpm  run start:dev:user
```

Start Wallet Microservice in the other window:
```bash
pnpm run start:dev:wallet
```
## API Reference (gRPC)

The system exposes two main gRPC services. You can interact with them using grpcurl or any gRPC client (like Postman).

### User Service (0.0.0.0:1901)
Responsible for identity and user profiles<br>
| Method | Request | Description |
|---|---|---|
| CreateUser | CreateUserRequest | Registers a new user in the system and auto-generates a wallet for them. |
| GetUserById | GetUserByIdRequest | Retrieves a user profile by unique ID. |

### Wallet Service (0.0.0.0:1902)
| Method | Request | Description |
|---|---|---|
| CreateWallet | CreateWalletRequest | Initializes a wallet for a user. |
| GetWallet | GetWalletRequest | Fetches current balance and wallet status. |
| CreditWallet | WalletTransactionRequest | Increases the wallet balance. |
| DebitWallet | WalletTransactionRequest | Decreases the wallet balance. |

## Example Requests

Once the services are running, you can test them using `grpcurl`:

- **Create User:**
```bash
grpcurl -plaintext -d '{"name": "John Doe", "email": "john@example.com"}' \
  0.0.0.0:1901 user.UserService/CreateUser
```

- **Get User By ID:**
```bash
grpcurl -plaintext -d '{"id": "<user_id>"}' \
  0.0.0.0:1901 user.UserService/GetUserById
```

- **Create Wallet:**
```bash
grpcurl -plaintext -d '{"user_id": "<user_id>"}' \
  0.0.0.0:1902 wallet.WalletService/CreateWallet
```

- **Get Wallet:**
```bash
grpcurl -plaintext -d '{"user_id": "<user_id>"}' \
  0.0.0.0:1902 wallet.WalletService/GetWallet
```

- **Credit Wallet:**
```bash
grpcurl -plaintext -d '{"user_id": "<user_id>", "amount": 500, "idempotency_key": "txn_001"}' \
  0.0.0.0:1902 wallet.WalletService/CreditWallet
```

- **Debit Wallet:**
```bash
grpcurl -plaintext -d '{"user_id": "<user_id>", "amount": 200, "idempotency_key": "txn_002"}' \
  0.0.0.0:1902 wallet.WalletService/DebitWallet
```