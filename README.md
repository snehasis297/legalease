# LegalEase – Intelligent Contract Review & Risk Assessment System

> **A Production-Grade LegalTech SaaS Platform featuring Spring Boot 3, React 18, Three.js 3D WebGL, and Enterprise Zero-Knowledge Security Architecture.**

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3.4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📚 Complete Project Documentation & Technical Reports

The repository includes complete technical documentation and architecture blueprints:

- 📖 **[Full Technical Project Documentation Report (PROJECT_DOCUMENTATION.md)](PROJECT_DOCUMENTATION.md)** — Comprehensive 8-section report covering architecture diagrams, cryptography deep-dive, RBAC models, threat heuristics, REST API catalog, and interview guide.
- 🌐 **[Interactive HTML Architecture Report (LegalEase_Project_Documentation.html)](LegalEase_Project_Documentation.html)** — Formatted enterprise presentation report with print styling and metadata.
- 📮 **[Postman API Test Collection (legalease_postman_collection.json)](legalease_postman_collection.json)** — Pre-configured Postman suite covering authentication, document ingestion, and admin workflows.

---

## Architecture Overview

```
+─────────────────────────────────────────────────────────────────────────────+
|                                CLIENT LAYER                                 |
|  React 18 + Vite + Tailwind CSS + Three.js 3D Visualizer + SSE Stream Fetch |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ HTTP / REST & SSE (Port 5173 / 3000)
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                       SECURITY & PERIMETER DEFENSE                          |
|  • JwtFilter: HS512 JWT (Volatile Memory Only)                              |
|  • IP Blacklist Evaluator (Perimeter drop before controller dispatch)       |
|  • Sliding Window Rate Limiter (Redis / Local Memory fallback)              |
|  • Heuristic Threat Interceptor (10 Automated Behavioral Rules)             |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                         APPLICATION SERVICE LAYER                           |
|  • AuthService & AccountSafetyService (Auto-disable & 30-day appeal system) |
|  • DocumentService: Magic-Bytes Validator & AES-256-GCM File Cipher         |
|  • VerificationService: SHA-256 Govt ID Hash & Bar Council Verification     |
|  • AiService: Streaming Clause Extraction + Deterministic Fallback Engine   |
+───────────────────┬─────────────────────────────────────┬───────────────────+
                    │                                     │
                    ▼                                     ▼
+───────────────────────────────────────+   +─────────────────────────────────+
|             STORAGE LAYER             |   |        CACHE & SECURITY         |
|  • MySQL 8 (JPA / Hibernate)          |   |  • Redis 7 (Rate limit counters |
|  • Encrypted File Vault (AES-GCM)     |   |    & blacklisted token store)   |
|  • AES-CBC Sensitive Field Crypt      |   |  • TOTP 2FA Verification Engine |
+───────────────────────────────────────+   +─────────────────────────────────+
```

---

## Key Features

1. **Enterprise Security & Zero Knowledge Architecture**:
   - **File Level Encryption**: Contracts are stored encrypted using **AES-256-GCM** with unique IVs. Original decrypted files exist only in volatile heap memory during inference.
   - **Sensitive Field Encryption**: National identification details are encrypted at rest using **AES-256-CBC**, while duplicate identity fraud is prevented via salted **SHA-256** deterministic hashes.
   - **Volatile Token Storage**: Access tokens are kept strictly in React component memory (never `localStorage` or `sessionStorage`).
   - **10 Automated Threat Detection Rules**: Intercepts credential stuffing, SQL injection attempts, rate-limit flooding, IP session spoofing, and file anomalies.

2. **Dual-Mode AI & Clause Intelligence**:
   - Primary: **Streaming Real-Time Clause Extraction**, risk assessment, redlining recommendations, and interactive Q&A via SSE.
   - Fallback: **Deterministic Legal NLP & Risk Rule Engine** ensuring 100% offline functionality without API keys or paid credits.

