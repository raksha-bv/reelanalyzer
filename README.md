# Instagram Reel Analytics API

A comprehensive Next.js API for analyzing Instagram Reels with sentiment analysis, engagement metrics, and strategic insights powered by AI.

## Features

- **Multi-Source Scraping**: Uses Apify and fallback scrapers for reliable data extraction
- **AI-Powered Analysis**: Leverages Google Gemini for sentiment analysis and strategic insights
- **Comprehensive Metrics**: Engagement rates, virality scores, and performance analytics
- **Strategic Insights**: Content optimization recommendations and audience analysis
- **Caching System**: MongoDB caching with configurable refresh intervals
- **Spam Detection**: AI-powered comment spam filtering
- **Word Cloud Generation**: Automatic keyword extraction from comments

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Database**: MongoDB with Mongoose
- **AI/ML**: Google Gemini API
- **Scraping**: Apify, Cheerio, Axios
- **Validation**: Zod
- **Testing**: Jest

## Installation

1. Clone the repository:
```bash
git clone https://github.com/raksha-bv/reelanalyzer.git
cd reelanalyzer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/instagram_analytics

# API Keys
GEMINI_API_KEY=your_gemini_api_key
APIFY_API_KEY=your_apify_api_key
RAPIDAPI_KEY=your_rapidapi_key

# Optional
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### POST /api/analyze

Analyzes an Instagram Reel and returns comprehensive analytics data.

**Request Body:**
```json
{
  "url": "https://www.instagram.com/reel/ABC123/",
  "forceRefresh": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reelId": "ABC123",
    "username": "example_user",
    "caption": "Check out this amazing content!",
    "viewCount": 10000,
    "likesCount": 1500,
    "commentsCount": 200,
    "engagementRate": 17.5,
    "viralityScore": 85,
    "captionSentiment": {
      "positive": 80,
      "negative": 5,
      "neutral": 15,
      "overall": "positive",
      "score": 0.75
    },
    "commentsSentiment": {
      "positive": 65,
      "negative": 15,
      "neutral": 20,
      "overall": "positive",
      "score": 0.5
    },
    "strategicInsights": {
      "contentStrategy": {
        "strengths": ["High engagement rate", "Positive audience response"],
        "weaknesses": ["Limited hashtag usage"],
        "opportunities": ["Cross-platform promotion", "Influencer collaboration"],
        "recommendations": ["Post during peak hours", "Use trending hashtags"]
      },
      "audienceInsights": {
        "engagementPatterns": "High engagement in evening hours",
        "commentQuality": "Authentic and positive interactions",
        "audienceReaction": "Enthusiastic and supportive"
      },
      "performanceAnalysis": {
        "viralPotential": "high",
        "reasonsForPerformance": ["Trending audio", "Relatable content"],
        "benchmarkComparison": "Above average for lifestyle category"
      }
    }
  }
}
```

## Key Components

### InstagramScraper (`lib/scraper.ts`)
- Multi-source scraping with fallback mechanisms
- Supports Apify, RapidAPI, and basic scraping methods
- Extracts comprehensive reel data including metadata, engagement metrics, and comments

### GeminiSentimentAnalyzer (`lib/sentiment.ts`)
- AI-powered sentiment analysis using Google Gemini
- Generates strategic insights and content recommendations
- Processes comments for spam detection and sentiment classification
- Calculates engagement rates and virality scores

### API Route (`app/api/analyze/route.ts`)
- Main endpoint handling reel analysis requests
- Implements caching with MongoDB
- Combines scraping and AI analysis in optimized workflow
- Returns comprehensive analytics data

## Testing

Run the test suite using Jest:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

Test files are located in the `__tests__/` directory and cover:
- API endpoint functionality
- Data validation
- Error handling
- Response formatting

## Configuration

### Cache Settings
- Default cache duration: 1 hour
- Use `forceRefresh: true` to bypass cache
- Automatic cleanup of stale data

### Rate Limiting
- Built-in rate limiting for external APIs
- Intelligent fallback between scraping methods
- Exponential backoff for failed requests

## Error Handling

The API includes comprehensive error handling for:
- Invalid Instagram URLs
- Scraping failures
- AI analysis errors
- Database connection issues
- Rate limiting scenarios


## Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review test files for usage examples
