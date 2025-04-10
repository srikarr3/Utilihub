# UtiliHub

Your All-in-One Digital Swiss Army Knife. Access real-time weather updates, currency conversions, global news, and smart tools like URL shortening and text analysis—all in one elegant interface. Powered by AI and designed for efficiency.

## Features

- Weather Information: Get real-time weather data for any city
- Currency Conversion: Live currency rates and conversion
- News Updates: Access curated news by country and category
- URL Shortener: Create and manage shortened URLs
- Dictionary: Quick word definitions and meanings
- Math Tools: Perform statistical calculations
- Text Analysis: AI-powered text analysis and insights

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd utilihub
```

2. Install dependencies:
```bash
cd server
npm install
```

3. Create a `.env` file in the `server` directory with the following variables:
```
OPENWEATHER_API_KEY=your_openweather_api_key
EXCHANGERATE_API_KEY=your_exchangerate_api_key
NEWS_API