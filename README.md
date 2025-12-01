# An (Unofficial) Adaptive ML Support Agent
RAG-enabled ReAct Agent designed to help answer questions related to [Adaptive ML](https://docs.adaptive-ml.com/v0.10/introduction/introduction)

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- An Anthropic API key (model communication)
- An OpenAI API key (for generating embeddings and populating the vector store)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example environment file and add your API key:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your API keys:
   ```
   ANTHROPIC_API_KEY=your_actual_api_key_here
   OPENAI_API_KEY=your_actual_api_key_here
   ```

## Running the Application

### First run:
Populate the vector store
```bash
npm run populateVectorStore

# Alternatively, populate (or repopulate) an individual vector data source
tsx src/scripts/populate-vector-store.ts <source-id> (heml-repo|docker-repo|documentation-website)
```

Start the agent
```bash

npm run dev

# Alternatively, run a CLI-based chat
npm run cli
```

### Build and run:
```bash
npm run build
npm start # or npm run startCLI
```

### Watch mode (auto-rebuild on changes):
```bash
npm run watch
```
