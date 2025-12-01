import 'dotenv/config';
import { getVectorStore } from "../../store/faiss-store.js";
import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url"
import { compile } from "html-to-text";

async function load() {
  const compiledConvert = compile({ wordwrap: 130 });
  const documentationLoader = new RecursiveUrlLoader("https://docs.adaptive-ml.com/v0.10/introduction/introduction", {
    extractor: compiledConvert,
    maxDepth: 10
  });

  console.log('Loading docs.adaptive-ml.com...');
  const documentationDocs = await documentationLoader.load();
  console.log(`${documentationDocs.length} docs.adaptive-ml.com loaded`);
  await getVectorStore(documentationDocs);
  console.log('Finie');
}

export default {
  id: 'documentation-website',
  load
}