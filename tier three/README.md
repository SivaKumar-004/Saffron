# AgriSphere: Intelligent IoT Farm Management Platform

AgriSphere is a secure, multi-tenant IoT (Internet of Things) and AI-driven platform designed to ingest raw hardware telemetry from agricultural fields, permanently store it, and use deterministic mathematical models paired with Generative AI to provide actionable farming insights.

## System Architecture

The AgriSphere platform utilizes an **N-Tier Microservice Architecture**. It is divided into three distinct codebases orchestrated via Docker Compose, ensuring a reproducible, production-ready environment that runs identically on any machine without complex local setup.

### 1. The Data Layer (Storage & Hardware Simulation)
*   **Database Engine:** PostgreSQL 13
*   **Purpose:** A robust relational SQL database used to permanently store structured, time-series telemetry data (temperature, moisture, EC, lux, etc.) to ensure strict data integrity.
*   **Hardware Simulation:** A standalone Python script (`simulate_esp32.py`) acts as the "C++ Firmware," generating fluctuating, realistic floats for 12 distinct hardware sensors (DHT22, DS18B20, BH1750) and posting them over HTTP to the backend, mimicking a physical ESP32 LoRa Node.

### 2. The Backend Layer (APIs & Core Logic)
*   **Core Technology:** Python 3.9
*   **Framework:** FastAPI running on Uvicorn (ASGI web server)
*   **Purpose:** Acts as the secure middleman. It receives raw HTTP POST payloads from the hardware, strictly validates the incoming JSON against Pydantic schemas to prevent database corruption, and uses SQLAlchemy (ORM) to write the data to PostgreSQL. 
*   **Decision Support System (DSS):** The backend orchestrates local, deterministic mathematical models (Crop Suitability Heuristics & NPK Fertilizer Optimization Equations) to process the raw telemetry before interacting with the frontend or external LLMs.

### 3. The Frontend Layer (User Interface)
*   **Core Technology:** React.js compiled via Vite
*   **Hosting:** Nginx Web Server
*   **Purpose:** A responsive, interactive dashboard featuring Glassmorphism design principles. It consumes the backend REST APIs to authenticate farmers, map their historical data to `recharts` SVG line graphs, and display 12 real-time hardware metrics using a unified, clean UI.

---

## Detailed Execution Flow (End-to-End)

This section details exactly how data flows from the physical environment to the user's screen.

### Phase 1: Infrastructure Initialization (`docker-compose up -d`)
1.  **agrisphere-db**: Docker spins up a PostgreSQL container on port `5432` with a persistent volume to ensure data durability.
2.  **agrisphere-backend**: Docker builds the Python backend, installs dependencies, and launches `uvicorn main:app` on port `8000`. SQLAlchemy immediately connects to PostgreSQL and verifies table schemas.
3.  **agrisphere-frontend**: A multi-stage Docker build uses Node.js to compile the React JSX into minified static assets, then injects those files into a blazing-fast Nginx container hosted on port `80`.

### Phase 2: Hardware Telemetry Ingestion
1.  **Payload Generation**: The ESP32 node (or `simulate_esp32.py` simulator) reads serial data from 12 analog/digital sensors and constructs a structured JSON payload.
2.  **Transmission & Validation**: The hardware sends an HTTP POST request to `http://<server-node>:8000/api/soil-data`. FastAPI intercepts the request and forces the JSON through a Pydantic schema validator.
3.  **Persistence**: If validation passes, SQLAlchemy maps the object to a SQL `INSERT INTO` command, persistently writing the row to PostgreSQL development storage.

### Phase 3: Client-Side Rendering (The Dashboard)
1.  **Authentication**: The user navigates to `http://localhost`, hits the Nginx server, and receives the React application. They log in via `/api/login` and receive a unique `farmer_id`.
2.  **Data Hydration**: React executes `GET /api/soil-data?farmer_id=X`. The backend pulls the last 20 rows of telemetry from PostgreSQL and returns a JSON array.
3.  **UI Construction**: React parses the array, dynamically rendering the customized Recharts historical graphs and live Glassmorphism sensor widgets (mapping data like `latestData.potassium` and `latestData.soil_ec` directly to the DOM).

### Phase 4: Intelligent Decision Support System (The AI Orchestrator)
When the user clicks "Generate DSS Insight", the platform bridges local deterministic math with external Generative AI.

1.  **Initialization**: React calls the master endpoint (`GET /api/dss-insight`). The Python backend queries PostgreSQL for the absolute latest row of telemetry for that specific node.
2.  **Local Deterministic Models**: 
    *   *Crop Prediction:* Current telemetry is passed through a local heuristic model to score crop viability against hardcoded agronomic thresholds.
    *   *Fertilizer Optimization:* Current NPK levels are mathematically subtracted from the target crop's ideal NPK thresholds to calculate exact milligram deficits.
3.  **External LLM Integration**: The backend constructs a rigid, highly structured prompt injecting the *pre-calculated math* from the local models. It uses the `google-genai` SDK to securely query the **Google Gemini API** (`gemini-1.5-pro`).
4.  **Generative Reasoning**: Gemini acts purely as a Natural Language generation engine, translating the hard math into an actionable, farmer-friendly summary string. This architecture prevents AI hallucination regarding core mathematical values.
5.  **Delivery**: The backend bundles the generative string, the crop scores, and the fertilizer calculations into a final JSON response, allowing React to render the ultimate actionable insights panel.

---

## API Reference Guide

The platform consists of 9 internal microservice endpoints and 1 external AI dependency.

### Internal APIs (FastAPI)

**1. Real-Time Telemetry Ingestion**
*   `POST /api/soil-data`: The secure ingestion point for the ESP32 hardware to push JSON sensor data to the database.

**2. Dashboard Data Retrieval**
*   `GET /api/soil-data?farmer_id=X`: Fetches historical time-series data for the React charts and widgets.
*   `GET /api/disaster-alerts?farmer_id=X`: Analyzes the latest metrics for immediate threats (e.g., freezing temps, drought) and triggers UI banners.

**3. Intelligent Decision Support System (IDSS)**
*   `GET /api/predict-crop?farmer_id=X`: Executes local mathematical crop suitability heuristics.
*   `GET /api/recommend-fertilizer?farmer_id=X&crop_name=Y`: Computes exact local NPK fertilizer deficits.
*   `GET /api/dss-insight?farmer_id=X`: The master orchestrator that combines local math algorithms and queries the external Gemini API for natural language formatting.

**4. User Authentication & Onboarding**
*   `POST /api/farmer-login`: Authenticates users and enforces multi-tenant data isolation.
*   `POST /api/farmer-register`: Creates new accounts and immediately simulates 24 hours of mock ESP32 hardware data into PostgreSQL for instant dashboard population.

**5. System Operations**
*   `GET /api/health`: An uptime ping endpoint utilized by Docker health checks.

### External APIs
*   **Google Gemini API (`gemini-1.5-pro`)**: The singular external dependency. Used strictly by the IDSS orchestrator endpoint to perform Generative AI natural language translation upon pre-calculated local agronomic math.

---

*This README was constructed to detail the robust, decoupled, and production-ready architecture of the AgriSphere hackathon platform.*
