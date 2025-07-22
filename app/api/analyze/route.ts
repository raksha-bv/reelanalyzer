import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reel from "@/models/Reels";
import InstagramScraper from "@/lib/scraper";
import GeminiSentimentAnalyzer from "@/lib/sentiment";
import { z } from "zod";
import StrategicInsights from "@/lib/sentiment";

// Define proper types instead of using 'any'
interface ScrapedReelData {
  reelId: string;
  username: string;
  userProfilePic: string;
  userFollowers?: number;
  userFollowing?: number;
  userPostsCount?: number;
  caption: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  duration: number;
  postDate: Date;
  thumbnailUrl: string;
  comments: Array<{
    id: string;
    text: string;
    author: string;
    likes: number;
    timestamp: Date;
    replies: number;
  }>;
}

interface AnalysisData {
  captionSentiment: {
    positive: number;
    negative: number;
    neutral: number;
    overall: string;
    score: number;
  };
  commentsSentiment: {
    positive: number;
    negative: number;
    neutral: number;
    overall: string;
    score: number;
  };
  processedComments: Array<{
    id: string;
    text: string;
    author: string;
    likes: number;
    timestamp: Date;
    replies: number;
    sentiment: string;
    isSpam: boolean;
  }>;
  category: string;
}

// Validation schema
const analyzeSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (url) => url.includes("instagram.com/reel/"),
      "Must be a valid Instagram Reel URL"
    ),
  forceRefresh: z.boolean().optional().default(false),
});

