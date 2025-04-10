import fetch from "node-fetch";
import { config } from 'dotenv';
config();

const EXCHANGERATE_API_KEY = process.env.EXCHANGERATE_API_KEY;

export async function convertCurrency(from, to, amount) {
    try {
        if (!EXCHANGERATE_API_KEY) {
            throw new Error('ExchangeRate API key not configured');
        }

        const response = await fetch(
            `https://v6.exchangerate-api.com/v6/${EXCHANGERATE_API_KEY}/pair/${from}/${to}/${amount}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch currency data');
        }

        const data = await response.json();
        
        if (data.result === 'error') {
            throw new Error(data['error-type']);
        }

        // Return data in the format expected by the frontend
        return {
            result: data.conversion_result,
            from: from,
            to: to,
            rate: data.conversion_rate
        };
    } catch (error) {
        console.error('Currency API error:', error);
        return {
            error: `Sorry, I couldn't convert the currency. Error: ${error.message}`
        };
    }
} 