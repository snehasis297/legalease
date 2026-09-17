# LegalEase – Intelligent Contract Review & Risk Assessment System

> **A Production-Grade LegalTech SaaS Platform featuring Spring Boot 3, React 18, Anthropic Claude 3.5 Sonnet Dual-Mode AI, and Enterprise Zero-Knowledge Security Architecture.**

---

## Architecture Overview

```
+─────────────────────────────────────────────────────────────────────────────+
|                                CLIENT LAYER                                 |
|  React 18 + Vite + Tailwind CSS + Three.js 3D Visualizer + SSE Stream Fetch |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │ HTTP / REST & SSE (Port 80 / 3000)
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
|  • AiService: Claude 3.5 Sonnet Streaming + Deterministic Fallback Engine   |
+───────────────────┬─────────────────────────────────────┬───────────────────+
                    │                                     │
                    ▼                                     ▼
+───────────────────────────────────────+   +─────────────────────────────────+
|             STORAGE LAYER             |   |        CACHE & SECURITY         |
|  • MySQL 8 (JPA / Hibernate)          |   |  • Redis 7 (Rate limit counters |
|  • Encrypted File Vault (AES-GCM)     |   |    & blacklisted token store)   |
|  • AES-CBC Sensitive Field Crypt      |   |  • TOTP SAM-Stevens Engine      |
+───────────────────────────────────────+   +─────────────────────────────────+
```

---

## Key Features

1. **Enterprise Security & Zero Knowledge Architecture**:
   - **File Level Encryption**: Contracts are stored encrypted using **AES-256-GCM** with unique IVs. Original decrypted files exist only in volatile heap memory during inference.
   - **Sensitive Field Encryption**: National identification details are encrypted at rest using **AES-256-CBC**, while duplicate identity fraud is prevented via salted **SHA-256** deterministic hashes.
   - **Volatile Token Storage**: Access tokens are kept strictly in React component memory (never `localStorage` or `sessionStorage`).
   - **10 Automated Threat Detection Rules**: Intercepts credential stuffing, SQL injection attempts, rate-limit flooding, IP session spoofing, and file anomalies.

2. **Dual-Mode AI Engine**:
   - Primary: **Anthropic Claude 3.5 Sonnet** streaming real-time clause extraction, risk assessment, redlining recommendations, and interactive Q&A via SSE.
   - Fallback: **Deterministic Legal NLP & Risk Rule Engine** ensuring 100% offline functionality without API keys or paid credits.

3. **Multi-Step Identity & Bar Verification**:
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

---

## Getting Started

### Option 1: Docker Compose (Recommended)

Run the entire stack with MySQL 8, Redis 7, Spring Boot backend, and React frontend:

```bash
# Clone the repository
git clone <YOUR_REPO_URL>
cd legalease

# Start all services
docker compose up --build
```

Access the applications:
- **Frontend Web UI**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:8080/api`
- **MySQL Database**: `localhost:3306` (user: `legalease_user` / pass: `legalease_password`)
- **Redis Cache**: `localhost:6379`

---

### Option 2: Local Development Setup

#### Prerequisites
- **Java 17+** (JDK 17 or JDK 21 recommended)
- **Node.js 18+** & **npm**
- **MySQL 8.0+**
- **Redis 7.0+** (Optional: backend includes in-memory fallback for local standalone testing)

#### 1. Backend Setup (Spring Tool Suite / IntelliJ / Terminal)
```bash
cd backend

# Configure your database credentials in src/main/resources/application.properties:
# spring.datasource.url=jdbc:mysql://localhost:3306/legalease?createDatabaseIfNotExist=true
# spring.datasource.username=root
# spring.datasource.password=rootpassword

# Run with Maven Wrapper
./mvnw spring-boot:run
```

#### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
The frontend is available at `http://localhost:5173`.

---

## 10 Automated Threat Detection Heuristics

1. **Excessive Rapid Uploads**: More than 10 documents within 60 seconds triggers a temporary upload lock.
2. **Abnormal File Size Ingestion**: Uploads exceeding standard limits or with mismatched magic-byte headers are dropped.
3. **Multi-Location Concurrent Sessions**: Logins from geographically inconsistent IP ranges trigger account security challenges.
4. **Brute Force Defense**: 5 consecutive failed passwords lock the account for 30 minutes.
5. **SQL Injection & XSS Payload Filtering**: Heuristic inspection of contract titles and notes fields.
6. **Government ID Collision**: Prevents re-registration under duplicate national identification numbers via salted SHA-256 hash checks.
7. **Rate Limit Breaches**: Sliding window evaluation against Redis counters.
8. **Origin IP Blacklist**: Real-time traffic drops for blacklisted CIDR blocks.
9. **Bar License Tampering**: OCR document verification validation against Bar Council registries.
10. **Token Expiration / Invalidation**: Instantaneous revocation of refresh tokens upon password reset or manual suspension.

---

## API Testing with Postman

1. Open Postman.
2. Click **Import** -> Select `legalease_postman_collection.json`.
3. Set the `baseUrl` variable to `http://localhost:8080/api`.
4. Run `1. Authentication & Security` -> `Login (Client / Lawyer)` or `Admin Login`.
5. The `jwtToken` variable is automatically captured and assigned to subsequent requests.

---

## License & Compliance
This software is distributed under the MIT License. Built for enterprise legal workflows and zero-retention regulatory compliance (GDPR / HIPAA aligned).
