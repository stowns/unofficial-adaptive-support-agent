import { OpenAIEmbeddings } from "@langchain/openai";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { join } from 'path';
import { dirname } from "path";
import { fileURLToPath } from "url";
import { Document } from "langchain";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DATA_DIR = join(__dirname, 'data');
export const EMBEDDINGS = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
});

export async function getVectorStore(documents?: Document<Record<string, any>>[]) {
  let vectorStore: FaissStore;
  try {
    vectorStore = await FaissStore.load(
      DATA_DIR,
      EMBEDDINGS
    );
    if (documents) {
      vectorStore.addDocuments(documents);
      saveVectorStore(vectorStore);
    }
  } catch {
    if (!documents) {
      throw Error('The vectorstore has not been previously initialized and no `documents` were provided')
    } else {
      vectorStore = await FaissStore.fromDocuments(documents, EMBEDDINGS);
      saveVectorStore(vectorStore);
    }
  }

  return vectorStore;
}

export async function saveVectorStore(store: FaissStore) {
  await store.save(DATA_DIR);
}
