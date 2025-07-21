import { GoogleGenAI } from "@google/genai";

interface SentimentResult {
  positive: number;
  negative: number;
  neutral: number;
  overall: "positive" | "negative" | "neutral";
  score: number;
}

interface CompleteAnalysis {
  captionSentiment: SentimentResult;
  commentsSentiment: SentimentResult;
  processedComments: Array<{
    id: string;
    text: string;
    author: string;
    likes: number;
    timestamp: Date;
    replies: number;
    sentiment: "positive" | "negative" | "neutral";
    isSpam: boolean;
  }>;
  category: string;
}

interface GeminiAnalysisResponse {
  captionSentiment?: {
    positive?: number;
    negative?: number;
    neutral?: number;
    overall?: string;
    score?: number;
  };
  commentsSentiment?: {
    positive?: number;
    negative?: number;
    neutral?: number;
    overall?: string;
    score?: number;
  };
  comments?: Array<{
    index?: number;
    sentiment?: string;
    isSpam?: boolean;
  }>;
  category?: string;
}

interface CommentInput {
  id: string;
  text: string;
  author: string;
  likes: number;
  timestamp: Date;
  replies: number;
}

class GeminiSentimentAnalyzer {
  private client: GoogleGenAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    this.client = new GoogleGenAI({
      apiKey: apiKey,
    });
  }

  async analyzeComplete(
    caption: string,
    comments: CommentInput[]
  ): Promise<CompleteAnalysis> {
    if (!comments || comments.length === 0) {
      const captionSentiment = await this.analyzeTextFallback(caption);
      return {
        captionSentiment,
        commentsSentiment: this.getDefaultSentiment(),
        processedComments: [],
        category: "general",
      };
    }

    try {
      const commentsList = comments
        .map((comment, index) => `${index + 1}. "${comment.text}"`)
        .join("\n");

      const allText = [
        caption,
        ...comments.slice(0, 5).map((c) => c.text),
      ].join(" ");

      const prompt = `
Analyze the following Instagram reel content comprehensively. Provide sentiment analysis for the caption, overall comments sentiment, individual comment analysis, and content categorization.

CAPTION: "${caption}"

COMMENTS (${comments.length} total):
${commentsList}

ALL CONTENT FOR CATEGORIZATION: "${allText}"

Return only valid JSON in this exact format:
{
  "captionSentiment": {
    "positive": <percentage 0-100>,
    "negative": <percentage 0-100>,
    "neutral": <percentage 0-100>,
    "overall": "<positive|negative|neutral>",
    "score": <number between -1 and 1>
  },
  "commentsSentiment": {
    "positive": <percentage 0-100>,
    "negative": <percentage 0-100>,
    "neutral": <percentage 0-100>,
    "overall": "<positive|negative|neutral>",
    "score": <number between -1 and 1>
  },
  "comments": [
    {
      "index": 1,
      "sentiment": "<positive|negative|neutral>",
      "isSpam": <true|false>
    },
    {
      "index": 2,
      "sentiment": "<positive|negative|neutral>",
      "isSpam": <true|false>
    }
  ],
  "category": "<travel|lifestyle|beauty|tech|food|fitness|entertainment|education|business|fashion|art|music|comedy|sports|news|other>"
}

Rules:
- captionSentiment: analyze only the caption text
- commentsSentiment: average sentiment across all comments
- comments: individual analysis for each comment (sentiment + spam detection)
- isSpam: true if comment contains excessive emojis, repetitive text, promotional content, nonsensical text, or bot-like patterns
- category: classify based on all content into one of the specified categories
- Percentages must add up to 100
- Score: positive values (0 to 1) for positive sentiment, negative values (-1 to 0) for negative sentiment, 0 for neutral
- Return analysis for all ${comments.length} comments in order
- Only return the JSON object, no other text
`;

      const response = await this.client.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        throw new Error("Empty response from Gemini");
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("No JSON found in response:", responseText);
        return this.getFallbackAnalysis(caption, comments);
      }

      const result: GeminiAnalysisResponse = JSON.parse(jsonMatch[0]);

      const captionSentiment = this.validateSentimentResult(
        result.captionSentiment
      );
      const commentsSentiment = this.validateSentimentResult(
        result.commentsSentiment
      );

      const processedComments = comments.map((comment, index) => {
        const analysis = result.comments?.find((r) => r.index === index + 1);
        return {
          ...comment,
          sentiment: this.validateSentimentType(analysis?.sentiment),
          isSpam: Boolean(analysis?.isSpam),
        };
      });

      const validCategories = [
        "travel",
        "lifestyle",
        "beauty",
        "tech",
        "food",
        "fitness",
        "entertainment",
        "education",
        "business",
        "fashion",
        "art",
        "music",
        "comedy",
        "sports",
        "news",
        "other",
      ];
      const category = validCategories.includes(result.category || "")
        ? result.category!
        : "general";

      return {
        captionSentiment,
        commentsSentiment,
        processedComments,
        category,
      };
    } catch (error) {
      console.error("Error in complete analysis:", error);
      return this.getFallbackAnalysis(caption, comments);
    }
  }

  private validateSentimentResult(
    sentiment: GeminiAnalysisResponse["captionSentiment"]
  ): SentimentResult {
    return {
      positive: Math.round(
        Math.max(0, Math.min(100, sentiment?.positive || 0))
      ),
      negative: Math.round(
        Math.max(0, Math.min(100, sentiment?.negative || 0))
      ),
      neutral: Math.round(Math.max(0, Math.min(100, sentiment?.neutral || 0))),
      overall: ["positive", "negative", "neutral"].includes(
        sentiment?.overall || ""
      )
        ? (sentiment!.overall as "positive" | "negative" | "neutral")
        : "neutral",
      score: Math.max(-1, Math.min(1, sentiment?.score || 0)),
    };
  }

  private validateSentimentType(
    sentiment: unknown
  ): "positive" | "negative" | "neutral" {
    return ["positive", "negative", "neutral"].includes(sentiment as string)
      ? (sentiment as "positive" | "negative" | "neutral")
      : "neutral";
  }

  private getDefaultSentiment(): SentimentResult {
    return {
      positive: 0,
      negative: 0,
      neutral: 100,
      overall: "neutral",
      score: 0,
    };
  }

  private getFallbackAnalysis(
    _caption: string,
    comments: CommentInput[]
  ): CompleteAnalysis {
    return {
      captionSentiment: this.getDefaultSentiment(),
      commentsSentiment: this.getDefaultSentiment(),
      processedComments: comments.map((comment) => ({
        ...comment,
        sentiment: "neutral" as const,
        isSpam: false,
      })),
      category: "general",
    };
  }

  private async analyzeTextFallback(text: string): Promise<SentimentResult> {
    if (!text || text.trim().length === 0) {
      return this.getDefaultSentiment();
    }

    try {
      const prompt = `
Analyze the sentiment of the following text and return a JSON response:

Text: "${text}"

Return only valid JSON in this exact format:
{
  "positive": <percentage 0-100>,
  "negative": <percentage 0-100>, 
  "neutral": <percentage 0-100>,
  "overall": "<positive|negative|neutral>",
  "score": <number between -1 and 1>
}
`;

      const response = await this.client.models.generateContent({
        model: "gemini-2.5-pro",
        contents: prompt,
      });

      const responseText = response.text?.trim();
      if (!responseText) {
        return this.getDefaultSentiment();
      }

      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.getDefaultSentiment();
      }

      const result = JSON.parse(jsonMatch[0]);
      return this.validateSentimentResult(result);
    } catch (error) {
      console.error("Error analyzing text:", error);
      return this.getDefaultSentiment();
    }
  }

  calculateEngagementRate(
    likes: number,
    comments: number,
    views: number
  ): number {
    if (views === 0) return 0;
    return ((likes + comments) / views) * 100;
  }

  calculateViralityScore(
    views: number,
    likes: number,
    comments: number,
    shares: number,
    postDate: Date
  ): number {
    const daysSincePost =
      (Date.now() - postDate.getTime()) / (1000 * 60 * 60 * 24);
    const engagementScore =
      (likes + comments * 2 + shares * 3) / Math.max(views, 1);
    const timeDecay = Math.max(0.1, 1 / (1 + daysSincePost * 0.1));
    return Math.round(engagementScore * timeDecay * 100);
  }

  generateWordCloud(
    commentTexts: string[]
  ): Array<{ word: string; count: number }> {
    if (!commentTexts || commentTexts.length === 0) return [];

    const text = commentTexts.join(" ").toLowerCase();
    const words = text.match(/\b[a-zA-Z]{3,}\b/g) || [];

    const stopWords = new Set([
      "the",
      "and",
      "for",
      "are",
      "but",
      "not",
      "you",
      "all",
      "can",
      "had",
      "her",
      "was",
      "one",
      "our",
      "out",
      "day",
      "get",
      "use",
      "man",
      "new",
      "now",
      "way",
      "may",
      "say",
      "each",
      "which",
      "their",
      "time",
      "will",
      "about",
      "if",
      "up",
      "out",
      "many",
      "then",
      "them",
      "these",
      "so",
      "some",
      "her",
      "would",
      "make",
      "like",
      "him",
      "has",
      "two",
      "more",
      "very",
      "what",
      "know",
      "just",
      "first",
      "into",
      "over",
      "think",
      "also",
      "your",
      "work",
      "life",
      "only",
      "can",
      "still",
      "should",
      "after",
      "being",
      "now",
      "made",
      "before",
      "here",
      "through",
      "when",
      "where",
      "how",
      "up",
      "out",
      "if",
      "about",
      "who",
      "oil",
      "sit",
    ]);

    const wordCount: Record<string, number> = {};

    words.forEach((word) => {
      if (!stopWords.has(word) && word.length > 2) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    return Object.entries(wordCount)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  async analyzeText(text: string): Promise<SentimentResult> {
    return this.analyzeTextFallback(text);
  }

  async analyzeComments(_commentsTexts: string[]): Promise<SentimentResult> {
    return this.getDefaultSentiment();
  }

  async analyzeBatchComments(comments: Array<CommentInput>): Promise<
    Array<
      CommentInput & {
        sentiment: "positive" | "negative" | "neutral";
        isSpam: boolean;
      }
    >
  > {
    return comments.map((comment) => ({
      ...comment,
      sentiment: "neutral" as const,
      isSpam: false,
    }));
  }

  async predictCategory(
    _caption: string,
    _commentsTexts: string[]
  ): Promise<string> {
    return "general";
  }
}

export default GeminiSentimentAnalyzer;