interface AnalyzeResponse {
  success: boolean;
  data?: ScrapedReelData &
    AnalysisData & {
      profileAnalysis?: {
        influencerTier: string;
        accountHealth: {
          followRatio: number;
          postsToFollowersRatio: number;
          avgEngagementRate: number;
        };
        strategicInsights?: StrategicInsights;
        contentStrategy: {
          isBusinessAccount: boolean;
          isVerified: boolean;
          hasExternalLink: boolean;
          usesStories: boolean;
          usesIGTV: boolean;
          postingFrequency: string;
          contentCategories: string[];
        };
        reelPerformance: {
          viewToFollowerRatio: number;
          likeToFollowerRatio: number;
          commentToFollowerRatio: number;
        };
      };
      engagementRate: number;
      hashtags: Array<{ tag: string; count: number }>;
      topComments: Array<{
        text: string;
        author: string;
        likes: number;
        sentiment: string;
      }>;
      spamCommentsCount: number;
      wordCloud: Array<{ word: string; count: number }>;
      viralityScore: number;
      overallSentiment: {
        positive: number;
        negative: number;
        neutral: number;
        overall: string;
        score: number;
      };
    };
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<AnalyzeResponse>> {
  try {
    const body = await request.json();
    const { url, forceRefresh } = analyzeSchema.parse(body);
    console.log("Parsed request body:", { url, forceRefresh });

    await connectDB();

    // Check if reel already exists and is recent (unless force refresh)
    if (!forceRefresh) {
      const existingReel = await Reel.findOne({ url });
      if (existingReel) {
        const hoursSinceUpdate =
          (Date.now() - existingReel.lastUpdated.getTime()) / (1000 * 60 * 60);

        if (hoursSinceUpdate < 1) {
          console.log(
            "Returning cached data - last updated:",
            existingReel.lastUpdated
          );
          return NextResponse.json({
            success: true,
            data: existingReel,
          });
        }
      }
    }

    console.log("Proceeding with fresh scraping...");

    const scraper = new InstagramScraper();
    const analyzer = new GeminiSentimentAnalyzer();

    const scrapedData = await scraper.scrapeReel(url);
    const profileAnalysis = analyzeProfileFromReelData(scrapedData);

    // SINGLE API CALL - combines sentiment analysis and strategic insights
    console.log("Starting comprehensive analysis with single API call...");
    const analysisResult = await analyzer.analyzeCompleteWithInsights(
      scrapedData,
      scrapedData.caption,
      scrapedData.comments
    );
    console.log("Complete analysis finished");

    // Extract results from single analysis
    const { strategicInsights, ...restAnalysis } = analysisResult;

    // Create basic profile analysis from reel data
    function analyzeProfileFromReelData(reel: ScrapedReelData) {
      const followersCount = reel.userFollowers || 0;
      const followingCount = reel.userFollowing || 0;
      const postsCount = reel.userPostsCount || 0;

      const followerTiers = {
        micro: followersCount < 10000,
        macro: followersCount >= 10000 && followersCount < 100000,
        mega: followersCount >= 100000 && followersCount < 1000000,
        celebrity: followersCount >= 1000000,
      };

      type TierKey = keyof typeof followerTiers;
      const influencerTier =
        (Object.keys(followerTiers).find(
          (key) => followerTiers[key as TierKey]
        ) as TierKey) || "celebrity";

      const accountHealth = {
        followRatio: followingCount > 0 ? followersCount / followingCount : 0,
        postsToFollowersRatio:
          followersCount > 0 ? postsCount / followersCount : 0,
        avgEngagementRate: 0, // Will be calculated below
      };

      const contentStrategy = {
        isBusinessAccount: false, // Not available from reel data
        isVerified: false, // Not available from reel data
        hasExternalLink: false, // Not available from reel data
        usesStories: false, // Not available from reel data
        usesIGTV: false, // Not available from reel data
        postingFrequency: "Unknown", // Not available from reel data
        contentCategories: [] as string[], // Will be determined from analysis
      };

      const reelPerformance = {
        viewToFollowerRatio:
          followersCount > 0 ? reel.viewCount / followersCount : 0,
        likeToFollowerRatio:
          followersCount > 0 ? reel.likesCount / followersCount : 0,
        commentToFollowerRatio:
          followersCount > 0 ? reel.commentsCount / followersCount : 0,
      };

      return {
        influencerTier,
        accountHealth,
        contentStrategy,
        reelPerformance,
      };
    }

    // const profileAnalysis = analyzeProfileFromReelData(scrapedData);

    // // Single API call for comprehensive analysis
    // console.log("Starting comprehensive analysis with single API call...");
    // const analysisResult = await analyzer.analyzeComplete(
    //   scrapedData.caption,
    //   scrapedData.comments
    // );
    // console.log("Complete analysis finished");

    // Extract results from single analysis
    const captionSentiment = analysisResult.captionSentiment;
    const commentsSentiment = analysisResult.commentsSentiment;
    const processedComments = analysisResult.processedComments;
    const category = analysisResult.category;

    // Extract hashtags from caption (local processing)
    const hashtags = extractHashtags(scrapedData.caption);

    // Calculate metrics (local processing)
    const engagementRate = analyzer.calculateEngagementRate(
      scrapedData.likesCount,
      scrapedData.commentsCount,
      scrapedData.viewCount
    );

    const viralityScore = analyzer.calculateViralityScore(
      scrapedData.viewCount,
      scrapedData.likesCount,
      scrapedData.commentsCount,
      scrapedData.sharesCount,
      scrapedData.postDate
    );

    // Generate word cloud (local processing)
    const commentTexts = scrapedData.comments.map((c) => c.text);
    const wordCloud = analyzer.generateWordCloud(commentTexts);

    // Calculate overall sentiment (local processing)
    const overallSentiment = {
      positive: Math.round(
        (captionSentiment.positive + commentsSentiment.positive) / 2
      ),
      negative: Math.round(
        (captionSentiment.negative + commentsSentiment.negative) / 2
      ),
      neutral: Math.round(
        (captionSentiment.neutral + commentsSentiment.neutral) / 2
      ),
      overall:
        captionSentiment.score + commentsSentiment.score > 0
          ? ("positive" as const)
          : captionSentiment.score + commentsSentiment.score < 0
          ? ("negative" as const)
          : ("neutral" as const),
      score: (captionSentiment.score + commentsSentiment.score) / 2,
    };

    // Get top comments (sorted by likes)
    const topComments = processedComments
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 10);

    // Count spam comments
    const spamCommentsCount = processedComments.filter((c) => c.isSpam).length;

    // Update profile analysis with calculated engagement rate
    profileAnalysis.accountHealth.avgEngagementRate = engagementRate;
    profileAnalysis.contentStrategy.contentCategories = [category];

    // Prepare final data
    console.log("Generating strategic insights...");
    console.log(strategicInsights);
    // const strategicInsights = await analyzer.generateStrategicInsights(
    //   scrapedData,
    //   analysisResult
    // );
    console.log("Strategic insights generated");
    const finalData = {
      ...scrapedData,
      profileAnalysis: {
        ...profileAnalysis,
        strategicInsights, // Make sure this is included at the profile level too
      },
      ...restAnalysis,
      engagementRate,
      viralityScore,
      hashtags,
      topComments,
      spamCommentsCount,
      wordCloud,
      strategicInsights, // This should be at the root level for frontend access
      lastUpdated: new Date(),
      contentStrategy: strategicInsights?.contentStrategy || {
        strengths: ["High engagement rate", "Positive audience response"],
        opportunities: ["Optimize posting timing", "Increase content variety"],
      },
      audienceInsights: strategicInsights?.audienceInsights || {
        demographics: { "18-24": 30, "25-34": 40, "35-44": 20, "45+": 10 },
        engagementPatterns: [
          "High engagement in evenings",
          "Peak activity on weekends",
        ],
      },
      performanceAnalysis: strategicInsights?.performanceAnalysis,
      overallSentiment,
    };
    console.log(
      "Final data being saved:",
      JSON.stringify(
        {
          strategicInsights: finalData.strategicInsights,
          contentStrategy: finalData.contentStrategy,
          audienceInsights: finalData.audienceInsights,
        },
        null,
        2
      )
    );

    const savedReel = await Reel.findOneAndUpdate({ url }, finalData, {
      upsert: true,
      new: true,
    });
    console.log("Saved reel strategicInsights:", savedReel.strategicInsights);

    console.log("About to return data with strategicInsights:");
    console.log(
      "savedReel.strategicInsights:",
      JSON.stringify(savedReel.strategicInsights, null, 2)
    );
    console.log(
      "Full response data keys:",
      Object.keys(savedReel.toObject ? savedReel.toObject() : savedReel)
    );

    // Check if it's a Mongoose document and convert properly
    const responseData = savedReel.toObject ? savedReel.toObject() : savedReel;
    console.log(
      "Response data strategicInsights:",
      responseData.strategicInsights
    );

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error: unknown) {
    console.error("Analysis error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze reel";

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

function extractHashtags(text: string): Array<{ tag: string; count: number }> {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const matches = text.match(hashtagRegex) || [];

  const hashtagCounts: Record<string, number> = {};
  matches.forEach((tag) => {
    const cleanTag = tag.toLowerCase();
    hashtagCounts[cleanTag] = (hashtagCounts[cleanTag] || 0) + 1;
  });

  return Object.entries(hashtagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
