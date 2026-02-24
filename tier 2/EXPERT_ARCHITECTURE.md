# AgriSphere Tier 2: Technical Architecture & System Design

This document serves as a deep-dive, technical explanation of the AgriSphere Tier 2 architecture. It is intended for software engineers, cloud architects, and domain-expert agronomists reviewing the system design, data integrity mechanisms, and the architectural philosophy behind our AI integration.

---

## 1. System Topology & Orchestration

AgriSphere Tier 2 utilizes a fully decoupled, multi-tenant microservice architecture defined entirely within a single `docker-compose.yml`. This design guarantees environmental idempotency across local development, staging, and production deployments.

*   **Reverse Proxy & Edge Distribution:** 
    We utilize **Nginx** to serve the static, Vite-compiled React frontend. Nginx handles all client-side routing while proxying API requests to the decoupled backend service on port `8000`. This isolates static asset delivery from dynamic application logic, preventing cross-contamination of access logs and optimizing load distribution.
*   **Persistent State Management:** 
    The application layer is entirely stateless. All persistent state—including tenant configurations and time-series telemetry—is offloaded to a robust **PostgreSQL 13** volume.

## 2. The Data Ingestion Pipeline (Edge to Core)

A primary challenge in Agricultural IoT is handling noisy, irregular telemetry from edge devices subject to harsh environmental conditions. Our ingestion pipeline prioritizes strict validation before persistence.

*   **Hardware Interface (The Edge):** 
    The physical edge nodes (e.g., ESP32 microcontrollers) are programmed in C++ to capture 12-bit ADC readings (Soil Moisture, Analog pH) and digital bus data (DHT22 via 1-Wire, I2C peripherals). This raw telemetry is packaged into a flat JSON payload.
*   **API Gateway & Validation (`POST /api/soil-data`):** 
    The core ingestion endpoint is powered by **FastAPI (ASGI)** running on the Uvicorn event loop. FastAPI was specifically chosen over synchronous frameworks (like standard Flask or Django) for its native asynchronous I/O capabilities—ideal for handling high-throughput, concurrent connections typical of IoT sensor arrays.
*   **Strict Schema Enforcement (Pydantic):** 
    Every incoming JSON payload is immediately hydrated into a strict Pydantic model. If an edge node suffers a hardware fault and transmits a string where a `float` is expected, or drops a required `timestamp` key, the request is instantly rejected (`HTTP 422 Unprocessable Entity`) *before* it interacts with the ORM layer. This completely eliminates the risk of database poisoning from failing field hardware.
*   **The ORM Layer (SQLAlchemy):** 
    Once validated, the Pydantic scopes are passed to **SQLAlchemy**, mapping the telemetry to normalized PostgreSQL tables. Strict foreign-key constraints linking telemetry to the `Farmer` schema enforce rigid multi-tenant data isolation at the query level.

## 3. Intelligent Decision Support System (IDSS) Architecture

The most critical architectural decision in Tier 2 is our approach to artificial intelligence. **We explicitly forbid Large Language Models (LLMs) from performing agronomic mathematics.** This design choice eliminates the risk of AI hallucination regarding critical, quantitative farming metrics.

Our IDSS is engineered as a decoupled, **Two-Stage Pipeline:**

### Stage 1: Deterministic Agronomic Heuristics (Local Python Services)
Before any external AI API is invoked, the backend executes local algorithmic models based on established agricultural science:
*   **Crop Suitability Engine (`services/crop_prediction.py`):** 
    This engine retrieves the latest tenant telemetry (e.g., pH 6.2, N=80, K=20) and processes it through a deterministic scoring matrix against hardcoded ideal thresholds for various target crops (e.g., Wheat, Rice, Maize). It outputs a normalized integer viability score.
*   **Fertilizer Optimizer (`services/fertilizer_optimizer.py`):** 
    This module calculates the specific delta between the current soil NPK capacity and the target crop's absolute agronomic requirement, outputting the exact physical deficit in kilograms per hectare.

### Stage 2: Generative Translation Layer (Google Gemini)
Once the deterministic math is finalized, the backend invokes the **Reasoning Engine (`services/reasoning_engine.py`)**.
1.  **Strict Prompt Construction:** The backend dynamically constructs a rigid prompt template. The *pre-calculated math* from Stage 1 is injected as immutable, ground-truth variables into the prompt context.
2.  **LLM Invocation:** We query the `gemini-1.5-pro` (or `2.5-flash-lite`) API via the `google-genai` Python SDK.
3.  **Prompt Engineering Objective:** The system prompt explicitly instructs the LLM *not* to recalculate quantitative values. Instead, it is instructed to act purely as an expert agronomist—translating the hard data into a cohesive, conversational, and actionable summary localized for the farmer.
4.  **Payload Delivery:** The final JSON payload returned to the React client includes both the hard integer scores (for rendering deterministic Recharts graphs) alongside the LLM's localized narrative string.

## 4. Zero-Friction Onboarding & Temporal Data Seeding

To mitigate the "cold start" problem inherent in demonstrating IoT dashboards (where a new account has an empty database), we engineered an automatic temporal data seeding system.

When a new tenant initializes via the `/api/farmer-register` endpoint:
1.  The SQLAlchemy session commits the new user to the `Farmer` table, generating a unique UUID/Integer ID.
2.  A background asynchronous task instantly spins up a temporal data generator (abstracting the logic of `simulate_esp32.py`). This generator mathematically synthesizes 24 hours of pseudo-random, trending telemetry data representing an idealized environmental curve.
3.  This historical data is batch-inserted into PostgreSQL, securely linked to the new `farmer_id`.
4.  **Result:** The moment the user logs into the dashboard, their React Recharts components immediately render rich historical data curves. This instantly demonstrates the platform's visualization capabilities and core value proposition without requiring the user to wait 24 hours for physical field sensors to populate the database.
