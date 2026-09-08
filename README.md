# 🧠 DocuMind

**An AI-powered document knowledge base — upload PDFs, ask questions, get grounded answers.**

DocuMind is a full-stack Retrieval-Augmented Generation (RAG) application built to run at **$0 cost**. It uses local embeddings and a free-tier LLM in production, with zero dependency on paid AI APIs.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-pgvector-336791?logo=postgresql)](https://neon.tech/)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://www.prisma.io/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF)](https://clerk.com/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

**[Live Demo →](#)** *(add your Vercel URL here)*

---

## 📸 Screenshots

*(add screenshots here — dashboard, chat with sources, dark mode toggle)*

```
docs/screenshots/
├── dashboard.png
├── chat.png
└── dark-mode.png
```

---

## ✨ Features

- 🔐 **Authentication** — secure sign-up/sign-in via Clerk, with automatic user & workspace provisioning
- 📄 **PDF upload & processing** — drag-and-drop upload, text extraction, and storage
- 🧩 **Smart chunking** — documents are split into overlapping chunks for better retrieval accuracy
- 🧠 **Local embeddings** — runs `Xenova/all-MiniLM-L6-v2` on-device, no API cost for vectorization
- 🔎 **Semantic search** — pgvector-powered similarity search finds the most relevant content for any question
- 🤖 **Grounded AI answers** — responses are generated only from retrieved document context (no hallucinated answers)
- 💬 **Streaming chat** — token-by-token streaming responses with cited sources
- 🌗 **Light/dark mode** — full theme system with a custom pastel color palette
- 🐳 **Dockerized** — fully containerized for consistent local and production environments
- 💰 **$0 architecture** — every service used has a genuinely free tier; no credit card required anywhere

---

## 🏗️ Architecture

```
                        ┌──────────────┐
                        │    Clerk     │
                        │     Auth     │
                        └──────┬───────┘
                               │
                               ▼
   ┌───────────┐        ┌──────────────┐
   │   User    │───────▶│   Next.js    │
   │ (Browser) │        │  App Router  │
   └───────────┘        └──────┬───────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                 ▼
        ┌───────────┐   ┌────────────┐    ┌─────────────┐
        │ Supabase  │   │  Neon +    │    │  Groq /     │
        │ Storage   │   │  Prisma +  │    │  Ollama     │
        │ (PDFs)    │   │  pgvector  │    │  (LLM)      │
        └───────────┘   └────────────┘    └─────────────┘
```

**Data flow — document ingestion:**
```
PDF Upload → Text Extraction (pdf-parse) → Chunking → Local Embedding
  (MiniLM) → Stored as vectors in pgvector
```

**Data flow — question answering:**
```
User Question → Query Embedding → pgvector Similarity Search →
  Top-K Relevant Chunks → LLM (Groq in production / Ollama in dev) →
  Streamed Answer + Cited Sources
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety across the stack |
| Styling | Tailwind CSS + shadcn/ui | Component system & theming |
| Database | Neon (PostgreSQL) | Primary data store |
| ORM | Prisma 7 | Type-safe database access |
| Vector Search | pgvector | Semantic similarity search |
| Auth | Clerk | User authentication & session management |
| File Storage | Supabase Storage | PDF file storage |
| PDF Parsing | pdf-parse | Text extraction from PDFs |
| Embeddings | Transformers.js (`Xenova/all-MiniLM-L6-v2`) | Local, free, on-device embeddings |
| LLM (dev) | Ollama (`llama3.2`) | Local, free inference for development |
| LLM (prod) | Groq (`openai/gpt-oss-20b`) | Free-tier hosted inference for production |
| Containerization | Docker | Consistent local/production environments |
| Deployment | Vercel | Hosting for the Next.js app |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22+
- A free [Neon](https://neon.tech) PostgreSQL database (with the `vector` extension enabled)
- A free [Clerk](https://clerk.com) application
- A free [Supabase](https://supabase.com) project (Storage bucket)
- A free [Groq](https://console.groq.com) API key (for production LLM)
- [Ollama](https://ollama.com) installed locally (for development LLM) — optional but recommended

### Installation

```bash
# Clone the repo
git clone https://github.com/aviskha23/documind.git
cd documind

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Fill in your keys — see Environment Variables section below
```

### Environment Variables

Create a `.env` file with the following (no quotes around values):

```env
DATABASE_URL=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
OLLAMA_URL=http://localhost:11434
```

### Database setup

```bash
npx prisma migrate dev
```

### Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run with Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=your_url \
  -t documind .

docker run -p 3000:3000 --env-file .env documind
```

---

## 🗺️ Roadmap

- [x] Authentication & workspace management
- [x] PDF upload, storage, and text extraction
- [x] Local embeddings + pgvector semantic search
- [x] Streaming RAG chat with cited sources
- [x] Docker containerization
- [x] Production deployment
- [ ] OCR support for scanned/image-only PDFs
- [ ] Multi-document conversation context
- [ ] Chat history persistence across sessions
- [ ] Team/multi-user workspaces

---

## 🧠 Design Decisions

A few notable engineering choices worth highlighting:

- **Local embeddings over OpenAI**: switched from OpenAI's embedding API to a locally-run MiniLM model to keep the project fully free and remove a hard external dependency for a core feature.
- **pgvector over a dedicated vector DB**: chose to extend the existing Postgres instance with `pgvector` rather than adding Pinecone or a separate vector store — one fewer service to manage, same core capability.
- **Dual LLM strategy**: Ollama for local development (fast iteration, zero cost) and Groq for production (no dependency on a local machine being online, still free-tier).
- **Server-Sent Events for streaming**: chosen over WebSockets since the chat interaction is one-directional (request → streamed response), avoiding the complexity of a persistent bidirectional connection for a use case that doesn't need it.

---

## 📄 License

MIT

---

## 🙋 About

Built as a full-stack learning project to explore RAG architecture, local AI inference, and production deployment — from database design through Docker and live deployment.
