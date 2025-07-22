"use client";
import React, { useState } from "react";
import {
  Search,
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  User,
  Hash,
  Zap,
  CheckCircle,
  BarChart3,
  Sparkles,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type Sentiment = {
  positive: number;
  negative: number;
  neutral: number;
  overall: string;
  score: number;
};

type StrategicInsights = {
  contentStrategy?: {
    strengths: string[];
    opportunities: string[];
    recommendations: string[];
  };
  audienceInsights?: {
    demographics: Record<string, number>;
    engagementPatterns: string[];
    behaviorInsights: string[];
  };
  performanceAnalysis?: {
    viralPotential: string;
    contentOptimization: string[];
    timingRecommendations: string[];
  };
};

type Comment = {
  text: string;
  author: string;
  likes: number;
  sentiment: string;
};

type WordCloudItem = {
  word: string;
  count: number;
};

type HashtagItem = {
  tag: string;
  count: number;
};

type ReelData = {
  username: string;
  userProfilePic: string;
  caption: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  duration: number;
  postDate: string;
  engagementRate: number;
  viralityScore: number;
  category: string;
  captionSentiment: Sentiment;
  commentsSentiment: Sentiment;
  overallSentiment: Sentiment;
  topComments: Comment[];
  wordCloud: WordCloudItem[];
  hashtags: HashtagItem[];
  spamCommentsCount: number;
  contentStrategy?: {
    strengths: string[];
    opportunities: string[];
  };
  audienceInsights?: {
    demographics: Record<string, number>;
    engagementPatterns: string[];
  };
  strategicInsights?: StrategicInsights;
};

const ReelAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReelData | null>(null);

  const validateReelData = (data: unknown): ReelData => {
    const safeData = data as Record<string, unknown>;

    console.log("Raw data received in validateReelData:", safeData);
    console.log("strategicInsights in raw data:", safeData.strategicInsights);

    return {
      username: (safeData.username as string) || "unknown",
      userProfilePic: (safeData.userProfilePic as string) || "",
      caption: (safeData.caption as string) || "",
      viewCount: (safeData.viewCount as number) || 0,
      likesCount: (safeData.likesCount as number) || 0,
      commentsCount: (safeData.commentsCount as number) || 0,
      sharesCount: (safeData.sharesCount as number) || 0,
      duration: (safeData.duration as number) || 0,
      postDate: (safeData.postDate as string) || new Date().toISOString(),
      engagementRate: (safeData.engagementRate as number) || 0,
      viralityScore: (safeData.viralityScore as number) || 0,
      category: (safeData.category as string) || "general",
      captionSentiment: (safeData.captionSentiment as Sentiment) || {
        positive: 0,
        negative: 0,
        neutral: 100,
        overall: "neutral",
        score: 0,
      },
      commentsSentiment: (safeData.commentsSentiment as Sentiment) || {
        positive: 0,
        negative: 0,
        neutral: 100,
        overall: "neutral",
        score: 0,
      },
      overallSentiment: (safeData.overallSentiment as Sentiment) || {
        positive: 0,
        negative: 0,
        neutral: 100,
        overall: "neutral",
        score: 0,
      },
      topComments: (safeData.topComments as Comment[]) || [],
      wordCloud: (safeData.wordCloud as WordCloudItem[]) || [],
      hashtags: (safeData.hashtags as HashtagItem[]) || [],
      spamCommentsCount: (safeData.spamCommentsCount as number) || 0,
      strategicInsights: (() => {
        const insights = safeData.strategicInsights as StrategicInsights;
        console.log("Raw strategicInsights:", safeData.strategicInsights);
        console.log(
          "Type of strategicInsights:",
          typeof safeData.strategicInsights
        );
        console.log("Processed strategicInsights:", insights);

        if (insights && typeof insights === "object") {
          return {
            contentStrategy: insights.contentStrategy
              ? {
                  strengths: Array.isArray(insights.contentStrategy.strengths)
                    ? insights.contentStrategy.strengths
                    : [],
                  opportunities: Array.isArray(
                    insights.contentStrategy.opportunities
                  )
                    ? insights.contentStrategy.opportunities
                    : [],
                  recommendations: Array.isArray(
                    insights.contentStrategy.recommendations
                  )
                    ? insights.contentStrategy.recommendations
                    : [],
                }
              : undefined,
            audienceInsights: insights.audienceInsights,
            performanceAnalysis: insights.performanceAnalysis,
          };
        }

        return undefined;
      })(),
    };
  };

  const handleAnalyze = async () => {
    if (!url) return;

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      console.log("API response:", result);

      console.log("result.data:", result.data);
      console.log(
        "result.data.strategicInsights:",
        result.data?.strategicInsights
      );
      console.log("Raw JSON:", JSON.stringify(result.data, null, 2));

      if (result.success && result.data) {
        console.log("API response data:", result.data);
        console.log(
          "strategicInsights in response:",
          result.data.strategicInsights
        );

        const validatedData = validateReelData(result.data);
        console.log("Final validated data:", validatedData);
        console.log(
          "Final strategicInsights:",
          validatedData.strategicInsights
        );

        setData(validatedData);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      console.error("Error analyzing reel:", error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num === undefined || num === null || isNaN(num)) {
      return "0";
    }
    const numValue = Number(num);
    if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + "M";
    if (numValue >= 1000) return (numValue / 1000).toFixed(1) + "K";
    return numValue.toString();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days === 0 ? "Today" : `${days}d ago`;
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Reel Analytics
                </h1>
                <p className="text-gray-500 text-base">
                  Instagram Performance Dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-6 py-3 rounded-full text-base font-medium mb-4">
              <Sparkles className="w-5 h-5" />
              Hey, Need help? 👋
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Just ask me anything!
            </h2>
            <p className="text-xl text-gray-500 mb-8">
              Analyze your Instagram Reel performance with AI-powered insights
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
            <div className="flex gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Paste Instagram Reel URL here..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-14 pr-8 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !url}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl text-lg"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowUpRight className="w-6 h-6" />
                )}
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sentimentData = [
    {
      name: "Positive",
      value: data.overallSentiment.positive,
      fill: "#f97316",
    },
    {
      name: "Negative",
      value: data.overallSentiment.negative,
      fill: "#9ca3af",
    },
    { name: "Neutral", value: data.overallSentiment.neutral, fill: "#e5e7eb" },
  ];

  const topThreeComments = data.topComments
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reel Analytics
              </h1>
              <p className="text-gray-500 text-base">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setData(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2 text-base"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </button>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - User Info & Quick Stats */}
          <div className="col-span-2 space-y-4">
            {/* User Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-500">Posted</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatDate(data.postDate).split(" ")[0] ||
                  new Date().getDate()}
              </div>
              <div className="text-gray-500 text-sm">
                {data.category}, {data.duration}s
              </div>
              <div className="mt-3 p-3 bg-orange-50 rounded-lg">
                <div className="text-sm text-orange-600 font-medium truncate">
                  @{data.username}
                </div>
              </div>
            </div>

            {/* Views */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-gray-400" />
                <ArrowUpRight className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(data.viewCount)}
              </div>
              <div className="text-gray-500 text-sm">Views</div>
            </div>

            {/* Engagement Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                  Rate
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {data.engagementRate.toFixed(1)}%
              </div>
              <div className="text-gray-500 text-sm">Engagement</div>
            </div>
          </div>

          {/* Center Column - Main Metrics & Performance */}
          <div className="col-span-7 space-y-4">
            {/* Performance Metrics Grid - Compact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Performance Overview
                </h3>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Filter className="w-4 h-4" />
                  <span>Weekly</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  {
                    icon: Heart,
                    label: "Likes",
                    value: formatNumber(data.likesCount),
                    change: "+12.3%",
                    positive: true,
                  },
                  {
                    icon: MessageCircle,
                    label: "Comments",
                    value: data.commentsCount.toString(),
                    change: "+8.7%",
                    positive: true,
                  },
                  {
                    icon: Share2,
                    label: "Shares",
                    value: data.sharesCount.toString(),
                    change: "+15.2%",
                    positive: true,
                  },
                  {
                    icon: Zap,
                    label: "Virality",
                    value: data.viralityScore.toString(),
                    change: "+5.1%",
                    positive: true,
                  },
                ].map((metric, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className="w-4 h-4 text-gray-400" />
                      <div
                        className={`flex items-center gap-1 text-xs ${
                          metric.positive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {metric.positive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {metric.change}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-gray-900">
                      {metric.value}
                    </div>
                    <div className="text-gray-500 text-sm">{metric.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Analysis - Compact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Sentiment Analysis
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Caption Sentiment
                    </span>
                    <span className="text-sm font-bold text-orange-600 capitalize">
                      {data.captionSentiment.overall}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="flex h-full">
                      <div
                        className="bg-orange-500"
                        style={{ width: `${data.captionSentiment.positive}%` }}
                      ></div>
                      <div
                        className="bg-gray-400"
                        style={{ width: `${data.captionSentiment.negative}%` }}
                      ></div>
                      <div
                        className="bg-gray-200"
                        style={{ width: `${data.captionSentiment.neutral}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-900">
                      Comments Sentiment
                    </span>
                    <span className="text-sm font-bold text-orange-600 capitalize">
                      {data.commentsSentiment.overall}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div className="flex h-full">
                      <div
                        className="bg-orange-500"
                        style={{ width: `${data.commentsSentiment.positive}%` }}
                      ></div>
                      <div
                        className="bg-gray-400"
                        style={{ width: `${data.commentsSentiment.negative}%` }}
                      ></div>
                      <div
                        className="bg-gray-200"
                        style={{ width: `${data.commentsSentiment.neutral}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Comments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Top 3 Comments (by likes)
                </h3>
                <div className="text-sm text-gray-500">
                  Showing 3 of {data.commentsCount}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {topThreeComments.map((comment, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-orange-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-xs truncate">
                          @{comment.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-orange-500" />
                        <span className="text-xs text-gray-500">
                          {comment.likes}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-3 space-y-4">
            {/* Pie Chart for Sentiment */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">
                Overall Sentiment
              </h3>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-600">Positive</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600">Negative</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                  <span className="text-gray-600">Neutral</span>
                </div>
              </div>
            </div>

            {/* Strategic Insights - Reduced max height */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Strategic Insights
                </h3>
              </div>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {data.strategicInsights?.contentStrategy?.strengths &&
                  data.strategicInsights.contentStrategy.strengths.length > 0 &&
                  data.strategicInsights.contentStrategy.strengths
                    .slice(0, 1)
                    .map((strength, index) => (
                      <div
                        key={`strength-${index}`}
                        className="p-3 bg-green-50 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-gray-900 text-sm">
                            Strength
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {strength}
                        </p>
                      </div>
                    ))}
                {data.strategicInsights?.contentStrategy?.opportunities &&
                  data.strategicInsights.contentStrategy.opportunities.length >
                    0 &&
                  data.strategicInsights.contentStrategy.opportunities
                    .slice(0, 1)
                    .map((opportunity, index) => (
                      <div
                        key={`opportunity-${index}`}
                        className="p-3 bg-blue-50 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-900 text-sm">
                            Opportunity
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {opportunity}
                        </p>
                      </div>
                    ))}

                {data.strategicInsights?.contentStrategy?.recommendations &&
                  data.strategicInsights.contentStrategy.recommendations
                    .length > 0 &&
                  data.strategicInsights.contentStrategy.recommendations
                    .slice(0, 1)
                    .map((recommendation, index) => (
                      <div
                        key={`recommendation-${index}`}
                        className="p-3 bg-purple-50 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Zap className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-gray-900 text-sm">
                            Recommendation
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {recommendation}
                        </p>
                      </div>
                    ))}
              </div>
            </div>

            {/* Popular Words - Compact version */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Popular Words
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {data.wordCloud.slice(0, 4).map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      <span className="font-medium text-gray-900 truncate">
                        {word.word}
                      </span>
                    </div>
                    <span className="text-gray-500">{word.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelAnalyzer;
