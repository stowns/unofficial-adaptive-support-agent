import 'dotenv/config';
import { getVectorStore } from "../../store/faiss-store.js";
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';

async function load() {
    const helmRepoLoader = new GithubRepoLoader('https://github.com/adaptive-ml/adaptive-helm-chart', {
        branch: "main",
        recursive: false,
        unknown: "warn",
        maxConcurrency: 5
    });

    console.log('Loading helm repo...')
    const helmDocs = await helmRepoLoader.load();
    console.log(`${helmDocs.length} helmDocs loaded`);
    await getVectorStore(helmDocs);
    console.log('Finie');
}

export default {
    id: 'helm-repo',
    load
}