3. **Multi-Step Identity & Bar Council Verification**:
   - Email verification with timed OTPs.
   - SMS/WhatsApp phone verification with masked phone display (`****XXXX`).
   - Advocate Bar Council license upload, manual admin audit queue, and verified counsel badges.

4. **Account Safety & 30-Day Tokenized Appeal System**:
   - Automatic account deactivation on critical heuristic threshold violations.
   - Cryptographically signed 30-day appeal links enabling users to submit restorative evidence reviewed by platform administrators.

---

## Default Test Credentials

The database is automatically pre-seeded on startup via `DataInitializer.java`:

| Role | Email Address | Password | Privileges |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@legalease.com` | `Admin@123456` | Full Platform Oversight, Threat Defense, KYC Decisions |
| **Legal Counsel** | `lawyer@legalease.com` | `Lawyer@123456` | Bar Certified, Contract Redlining & Legal Opinions |
| **Standard Client** | `client@legalease.com` | `Client@123456` | Contract Upload, AI Risk Audits, Real-time Chat |

> **Admin Console Passkey**: For direct root administrative terminal elevation, enter passkey `admins72nbh20`.

---

## Getting Started

### Option 1: Docker Compose (All-in-One Stack)

Run the entire stack with MySQL 8, Redis 7, Spring Boot backend, and React frontend in isolated containers:

#### Step 1: Clone the Repository
```bash
git clone https://github.com/snehasis297/legalease.git
cd legalease
```

#### Step 2: Configure Environment Variables
```bash
cp .env.example .env
```

#### Step 3: Build & Launch Containers
```bash
docker compose up --build
```

### Step 4: Access Services

- **Web Frontend**: [http://localhost:3000](http://localhost:3000) (Docker container) or [http://localhost:5173](http://localhost:5173) (Local Vite Dev Server)
- **Spring Boot Backend**: [http://localhost:8080](http://localhost:8080)
- **REST API Endpoints & Health Probe**: [http://localhost:8080/api/public/health](http://localhost:8080/api/public/health)
- **H2 In-Memory Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console) (JDBC URL: `jdbc:h2:mem:legaleasedb` | User: `sa` | Password: `password`)
- **MySQL Database**: `localhost:3306` ( `legalease_user` / `legalease_password` )
- **Redis Cache**: `localhost:6379`

#### To shut down:
```bash
docker compose down -v
```

---

## 7. How to Run Services Individually Without Docker (For Local Development)

Follow this step-by-step guide if you want to run the backend and frontend services directly on your host machine for development or code debugging.

### 7.1 Backend Setup (Spring Boot 3.3.4)

#### Prerequisites
- **Java 17 or Java 21** installed (`java -version`)
- **Maven 3.8+** (Optional: the repository bundles the `mvnw` Maven Wrapper)
- **MySQL 8.0+** running locally on port 3306 (or rely on the embedded in-memory H2 database fallback)

#### Execution Steps:
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. *(Optional)* Configure database credentials in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/legalease?createDatabaseIfNotExist=true&useSSL=false
   spring.datasource.username=legalease_user
   spring.datasource.password=legalease_password
   ```

3. Start the Spring Boot application using the Maven Wrapper:
   - **Linux / macOS**:
     ```bash
     ./mvnw spring-boot:run
     ```
   - **Windows PowerShell / Command Prompt**:
     ```cmd
     mvnw.cmd spring-boot:run
     ```

4. Verify backend readiness by probing the public health endpoint:
   ```bash
   curl http://localhost:8080/api/public/health
   ```
   *Expected Response*: `{"status":"UP","timestamp":"..."}`

---

### 7.2 Frontend Setup (React 18 + Vite)

#### Prerequisites
- **Node.js 18.0+** or **20.0+** installed (`node -v`)
- **npm** package manager (`npm -v`)

#### Execution Steps:
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install all required dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The local dev server will boot in under 500ms and become accessible at:
   👉 **`http://localhost:5173`**

4. To verify production compilation:
   ```bash
   npm run build
   ```
   *Result*: Builds optimized production assets in `dist/` with zero linting or bundle errors.

---

### 7.3 Standalone Database & Cache Setup (Optional)

