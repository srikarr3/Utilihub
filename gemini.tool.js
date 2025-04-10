import { config } from 'dotenv';
import fetch from 'node-fetch';
config();

// Configuration for Gemini API
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

/**
 * Tool to interact with Gemini API for text generation
 * 
 * @param {Object} params - Parameters for the Gemini API
 * @param {string} params.prompt - The prompt to send to Gemini
 * @param {number} [params.maxTokens=1024] - Max tokens to generate
 * @param {number} [params.temperature=0.7] - Temperature for generation
 * @returns {Promise<Object>} - Response from Gemini API
 */
export async function askGemini(params) {
    try {
        const { prompt, maxTokens = 1024, temperature = 0.7 } = params;
        
        // Validate input
        if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
            throw new Error('A valid prompt is required');
        }
        
        if (!GEMINI_API_KEY) {
            throw new Error('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file');
        }
        
        // Prepare the request body
        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ],
            generationConfig: {
                maxOutputTokens: maxTokens,
                temperature: temperature
            }
        };
        
        // Make the API request
        const response = await fetch(
            `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extract the generated text from the response
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        
        return {
            content: [
                {
                    type: "text",
                    text: generatedText
                }
            ]
        };
    } catch (error) {
        console.error('Gemini API error:', error);
        
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error.message}`
                }
            ]
        };
    }
}

/**
 * Tool to interact with Gemini API for creative writing
 * 
 * @param {Object} params - Parameters for the creative writing task
 * @param {string} params.topic - The topic or title for writing
 * @param {string} params.type - Type of content (story, poem, essay, etc.)
 * @param {string} [params.style] - Optional writing style 
 * @returns {Promise<Object>} - Generated creative content
 */
export async function createContent(params) {
    try {
        const { topic, type, style = 'default' } = params;
        
        if (!topic || !type) {
            throw new Error('Both topic and type are required');
        }
        
        // Create a structured prompt for the creative task
        const prompt = `Create a ${style !== 'default' ? style + ' ' : ''}${type} about ${topic}. 
        Be creative, engaging, and original. Format the text nicely.`;
        
        // Reuse the askGemini function with our creative prompt
        const result = await askGemini({ 
            prompt, 
            temperature: 0.9, // Higher temperature for more creativity
            maxTokens: 2048 // Allow longer responses for creative content
        });
        
        return result;
    } catch (error) {
        console.error('Creative content generation error:', error);
        
        return {
            content: [
                {
                    type: "text",
                    text: `Error generating creative content: ${error.message}`
                }
            ]
        };
    }
}

/**
 * Tool to analyze text using Gemini's capabilities
 * 
 * @param {Object} params - Parameters for the text analysis
 * @param {string} params.text - The text to analyze
 * @param {string} params.analysisType - Type of analysis (sentiment, summary, keywords, etc.)
 * @returns {Promise<Object>} - Analysis results
 */
export async function analyzeText(params) {
    try {
        const { text, analysisType } = params;
        
        if (!text || !analysisType) {
            throw new Error('Both text and analysisType are required');
        }
        
        // Create a prompt based on the analysis type
        let prompt;
        switch (analysisType.toLowerCase()) {
            case 'sentiment':
                prompt = `Analyze the sentiment of the following text. Provide a detailed breakdown of the emotional tone, positivity/negativity, and key emotional indicators:\n\n${text}`;
                break;
            case 'summary':
                prompt = `Provide a concise summary of the following text in 3-5 sentences:\n\n${text}`;
                break;
            case 'keywords':
                prompt = `Extract the 5-7 most important keywords or phrases from the following text, and explain why each is significant:\n\n${text}`;
                break;
            default:
                prompt = `Analyze the following text, focusing on ${analysisType}:\n\n${text}`;
        }
        
        // Call Gemini with the analysis prompt
        const result = await askGemini({ 
            prompt, 
            temperature: 0.3 // Lower temperature for more factual analysis
        });
        
        return result;
    } catch (error) {
        console.error('Text analysis error:', error);
        
        return {
            content: [
                {
                    type: "text",
                    text: `Error analyzing text: ${error.message}`
                }
            ]
        };
    }
} 