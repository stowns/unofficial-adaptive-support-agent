import 'dotenv/config';
import { getVectorStore } from "../../store/faiss-store.js";
import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github';

async function load() {
    const dockerRepoLoader = new GithubRepoLoader('https://github.com/adaptive-ml/adaptive-docker', {
        branch: "main",
        recursive: false,
        unknown: "warn",
        maxConcurrency: 5
    });

    console.log('Loading docker repo...')
    const dockerDocs = await dockerRepoLoader.load();
    console.log(`${dockerDocs.length} dockerDocs loaded`);
    await getVectorStore(dockerDocs);
    console.log('Finie');
}

export default {
    id: 'docker-repo',
    load
}