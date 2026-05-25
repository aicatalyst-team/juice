# PoC Plan: Juice

## Project Classification
- **Type:** llm-app
- **Key Technologies:** TypeScript, Node.js, Model Context Protocol (MCP), SQLite (better-sqlite3), Zod
- **ODH Relevance:** Juice is an AI agent memory layer that implements the Model Context Protocol (MCP). It provides a constraint-storage service that AI agents (including those orchestrated on OpenShift AI) can connect to for durable avoidance guidance. Deploying Juice on ODH/OpenShift AI demonstrates how MCP-based agent infrastructure components can be containerized and operated alongside ML model serving and pipeline workloads.

## PoC Objectives
What we want to prove:
1. The Juice MCP server can be built as a container image from its TypeScript source and run in HTTP mode on OpenShift
2. The HTTP API correctly serves the manifest (categories, scopes, trigger hints)
3. Categories can be listed and new custom categories can be registered
4. Negative constraints can be saved via the HTTP API with proper scoping and categorization
5. Constraints can be recalled by trigger matching, returning only relevant constraints

## Infrastructure Requirements
- **Inference Server:** none — Juice is a standalone MCP/HTTP server, not a model server
- **Vector Database:** none — Juice uses SQLite for storage with trigger-based keyword matching, not vector similarity
- **Embedding Model:** none
- **GPU Required:** no
- **Persistent Storage:** 256Mi PVC for the SQLite database file (`juice.db`), mounted at `/data`
- **Resource Profile:** small (256Mi RAM, 250m CPU) — this is a lightweight Node.js server with SQLite
- **Sidecar Containers:** none

## Test Scenarios

### Scenario 1: Health Check / Manifest
- **Description:** Verify the Juice HTTP server is running and the manifest endpoint returns the expected structure
- **Type:** http (GET)
- **Input:** `GET /api/manifest`
- **Expected:** Returns 200 OK with JSON containing `categories` (array with at least `general`, `design`, `writing`), `trigger_hints`, and `scopes` fields
- **Timeout:** 30 seconds

### Scenario 2: List Categories
- **Description:** Retrieve the default category registry to confirm the database was initialized properly
- **Type:** http (GET)
- **Input:** `GET /api/categories`
- **Expected:** Returns 200 OK with JSON array containing default categories: `general`, `design`, `writing`
- **Timeout:** 15 seconds

### Scenario 3: Register Category
- **Description:** Register a new custom category to test write operations
- **Type:** http (POST)
- **Input:** `POST /api/categories` with body `{"name": "security", "trigger_hints": ["auth", "tokens", "secrets"]}`
- **Expected:** Returns 200/201 confirming the `security` category was registered
- **Timeout:** 15 seconds

### Scenario 4: Save Constraint
- **Description:** Save a negative constraint via the HTTP API
- **Type:** http (POST)
- **Input:** `POST /api/constraints` with body `{"statement": "Avoid storing API keys in plain text configuration files", "scope": "global", "category": "general", "triggers": ["api-key", "secrets", "config"], "confidence": 0.9, "strength": 0.8}`
- **Expected:** Returns 200/201 with the saved constraint including an `id`
- **Timeout:** 15 seconds

### Scenario 5: Recall Constraints
- **Description:** Recall constraints matching specific triggers to verify the core retrieval functionality
- **Type:** http (GET)
- **Input:** `GET /api/recall?triggers=api-key,config`
- **Expected:** Returns 200 OK with a JSON array containing the previously saved constraint about API keys
- **Timeout:** 15 seconds

## Dockerfile Considerations

This is a **TypeScript/Node.js application** that compiles to JavaScript and runs as an HTTP server.

**Build stage:**
- Use a multi-stage build: `node:20-alpine` for build, `node:20-alpine` for runtime
- In the build stage: `npm ci` to install all dependencies (including devDependencies), then `npm run build` (runs `tsc`) to compile TypeScript to `dist/`
- In the runtime stage: copy `package.json` and `package-lock.json`, run `npm ci --omit=dev` to install only production dependencies, then copy the `dist/` directory from the build stage
- `better-sqlite3` is a native module — it needs to be built during `npm ci`. On Alpine, ensure `python3`, `make`, and `g++` are available during the build stage (or use `node:20-slim` instead of `alpine` to simplify native module compilation)

**Runtime:**
- `ENTRYPOINT ["node", "dist/cli.js"]` with `CMD ["http"]` — this starts the HTTP server mode
- The app listens on port **8080** (detected from intake analysis) — add `EXPOSE 8080`
- Set `ENV JUICE_DB=/data/juice.db` so the SQLite database is written to the PVC mount point
- Create the `/data` directory in the Dockerfile and ensure the non-root user can write to it

**Important notes:**
- Do NOT use `tsx` in production — it's a dev dependency for running TypeScript directly. The compiled JS in `dist/` should be used.
- The `public/` directory may be needed if the web UI (`src/web.ts`, 72KB) serves static assets — copy it into the runtime image.

## Deployment Considerations

**Deployment model:** Deploy as a **Kubernetes Deployment** with 1 replica. This is a long-running HTTP server.

**Service:** Create a **Service** on port 8080 pointing to the container's port 8080. The Juice HTTP server listens on this port.

**Persistent Volume:** Mount a 256Mi PVC at `/data` for SQLite database persistence. The environment variable `JUICE_DB=/data/juice.db` directs the app to store its database there.

**Environment variables:**
- `JUICE_DB=/data/juice.db` — path to the SQLite database file

**No LLM API needed:** Juice itself does not call any external LLM APIs. It is a storage/retrieval layer that AI agents connect to. No API keys are required.

**Testing:** Use HTTP-based tests against the Service endpoint. All five test scenarios are HTTP GET or POST requests. Run them sequentially (register category → save constraint → recall constraint) to test the full workflow.

**Readiness/Liveness probes:** Use `GET /api/manifest` as the readiness probe endpoint — when the manifest returns successfully, the server is ready to accept requests.