If running external MySQL and Redis instances locally:
```bash
# Start MySQL 8 container
docker run -d --name legalease-mysql -p 3306:3306 -e MYSQL_DATABASE=legalease -e MYSQL_USER=legalease_user -e MYSQL_PASSWORD=legalease_password -e MYSQL_ROOT_PASSWORD=rootpassword mysql:8.0

# Start Redis container
docker run -d --name legalease-redis -p 6379:6379 redis:7-alpine
```

---

## 10 Automated Threat Detection Heuristics

1. **Excessive Rapid Uploads**: More than 10 documents within 60 seconds triggers a temporary upload lock.
2. **Abnormal File Size Ingestion**: Uploads exceeding standard limits or with mismatched magic-byte headers are dropped.
3. **Multi-Location Concurrent Sessions**: Logins from geographically inconsistent IP ranges trigger account security challenges.
4. **Brute Force Defense**: 5 consecutive failed passwords lock the account for 15 minutes.
5. **SQL Injection & XSS Payload Filtering**: Heuristic inspection of contract titles and notes fields.
6. **Government ID Collision**: Prevents re-registration under duplicate national identification numbers via salted SHA-256 hash checks.
7. **Rate Limit Breaches**: Sliding window evaluation against Redis counters.
8. **Origin IP Blacklist**: Real-time traffic drops for blacklisted CIDR blocks.
9. **Bar License Tampering**: Document verification validation against Bar Council registries.
10. **Token Expiration / Invalidation**: Instantaneous revocation of refresh tokens upon password reset or manual suspension.

---

## Complete REST API Specification

| HTTP Method | Endpoint Path | Authorization | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Client or Lawyer user account |
| `POST` | `/api/auth/login` | Public | Authenticate credentials; issues JWT access & refresh tokens |
| `POST` | `/api/auth/2fa/verify` | Pre-Auth | Validates 6-digit TOTP code for administrative sessions |
| `GET` | `/api/public/health` | Public | Health check and system readiness probe |
| `GET` | `/api/documents` | `ROLE_CLIENT` | Paginated list of uploaded contracts owned by the client |
| `POST` | `/api/documents/upload` | `ROLE_CLIENT` | Multipart upload for PDF/DOCX contracts up to 10MB |
| `GET` | `/api/analysis/{id}` | `ROLE_CLIENT`, `ROLE_LAWYER` | Fetches risk score, clause breakdown, and threat trajectory |
| `GET` | `/api/chat/{id}/history` | `ROLE_CLIENT` | Retrieves contextual conversation history for a document |
| `POST` | `/api/lawyer/kyc/upload-documents` | `ROLE_LAWYER` | Uploads Bar Council certificate & identity proofs |
| `GET` | `/api/lawyer/documents` | `ROLE_LAWYER` | Fetches assigned documents awaiting legal redlining |
| `PUT` | `/api/lawyer/documents/{id}/notes` | `ROLE_LAWYER` | Submits expert attorney notes and clause recommendations |
| `GET` | `/api/admin/users` | `ROLE_ADMIN` | Lists all user accounts with status filters and search |
| `GET` | `/api/admin/verification-queue` | `ROLE_ADMIN` | Lists pending advocate Bar Council applications |
| `POST` | `/api/admin/verify/{id}/approve` | `ROLE_ADMIN` | Approves lawyer KYC application, granting review rights |
| `GET` | `/api/admin/audit-logs` | `ROLE_ADMIN` | Chronological security and data modification audit trail |

---

## API Testing with Postman

1. Open Postman.
2. Click **Import** -> Select `legalease_postman_collection.json`.
3. Set the `baseUrl` variable to `http://localhost:8080/api`.
4. Run `1. Authentication & Security` -> `Login (Client / Lawyer)` or `Admin Login`.
5. The `jwtToken` variable is automatically captured and assigned to subsequent requests.

---

## License & Compliance

This software is distributed under the **MIT License**. Built for enterprise legal workflows and zero-retention regulatory compliance (GDPR and HIPAA aligned).
