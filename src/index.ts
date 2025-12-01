import 'dotenv/config';
import * as z from "zod";
import { createAgent, ReactAgent, tool } from "langchain";
import { hasher } from 'node-object-hash';
import { ChatAnthropic } from '@langchain/anthropic';
import { getVectorStore } from './store/faiss-store.js';
import readline from 'readline';
import { createServer } from 'http';
import { Socket } from 'socket.io';
import { Server } from "socket.io";

/* for agents */
const SONNET = new ChatAnthropic({
    modelName: 'claude-sonnet-4-5-20250929'
});

/* fasted, cheapests, most basic */
const HAIKU = new ChatAnthropic({
    modelName: 'claude-haiku-4-5-20251001'
});
/* deep reasoning */
const OPUS = new ChatAnthropic({
    modelName: 'claude-opus-4-1-20250805'
});

const adaptiveDocsSchema = z.object({
    query: z.string().describe("Text used for performing a similarity search against Adaptive Engine documentation")
});

const adaptiveDocs = tool(
    async ({ query }: z.infer<typeof adaptiveDocsSchema>) => {
        const adaptiveVectorStore = await getVectorStore();
        const results = await adaptiveVectorStore.similaritySearch(query, 10)
        return {
            content: [{ type: 'text', text: JSON.stringify(results) }],
            structuredContent: results
        };
    },
    {
        name: "adaptive_documentation",
        description: "For a given query, returns relevant documentation about the Adaptive Engine. Useful for root cause analysis",
        schema: adaptiveDocsSchema,
    }
);

const conversationHistory: Array<{ role: string; content: any }> = [];

async function cliChat(agent: ReactAgent) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'You: '
    });

    console.log('Chat with Adaptive Agent (type "exit" to quit)\n');
    rl.prompt();

    rl.on('line', async (input) => {
        const userInput = input.trim();

        if (userInput.toLowerCase() === 'exit') {
            console.log('Goodbye!');
            rl.close();
            process.exit(0);
        }

        if (!userInput) {
            rl.prompt();
            return;
        }

        // Add user message to history
        conversationHistory.push({ role: 'user', content: userInput });

        try {
            // Invoke agent with full conversation history
            const response = await agent.invoke({
                messages: conversationHistory
            });

            const agentMessage = response.messages[response.messages.length - 1];
            const agentContent = agentMessage.content;

            // Add agent response to history
            conversationHistory.push({ role: 'assistant', content: agentContent });

            console.log(`\nAgent: ${agentContent}\n`);
        } catch (error) {
            console.error('Error:', error);
        }

        rl.prompt();
    });

    rl.on('close', () => {
        process.exit(0);
    });
}

function socketIO(agent: ReactAgent) {
    const server = createServer();
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173"]
        }
    });
    io.on('connection', (socket: Socket) => {
        const conversationHistory: Array<{ role: string; content: any }> = [];

        socket.on('message', async (data: string) => {
            console.log(data);
            conversationHistory.push({ role: 'user', content: data });
            try {
                // Invoke agent with full conversation history
                const response = await agent.invoke({
                    messages: conversationHistory
                });

                const agentMessage = response.messages[response.messages.length - 1];
                const agentContent = agentMessage.content;

                // Add agent response to history
                conversationHistory.push({ role: 'assistant', content: agentContent });

                console.log('sending response')
                console.log(agentContent)
                socket.send(agentContent);
            } catch (error) {
                console.error('Error:', error);
                socket.emit('error', 'something went wrong.')
            }
        });
    
    });

    server.listen(3000);
    console.log(`Socket.io server listening on port 3000`);
}

async function main() {

    // Note: Requires an ANTHROPIC_API_KEY environment variable be set
    const agent = createAgent({
        model: SONNET,
        tools: [adaptiveDocs],
        systemPrompt: 'You are assisting and on-call engineer with root-cause analysis of a customer incident.'
    });


    const mode = process.argv[2];

    if (mode === 'cli') {
        cliChat(agent);
    } else {
        socketIO(agent);
    }
}

main().catch(console.error);
