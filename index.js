import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { defineWord } from "./dictionary.tool.js";
import { shortenURL } from "./shorturl.tool.js";
import { createNote } from "./file.tool.js";
import { calculateExpression, calculateStats } from "./math.tool.js";
import { askGemini, createContent, analyzeText } from "./gemini.tool.js";
import { convertCurrency } from "./currency.tool.js";
import { z } from "zod";
import path from "path";
import { fileURLToPath } from "url";

// Set up __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new McpServer({
    name: "gemini-powered-mcp-server",
    version: "1.0.0"
});

const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Support for traditional MCP client
const transports = {};

// MCP Tools setup
server.tool(
    "addTwoNumbers",
    "Add two numbers",
    {
        a: z.number(),
        b: z.number()
    },
    async (arg) => {
        const { a, b } = arg;
        return {
            content: [
                {
                    type: "text",
                    text: `The sum of ${a} and ${b} is ${a + b}`
                }
            ]
        }
    }
)

// Register dictionary tool
server.tool(
    "defineWord",
    "Get definition of a word", 
    {
        word: z.string().min(1)
    }, 
    async (arg) => {
        const { word } = arg;
        return defineWord(word);
    }
)

// ... existing code ...

// Root route for serving the web interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`\n----- GEMINI-POWERED MCP SERVER -----`);
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`\nAvailable tools via web interface:`);
    console.log(`- Dictionary: Look up word definitions`);
    console.log(`- URL Shortener: Shorten long URLs`);
    console.log(`- Notes: Create markdown notes on the server`);
    console.log(`- Statistics: Calculate statistical values for number sets`);
    console.log(`- Currency: Convert between different currencies`);
    console.log(`- AI Assistant: Powered by Google's Gemini API`);
    console.log(`\nOpen your browser to http://localhost:${PORT} to use the web interface\n`);
});

// This file remains for local development only
// Your existing implementation stays the same
// This file should be the same as your existing pages/index.js
// It's used for local development
// The content is the same as your current pages/index.js file
// ...existing code...
