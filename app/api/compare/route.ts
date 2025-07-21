import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Reel, { IReel } from "@/models/Reels";
import { z } from "zod";

const compareSchema = z.object({
  urls: z.array(z.string().url()).min(2).max(5),
});

interface ComparisonData {
  reels: IReel[];
  comparison: {
    averageEngagementRate: number;
    topPerformer: string;
    sentimentWinner: string;
    insights: string[];
  };
}

interface CompareResponse {
  success: boolean;
  data?: ComparisonData;
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CompareResponse>> {
  try {
    const body = await request.json();
    const { urls } = compareSchema.parse(body);

    await connectDB();

    const reels = await Reel.find({ url: { $in: urls } }).lean<IReel[]>();

    if (reels.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No analyzed reels found. Please analyze the reels first.",
        },
        { status: 404 }
      );
    }

    const comparison = generateComparison(reels);

    return NextResponse.json({
      success: true,
      data: {
        reels: reels,
        comparison,
      },
    });
  } catch (error: any) {
    console.error("Comparison error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to compare reels",
      },
      { status: 500 }
    );
  }
}

function generateComparison(reels: IReel[]) {
  const totalEngagement = reels.reduce(
    (sum, reel) => sum + reel.engagementRate,
    0
  );
  const averageEngagementRate = totalEngagement / reels.length;

  const topPerformer = reels.reduce((prev, current) =>
    current.engagementRate > prev.engagementRate ? current : prev
  );

  const sentimentWinner = reels.reduce((prev, current) =>
    current.overallSentiment.positive > prev.overallSentiment.positive
      ? current
      : prev
  );

  const insights: string[] = [];

  // Generate insights based on comparison
  const highEngagement = reels.filter(
    (r) => r.engagementRate > averageEngagementRate
  );
  if (highEngagement.length > 0) {
    insights.push(
      `${highEngagement.length} out of ${reels.length} reels performed above average engagement rate`
    );
  }

  return {
    averageEngagementRate: Math.round(averageEngagementRate * 100) / 100,
    topPerformer: `@${topPerformer.username}`,
    sentimentWinner: `@${sentimentWinner.username}`,
    insights,
  };
}
