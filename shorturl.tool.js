import fetch from "node-fetch";

// Shorten URLs using TinyURL's free API
export async function shortenURL(url) {
    try {
        // Validate URL
        new URL(url); // This will throw if the URL is invalid
        
        const response = await fetch(
            `https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`
        );
        
        if (!response.ok) {
            throw new Error(`TinyURL API returned ${response.status}`);
        }
        
        const shortUrl = await response.text();
        
        return {
            content: [
                {
                    type: "text",
                    text: `I've shortened your URL: ${shortUrl}`
                }
            ]
        };
    } catch (error) {
        console.error("URL shortener error:", error);
        
        return {
            content: [
                {
                    type: "text",
                    text: `Sorry, I couldn't shorten the URL "${url}". Error: ${error.message}`
                }
            ]
        };
    }
} 