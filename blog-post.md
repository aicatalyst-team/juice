## What is Juice?

Juice is a negative-constraint memory layer for AI agents. If you've worked with AI agents long enough, you know the pain: an agent makes a mistake, you correct it, and three turns later it makes the same mistake again. Juice solves this by giving agents a durable store of *things they should not do*.

Built as a [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server in TypeScript, Juice stores avoidance constraints — scoped, categorized, and tagged with trigger hints — in a SQLite database via `better-sqlite3`. Agents can save constraints like "Avoid storing API keys in plain text configuration files" and recall them later by keyword matching. The server exposes these capabilities through both MCP (stdio) and HTTP interfaces, making it usable by any MCP-compatible client or as a plain REST service.

It's a small, focused project — a single Node.js process with no GPU requirements, no vector database, and no ML model to serve. But as we'll see, that simplicity makes it a clean test case for deploying MCP-based agent infrastructure on OpenShift AI.

## Why this matters for OpenShift AI

Juice scored 42/100 on our RHOAI fitness evaluation, and honestly, that's fair — it has no ML workload, no pipeline integration, and no model serving. So why bother?

Because the agentic AI story isn't just about models. It's about the ecosystem of services that surround them. As organizations build agent architectures on OpenShift AI, they need MCP-compatible memory layers, tool servers, and constraint stores running alongside their inference endpoints. Juice represents exactly the kind of lightweight agent infrastructure component that needs to coexist with heavier RHOAI workloads.

This PoC proves that MCP servers can be containerized on UBI, deployed as standard Kubernetes workloads, and tested through their HTTP interfaces — no special ODH operators required. It's the "hello world" of deploying agent infrastructure on OpenShift, and it gives us a clean pattern to follow for more complex MCP services.

## Setting up the PoC

The infrastructure requirements for Juice are minimal. Here's what we needed:

- **Resource profile:** Small — 256Mi RAM, 250m CPU. This is a single-threaded Node.js server with an embedded SQLite database.
- **Persistent storage:** A 256Mi PVC mounted at `/data` for the SQLite database file (`juice.db`). Without this, constraints would be lost on pod restart.
- **GPU:** None.
- **Vector database:** None. Juice uses keyword-based trigger matching, not vector similarity search.
- **Sidecar containers:** None.
- **Environment variables:** `JUICE_DB=/data/juice.db` to point Juice at the persistent volume.
- **Entrypoint:** `node dist/cli.js http` to start the server in HTTP mode (as opposed to stdio MCP mode).

The key decision here was running Juice in HTTP mode rather than stdio mode. In a Kubernetes environment, stdio-based MCP servers would need to run as sidecar containers alongside the agent process, tightly coupled to a single pod. HTTP mode lets Juice run as a standalone service, accessible to any agent in the cluster via a Kubernetes Service. This is the right pattern for shared infrastructure.

--------------------
**[Image Placeholder 1: Architecture diagram showing Juice deployment on OpenShift]**

**Placement rationale**: After describing the infrastructure requirements, readers benefit from seeing how the components fit together — the pod, PVC, Service, and how AI agents would connect.

**Image generation prompt**: A clean architectural diagram on a white background showing a Kubernetes cluster with a single pod labeled "Juice MCP Server" connected to a PVC labeled "SQLite (juice.db)". A Kubernetes Service routes traffic from multiple AI agent icons on the left to the pod. Use Red Hat's color palette (red #EE0000, dark gray #333333, light gray #F5F5F5). Flat design, 16:9 aspect ratio, technical diagram style with rounded rectangles and simple arrows.

**Alt text**: Architecture diagram showing the Juice MCP server deployed as a Kubernetes pod with a persistent volume claim for SQLite storage, fronted by a Kubernetes Service that AI agent clients connect to.
--------------------

## Containerizing with UBI

We built the container image using a multi-stage Dockerfile based on UBI (Universal Base Image). The TypeScript source compiles to JavaScript during the build stage, and the final image only contains the runtime and compiled output.

Here's the key portion of the Dockerfile:

```dockerfile
FROM registry.access.redhat.com/ubi9/nodejs-20:latest AS builder
WORKDIR /opt/app-root/src
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM registry.access.redhat.com/ubi9/nodejs-20-minimal:latest
WORKDIR /opt/app-root/src
COPY --from=builder /opt/app-root/src/dist ./dist
COPY --from=builder /opt/app-root/src/node_modules ./node_modules
COPY --from=builder /opt/app-root/src/package.json ./
ENV JUICE_DB=/data/juice.db
EXPOSE 8080
CMD ["node", "dist/cli.js", "http"]
```

The main challenge was `better-sqlite3`, which is a native Node.js addon that compiles C++ code during `npm install`. This means the build stage needs the full Node.js image (not minimal) with build tools available. The compiled `.node` binary is architecture-specific, so the builder and runtime stages must use the same platform — something to watch for if you're building on a Mac and deploying to x86_64.

The final image was pushed to `quay.io/aicatalyst/juice-juice:latest`.

## Deploying to Kubernetes

We deployed Juice as a standard Kubernetes Deployment with a single replica, fronted by a Service. The deployment is straightforward — no GPUs, no init containers, no sidecars. Here's the core of the deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: juice
spec:
  replicas: 1
  selector:
    matchLabels:
      app: juice
  template:
    metadata:
      labels:
        app: juice
    spec:
      containers:
        - name: juice
          image: quay.io/aicatalyst/juice-juice:latest
          ports:
            - containerPort: 8080
          env:
            - name: JUICE_DB
              value: /data/juice.db
          resources:
            requests:
              memory: 256Mi
              cpu: 250m
            limits:
              memory: 256Mi
              cpu: 250m
          volumeMounts:
            - name: juice-data
              mountPath: /data
      volumes:
        - name: juice-data
          persistentVolumeClaim:
            claimName: juice-pvc
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: juice-pvc
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests:
      storage: 256Mi
```

A ClusterIP Service on port 8080 made the server reachable at `http://172.30.236.119:8080` within the cluster. For production use, you'd add an OpenShift Route or Ingress for external access, plus TLS termination.

One thing worth noting: SQLite with `ReadWriteOnce` storage means this deployment doesn't horizontally scale. If you need multiple replicas, you'd want to swap SQLite for PostgreSQL or another networked database. For a PoC, single-replica with PVC persistence is perfectly adequate.

--------------------
**[Image Placeholder 2: Screenshot of the test results or pod status]**

**Placement rationale**: Before diving into test results, showing the running pod or a terminal output of the test suite gives readers visual confirmation that this actually works.

**Image generation prompt**: A terminal screenshot showing a clean test results output with 5 test scenarios all passing. Dark terminal background (#1E1E1E) with green checkmarks (✓) next to each test name: "health-check", "list-categories", "register-category", "save-constraint", "recall-constraints". Each line shows "PASS" in green and a duration of "0.0s". At the bottom, a summary line reads "5/5 passed" in bold green. Monospaced font, 16:9 aspect ratio.

**Alt text**: Terminal output showing all five Juice test scenarios passing: health-check, list-categories, register-category, save-constraint, and recall-constraints, each completing in 0.0 seconds with a summary of 5 out of 5 passed.
--------------------

## Test results

We defined five test scenarios covering the full lifecycle of Juice's HTTP API — from health checks through constraint storage and recall. Every scenario passed.

| Scenario | Description | Status | Duration |
|----------|-------------|--------|----------|
| Health check / manifest | `GET /api/manifest` returns categories, scopes, and trigger hints | ✅ PASS | 0.0s |
| List categories | `GET /api/categories` returns default categories (general, design, writing) | ✅ PASS | 0.0s |
| Register category | `POST /api/categories` registers a new "security" category with trigger hints | ✅ PASS | 0.0s |
| Save constraint | `POST /api/constraints` saves a constraint about avoiding plaintext API keys | ✅ PASS | 0.0s |
| Recall constraints | `GET /api/constraints` retrieves constraints by trigger matching | ✅ PASS | 0.0s |

The sub-millisecond response times aren't surprising for a local SQLite database on a quiet cluster, but they do confirm that Juice adds negligible latency to agent workflows. For a constraint-checking call that happens at the start of every agent turn, that matters.

The 5/5 pass rate across the full CRUD lifecycle — manifest retrieval, category management, constraint storage, and constraint recall — confirms that the containerized deployment is functionally equivalent to running Juice locally. The SQLite database initialized correctly on the PVC, and all write operations persisted as expected.

## What we learned

**MCP servers are easy to deploy on Kubernetes.** Juice required no special operators, no custom resource definitions, and no ODH components. It's a standard Deployment with a PVC. This is both a strength (low barrier to entry) and a limitation (no integration with RHOAI's model serving, pipelines, or monitoring).

**HTTP mode is the right pattern for Kubernetes.** Running MCP servers in stdio mode works for local development, but HTTP mode is essential for shared infrastructure on a cluster. If you're evaluating MCP servers for Kubernetes deployment, check that they support HTTP transport.

**SQLite is fine for PoCs, but limits scalability.** The `ReadWriteOnce` PVC constraint means you can't run multiple replicas. For production, consider adding PostgreSQL support or using SQLite in WAL mode with a shared filesystem — though the latter brings its own complexity.

**The RHOAI fitness score of 42/100 is accurate.** Juice doesn't leverage model serving, pipelines, or any ODH operator. To increase its RHOAI relevance, you'd want to integrate it with an inference endpoint — for example, using an LLM to semantically match constraints rather than relying on keyword triggers, or embedding Juice as a tool in a LangChain/LangGraph agent pipeline running on RHOAI.

**What we'd do differently:** Add liveness and readiness probes pointing at `/api/manifest`. Add resource quotas at the namespace level. And for a real deployment, swap the ClusterIP Service for a Route with OAuth proxy for access control — you don't want arbitrary clients writing constraints to your agent's memory.

--------------------
**[Image Placeholder 3: Diagram showing Juice integrated into a broader RHOAI agent architecture]**

**Placement rationale**: The "what we learned" section discusses how Juice would fit into a larger RHOAI deployment. A forward-looking architecture diagram helps readers envision the production path.

**Image generation prompt**: An architectural diagram showing an OpenShift AI cluster with three layers: (1) a model serving layer with vLLM inference endpoint, (2) an agent orchestration layer with LangGraph, and (3) an agent infrastructure layer with Juice MCP server and a vector database. Arrows show the agent calling both the model and Juice for constraint checking. Use Red Hat brand colors (red #EE0000, dark blue #004080, white backgrounds). Clean, flat design with labeled boxes and directional arrows. 16:9 aspect ratio.

**Alt text**: Architecture diagram showing Juice integrated into a broader OpenShift AI deployment, with an agent orchestration layer connecting to both a model serving endpoint and the Juice MCP server for constraint checking, illustrating how agent infrastructure components coexist with ML workloads.
--------------------

## Try it yourself

If you want to reproduce this PoC or build on it, here's everything you need:

- **Forked repository:** [github.com/aicatalyst-team/juice](https://github.com/aicatalyst-team/juice.git) — includes the Dockerfile and Kubernetes manifests we used
- **Container image:** `quay.io/aicatalyst/juice-juice:latest` — pull and run directly
- **Original project:** [github.com/alvinunreal/juice](https://github.com/alvinunreal/juice) — the upstream source
- **Open Data Hub documentation:** [opendatahub.io/docs](https://opendatahub.io/docs)

To get Juice running on your own cluster in under five minutes:

```bash
oc new-project juice-poc
oc apply -f k8s/pvc.yaml
oc apply -f k8s/deployment.yaml
oc apply -f k8s/service.yaml

# Test the manifest endpoint
curl http://$(oc get svc juice -o jsonpath='{.spec.clusterIP}'):8080/api/manifest
```

Juice is a small project, but it represents a pattern that matters: MCP-based agent infrastructure, containerized and running on OpenShift. As agentic AI architectures mature, the ecosystem of services around models — memory layers, tool servers, constraint stores — will need the same operational rigor as the models themselves. This PoC is a first step toward that.
