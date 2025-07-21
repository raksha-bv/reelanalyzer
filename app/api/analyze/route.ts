import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reel from "@/models/Reels";
import InstagramScraper from "@/lib/scraper";
import GeminiSentimentAnalyzer from "@/lib/sentiment"; // Updated import
import { z } from "zod";

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
  data?: {
    reel: any;
    profile: any;
    analysis: any;
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
          // Return cached data if updated within last hour
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

    // Initialize scraper and analyzer
    const scraper = new InstagramScraper();
    const analyzer = new GeminiSentimentAnalyzer();

    console.log("Starting scraping process...");
    const scrapedResult = await scraper.scrapeReel(url);
    // Add this after: const scrapedResult = await scraper.scrapeReel(url);
    console.log("=== SCRAPING RESULTS ===");
    console.log("Reel data keys:", Object.keys(scrapedResult.reel));
    console.log("Profile data keys:", Object.keys(scrapedResult.profile));
    console.log("Profile followers:", scrapedResult.profile.followersCount);
    console.log("Profile verified:", scrapedResult.profile.verified);
    const scrapedData = scrapedResult.reel;
    const profileData = scrapedResult.profile;

    console.log("Scraped reel data:", JSON.stringify(scrapedData, null, 2));
    console.log("Scraped profile data:", JSON.stringify(profileData, null, 2));
    console.log("Number of comments scraped:", scrapedData.comments.length);

    // Add profile analysis after existing analysis
    const profileAnalysis = analyzeProfileData(profileData, scrapedData);

    // 🚀 SINGLE API CALL - This replaces ALL previous Gemini calls
    console.log("Starting comprehensive analysis with single API call...");
    const analysisResult = await analyzer.analyzeComplete(
      scrapedData.caption,
      scrapedData.comments
    );
    console.log("Complete analysis finished");

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
    function analyzeProfileData(profile: any, reel: any) {
      const followerTiers = {
        micro: profile.followersCount < 10000,
        macro:
          profile.followersCount >= 10000 && profile.followersCount < 100000,
        mega:
          profile.followersCount >= 100000 && profile.followersCount < 1000000,
        celebrity: profile.followersCount >= 1000000,
      };

      type TierKey = keyof typeof followerTiers;
      const influencerTier =
        (Object.keys(followerTiers).find(
          (key) => followerTiers[key as TierKey]
        ) as TierKey) || "celebrity";

      const accountHealth = {
        followRatio:
          profile.followsCount > 0
            ? profile.followersCount / profile.followsCount
            : 0,
        postsToFollowersRatio:
          profile.followersCount > 0
            ? profile.postsCount / profile.followersCount
            : 0,
        avgEngagementRate: profile.engagementRate || 0,
      };

      const contentStrategy = {
        isBusinessAccount: profile.isBusinessAccount,
        isVerified: profile.verified,
        hasExternalLink: !!profile.externalUrl,
        usesStories: profile.highlightReelCount > 0,
        usesIGTV: profile.igtvVideoCount > 0,
        postingFrequency: profile.postingFrequency || "Unknown",
        contentCategories: profile.contentCategories || [],
      };

      const reelPerformance = {
        viewToFollowerRatio:
          profile.followersCount > 0
            ? reel.viewCount / profile.followersCount
            : 0,
        likeToFollowerRatio:
          profile.followersCount > 0
            ? reel.likesCount / profile.followersCount
            : 0,
        commentToFollowerRatio:
          profile.followersCount > 0
            ? reel.commentsCount / profile.followersCount
            : 0,
      };

      return {
        influencerTier,
        accountHealth,
        contentStrategy,
        reelPerformance,
      };
    }
    // Prepare reel data
    const reelData = {
      url,
      reelId: scrapedData.reelId,
      username: scrapedData.username,
      userProfilePic: scrapedData.userProfilePic,
      userFollowers: scrapedData.userFollowers,
      userFollowing: scrapedData.userFollowing,
      userPostsCount: scrapedData.userPostsCount,

      // Add profile data
      profileData,
      profileAnalysis,

      caption: scrapedData.caption,
      viewCount: scrapedData.viewCount,
      likesCount: scrapedData.likesCount,
      commentsCount: scrapedData.commentsCount,
      sharesCount: scrapedData.sharesCount,
      duration: scrapedData.duration,
      postDate: scrapedData.postDate,
      thumbnailUrl: scrapedData.thumbnailUrl,
      engagementRate,
      comments: processedComments,
      hashtags,
      captionSentiment,
      commentsSentiment,
      overallSentiment,
      topComments,
      spamCommentsCount,
      wordCloud,
      category,
      viralityScore,
      lastUpdated: new Date(),
    };

    console.log("Final reel data comments:", reelData.comments.length);
    console.log("Sample comment structure:", reelData.comments[0]);

    // Save or update in database
    const savedReel = await Reel.findOneAndUpdate({ url }, reelData, {
      upsert: true,
      new: true,
    });

    return NextResponse.json({
      success: true,
      data: savedReel,
    });
  } catch (error: any) {
    console.error("Analysis error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to analyze reel",
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
