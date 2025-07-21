import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reel, { IReel } from "@/models/Reels";

interface UserAnalytics {
  username: string;
  profilePic: string;
  totalReelsAnalyzed: number;
  averageEngagement: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  bestPerformingReel: IReel | null;
  recentReels: IReel[];
  categoryBreakdown: Record<string, number>;
  sentimentTrend: {
    positive: number;
    negative: number;
    neutral: number;
  };
  recommendations: string[];
}

interface UserResponse {
  success: boolean;
  data?: UserAnalytics;
  error?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse<UserResponse>> {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          error: "Username is required",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const userReels = await Reel.find({
      username: username.toLowerCase().replace("@", ""),
    })
      .sort({ postDate: -1 })
      .lean<IReel[]>();

    if (userReels.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No analyzed reels found for this user",
        },
        { status: 404 }
      );
    }

    const analytics = calculateUserAnalytics(userReels);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: any) {
    console.error("User analytics error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to get user analytics",
      },
      { status: 500 }
    );
  }
}

function calculateUserAnalytics(reels: IReel[]): UserAnalytics {
  const totalReels = reels.length;
  const firstReel = reels[0];

  const totalViews = reels.reduce((sum, reel) => sum + reel.viewCount, 0);
  const totalLikes = reels.reduce((sum, reel) => sum + reel.likesCount, 0);
  const totalComments = reels.reduce(
    (sum, reel) => sum + reel.commentsCount,
    0
  );
  const totalEngagement = reels.reduce(
    (sum, reel) => sum + reel.engagementRate,
    0
  );

  const bestPerformingReel = reels.reduce((prev, current) =>
    current.engagementRate > prev.engagementRate ? current : prev
  );

  const categoryBreakdown: Record<string, number> = {};
  reels.forEach((reel) => {
    if (reel.category) {
      categoryBreakdown[reel.category] =
        (categoryBreakdown[reel.category] || 0) + 1;
    }
  });

  const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
  reels.forEach((reel) => {
    sentimentCounts[reel.overallSentiment.overall]++;
  });

  const sentimentTrend = {
    positive: Math.round((sentimentCounts.positive / totalReels) * 100),
    negative: Math.round((sentimentCounts.negative / totalReels) * 100),
    neutral: Math.round((sentimentCounts.neutral / totalReels) * 100),
  };

  const recommendations = generateRecommendations(reels);

  return {
    username: firstReel.username,
    profilePic: firstReel.userProfilePic,
    totalReelsAnalyzed: totalReels,
    averageEngagement: Math.round((totalEngagement / totalReels) * 100) / 100,
    totalViews,
    totalLikes,
    totalComments,
    bestPerformingReel,
    recentReels: reels.slice(0, 5),
    categoryBreakdown,
    sentimentTrend,
    recommendations,
  };
}

function generateRecommendations(reels: IReel[]): string[] {
  const recommendations: string[] = [];

  const avgEngagement =
    reels.reduce((sum, r) => sum + r.engagementRate, 0) / reels.length;

  if (avgEngagement < 2) {
    recommendations.push(
      "Focus on improving engagement - try more interactive content like polls or questions"
    );
  } else if (avgEngagement > 5) {
    recommendations.push(
      "Great engagement rate! Maintain this momentum with consistent posting"
    );
  }

  return recommendations.slice(0, 5);
}
