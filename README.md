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
Copy the example environment file for each of the services
*User Service*
```bash
cd apps/user &&  cp .env.example .env #cd into the apps/user directory and cp .env.example to .env
```

*Wallet Service*
```bash
cd ../wallet && cp .env.example .env #cd into the apps/wallet directory and cp .env.example to .env
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

## File Structure:
checkit-backend
┣ apps/
┃ ┣ user/                        # User microservice
┃ ┃ ┣ prisma/                    # Schema and migrations
┃ ┃ └── src/
┃ ┃     ├── main.ts              # Service entrypoint
┃ ┃     ├── user.module.ts       # NestJS module wiring
┃ ┃     ├── user.controller.ts   # gRPC handler (adapter/port in)
┃ ┃     ├── user.service.ts      # Core business logic
┃ ┃     ├── user.repository.ts   # Base repository abstraction
┃ ┃     ├── user.interface.ts    # User Service rpc Server contract
┃ ┃     ├── wallet.interface.ts  # Wallet service client contract
┃ ┃     ├── user.dto.ts          # Request/response models
┃ ┃     ├── user.validator.ts    # Input validation
┃ ┃     ├── user.constants.ts    # gRPC constant for rpc client
┃ ┃     ├── prisma.service.ts    # Prisma client wrapper
┃ ┃     └── prisma.repository.ts # Concrete DB implementation
┃ └── wallet/                    # Wallet microservice (mirrors user structure)
┃     ├── prisma/
┃     └── src/                   # similar with User service
┃         ├── main.ts
┃         ├── wallet.module.ts
┃         ├── wallet.controller.ts
┃         ├── wallet.service.ts
┃         ├── wallet.repository.ts
┃         ├── wallet.interface.ts
┃         ├── user.interface.ts   # User service client contract
┃         ├── wallet.dto.ts
┃         ├── wallet.validator.ts
┃         ├── wallet.constants.ts
┃         ├── prisma.service.ts
┃         └── prisma.repository.ts
┣ proto/
┃ ┣ user.proto                   # UserService gRPC contract
┃ └── wallet.proto               # WalletService gRPC contract
┣ infra/
┃ └── compose.yml                # Docker services for both databases
└── [config files]               # tsconfig, eslint, nest-cli, etc.

Each service is self-contained with its own database, migrations, and Prisma client. There is intentionally no shared `libs/` package — see [Self-Critique](#self-critique) for why.

---

## Architecture

This project applies good software engineering architecture principles within NestJS's opinionated structure. The goal is to keep the core logic free of infrastructure concerns... the database, the transport layer, and external services are all treated as details plugged in from the outside.

### How it maps in practice

**Ports (interfaces)** define what the application needs — they describe the contract without caring about the implementation. Each service has:
- A **repository interface** (e.g. `IUserRepository`) that the service layer depends on, never the concrete Prisma class directly
- A **client interface** (e.g. `IWalletServiceClient`) for cross-service gRPC calls, so the user service can talk to the wallet service through a typed contract, not a hard dependency, making testing easy.

**Adapters (implementations)** are what actually fulfill those contracts:
- `user.repository.ts` / `wallet.repository.ts` are the concrete Prisma adapters wired in via NestJS DI
- `wallet.controller.ts` / `user.controller.ts` are the inbound adapters — they receive gRPC calls and delegate straight to the service layer, doing no business logic themselves

**The service layer** (`user.service.ts`, `wallet.service.ts`) sits in the middle. It only knows about interfaces. Swapping Prisma for another ORM, or gRPC for REST, would not require touching business logic.

---

## Self-Critique

### The shared proto types problem
The most honest structural gap in this project is the duplication of gRPC interface types across services. `wallet.interface.ts` lives inside the user app, and `user.interface.ts` lives inside the wallet app — each defining the other service's client contract independently.

The right solution is a shared `libs/` package:
libs/
└── shared/
├── user.interface.ts
└── wallet.interface.ts

Both apps would then import from `@app/shared` rather than maintaining their own copies. This is straightforward in a Nx or NestJS monorepo setup. I ran into module resolution configuration issues getting this wired up correctly and made the pragmatic call to keep moving — but it is the right next step.

### Other design decisions worth noting

**Two separate databases, not one.**
Each service has its own PostgreSQL instance. This was a deliberate choice: it enforces the bounded context boundary at the data layer. The user service cannot accidentally join against wallet tables. It adds operational overhead but means each service can evolve its schema independently without coordination.

**Repository interfaces over direct Prisma calls.**
The service layer never calls `prisma.user.findUnique()` directly. It calls `this.userRepository.findById()` via an interface. This might look like extra boilerplate for a small project, but it means unit tests can inject a mock repository without any database setup, and the persistence layer is genuinely swappable.

**Idempotency keys on wallet transactions.**
`CreditWallet` and `DebitWallet` both require an `idempotency_key`. This protects against duplicate transactions on retried gRPC calls — a real concern in distributed systems where network failures can cause a client to retry a request that already succeeded.