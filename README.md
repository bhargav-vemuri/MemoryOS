# MemoryOS: Digital Memory Reconstruction 🧠

MemoryOS is a local, AI-powered semantic operating system built to reconstruct your fragmented digital life into a searchable, relational, and intelligent memory layer. By ingesting your files, MemoryOS automatically maps concepts, relationships, and context into a deeply connected digital brain.

## 🚀 Core Features

- **Neural Chat (RAG)**: Conversational interface to query your digital brain. MemoryOS retrieves semantically similar context and uses local language models to synthesize accurate answers, complete with source citations.
- **Autonomous Agents**: Intelligent background workers that automatically analyze newly ingested files, extract key concepts using LLMs, and wire them directly into your Neural Graph.
- **Neural Relationship Graph**: Visually navigate the exact connections between your thoughts, files, and isolated concepts powered by Neo4j graph databases.
- **Chronological Reconstruction**: Track the exact timeline of your digital injections, complete with the ability to instantly wipe specific memories from your ecosystem.
- **Automated Digestion**: Upload PDFs, DOCX, TXT, or images, and the asynchronous Celery background workers will chunk, embed, and map the data without locking up your system.
- **Command Center Dashboard**: Live telemetry of your system's semantic depth, neural connections, and newly extracted ideas.

## 🏗️ Architecture Stack

MemoryOS operates on a heavy-duty, decoupled architecture:
* **Frontend**: Next.js (Vanilla JavaScript), Tailwind CSS, Framer Motion, React Flow.
* **Backend API**: Python, FastAPI.
* **Local Intelligence**: Ollama (Phi model) for secure, offline Retrieval-Augmented Generation and Agent processing.
* **Worker Nodes**: Celery, Redis (Message Broker).
* **Databases**:
  * **PostgreSQL**: Canonical storage and file metadata.
  * **ChromaDB**: High-dimensional vector embeddings for semantic similarity.
  * **Neo4j**: Graph database for entity relationship mapping.

---

## 🛠️ How to Run the System

Because MemoryOS utilizes an array of powerful background databases, the backend is entirely orchestrated via Docker. 

You will need **two terminal windows** to launch the system.

### Step 0: Environment Setup
Before running the system, ensure you have your dependencies configured:
1. **Ollama**: MemoryOS relies on local LLMs for processing. Install [Ollama](https://ollama.com/) and pull the `phi` model by running `ollama run phi` in your terminal. Ensure Ollama is running in the background.
2. **Environment Variables**: Copy the example configuration: `cp .env.example .env`
3. Open `.env` and fill in your secure database passwords and secret keys. (The `.env` file is safely ignored by Git).

### Step 1: Ignite the Backend (Docker)
Open your terminal in the root `MemoryOS` directory and run:
```bash
docker compose up -d
```
*Note: This command silently boots PostgreSQL, Neo4j, ChromaDB, Redis, the Python API, and the background workers. It may take a minute to fully initialize.*

### Step 2: Launch the Frontend
Open a **second** terminal window, navigate into the frontend folder, and start the Next.js server:
```bash
cd frontend
npm run dev
```

### Step 3: Access MemoryOS
Open your browser and navigate to:
**👉 http://localhost:3000**

---

## 🧹 System Management & Commands

**Stopping the Backend**
To gracefully shut down all background databases and APIs, run this in the root folder:
```bash
docker compose down
```

**Rebuilding the Backend (After Python Code Changes)**
If you modify the Python API or Worker code, you need to rebuild the Docker images:
```bash
docker compose up --build -d
```

**Wiping Data**
To delete a specific file and purge it from all databases (Vector, Graph, SQL), navigate to the **Timeline** page in the UI and click the Trash icon. 

## ⚠️ Notes
- Ensure Docker Desktop is running before attempting to start the backend.
- The project is written in pure JavaScript on the frontend. Do not attempt to use TypeScript configs unless re-architecting the frontend.
