import fetch from "node-fetch";

// Get word definitions using the free Dictionary API
export async function defineWord(word) {
    try {
        const response = await fetch(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
        );
        
        if (!response.ok) {
            throw new Error(`Dictionary API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error("No definition found");
        }
        
        const entry = data[0];
        let definitionText = `Definitions for "${entry.word}":\n\n`;
        
        // Process each meaning
        entry.meanings.forEach((meaning, i) => {
            definitionText += `${i+1}. Part of speech: ${meaning.partOfSpeech}\n`;
            
            // Include definitions
            meaning.definitions.forEach((def, j) => {
                definitionText += `   ${j+1}. ${def.definition}\n`;
                
                // Add example if available
                if (def.example) {
                    definitionText += `      Example: "${def.example}"\n`;
                }
            });
            
            // Add synonyms if available
            if (meaning.synonyms && meaning.synonyms.length > 0) {
                definitionText += `   Synonyms: ${meaning.synonyms.slice(0, 5).join(", ")}\n`;
            }
            
            definitionText += "\n";
        });
        
        return {
            content: [
                {
                    type: "text",
                    text: definitionText
                }
            ]
        };
    } catch (error) {
        console.error("Dictionary API error:", error);
        
        return {
            content: [
                {
                    type: "text",
                    text: `Sorry, I couldn't find the definition for "${word}". Error: ${error.message}`
                }
            ]
        };
    }
} 