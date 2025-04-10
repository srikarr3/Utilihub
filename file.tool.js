import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid"; // You'll need to npm install uuid

// Create a directory to store generated files
const NOTES_DIR = path.join(process.cwd(), "generated_notes");
if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
}

// Tool to create a markdown note file on the server
export async function createNote(params) {
    try {
        const { title, content } = params;
        
        // Validate input
        if (!title || !content) {
            throw new Error("Both title and content are required");
        }
        
        // Generate a filename based on title and a unique ID
        const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${uuidv4().slice(0, 8)}.md`;
        const filepath = path.join(NOTES_DIR, filename);
        
        // Format the markdown content
        const formattedContent = `# ${title}\n\n${content}\n\nCreated: ${new Date().toISOString()}`;
        
        // Write to file
        fs.writeFileSync(filepath, formattedContent, "utf8");
        
        return {
            content: [
                {
                    type: "text",
                    text: `Note created successfully!\nTitle: ${title}\nFilename: ${filename}\nLocation: ${filepath}`
                }
            ]
        };
    } catch (error) {
        console.error("Note creation error:", error);
        
        return {
            content: [
                {
                    type: "text",
                    text: `Sorry, I couldn't create the note. Error: ${error.message}`
                }
            ]
        };
    }
} 