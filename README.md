# Ubayog CivicConnect: Distributed Infrastructure Operations Platform

![CivicConnect Architecture](https://img.shields.io/badge/Platform-MERN%20+Vite-2E7D32.svg)
![AI Backend](https://img.shields.io/badge/Intelligence-Anthropic_Claude-8A2BE2.svg)
![Mapping](https://img.shields.io/badge/Geospatial-Leaflet_OSM-blue.svg)

CivicConnect is an enterprise-grade, geographic anomaly resolution product developed by Ubayog. It acts as a digital bridge between citizen reporting nodes and physical municipal maintenance crews, drastically accelerating the response time required to resolve infrastructural fractures like potholes, broken street lights, and sanitation violations.

## 🚀 Key Platform Integrations

1. **DeepVerify Intelligence Pipeline:** Leverages Anthropic's Claude 3 LLM models to autonomously process incoming infrastructure tickets, classify anomaly types, and mathematically score the geographic priority of the defect to organize immediate field action.
2. **Reverse Geospatial Tracking:** Integrates native browser GPS coordinates (latitude/longitude) to interactively map user-generated reports onto an OpenStreetMap UI grid using standard `react-leaflet` libraries. 
3. **MERN Asymmetric Ecosystem:** Segregated React/Vite web application interacting with a highly secured, rate-limited Node/Express backend that saves payloads utilizing a NoSQL MongoDB instance.

## 📁 System Architecture

```text
ubayog-civicConnect/
│
├── client/                     # Local Citizen Node & Admin Executive Dashboard (React + Vite)
│   ├── src/components/         # Reusable structural widgets (Navigation, Maps)
│   ├── src/pages/              # Encapsulated Routing endpoints
│   ├── src/context/            # JSON Web Token State Management Context
│   └── src/index.css           # Global PostCSS Tailwind Design Tokens
│
├── server/                     # Backend Data Broker & Auth Gateway
│   ├── controllers/            # Controller Logic for Auth, Admin, Issues
│   ├── middleware/             # Security Chains (Rate-Limit, JWT Verification)
│   ├── models/                 # Mongoose Data Abstraction Logic
│   └── app.js                  # Master Express Endpoint
```

## 🛠️ Local Development Boot Sequence

### 1. Environmental Credentials Config
Before triggering the server, copy `.env.example` and place a localized `.env` hidden file in both the `/server` and `/client` roots.

```bash
cd server
cp .env.example .env
```
Ensure you have access to a local MongoDB process running on `mongodb://localhost:27017`.

### 2. Initialize Backend Dependencies
```bash
cd server
npm install
npm run dev
```

### 3. Initialize Frontend Client Node
```bash
cd client
npm install
npm run dev -- --force
```

Navigate to `http://localhost:5173` to access the front-end rendering engine.

## 🔐 Core Security Measures Activated
- **HTTP-Only Token Passing:** Auth keys are never stored dynamically in `localStorage`. Cross-Site Scripting (XSS) is minimized by storing keys via hardened HTTP-only cookies securely handled through backend authentication layers.
- **REST Helmet Configuration:** Native implementation of raw express-helmet to defend against Cross-Site Request Forgery (CSRF). 
- **Volumetric Rate Limiting:** All API hooks are mathematically capped at thousands of requests per hour via `express-rate-limit` to prevent basic DDoS brute-forcing.

## 👥 Ubayog Operations Contacts
For administrative configurations pertaining to the Anthropic Logic routing system or manual Mongoose timeline manipulations, contact your overarching Ubayog Engineering Director.

---
*Developed under standard engineering best practices for the exclusive deployment workflow of Ubayog Incorporated.*
