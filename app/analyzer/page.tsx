"use client";
import React, { useState } from "react";
import {
  Search,
  TrendingUp,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Clock,
  User,
  Hash,
  Download,
  Zap,
  Target,
  CheckCircle,
  X,
  BarChart3,
  Sparkles,
  Calendar,
  Activity,
  Mic,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react";

type Sentiment = {
  positive: number;
  negative: number;
  neutral: number;
  overall: string;
  score: number;
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
};

const ReelAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReelData | null>(null);

  const validateReelData = (data: any): ReelData => {
    return {
      username: data.username || "unknown",
      userProfilePic: data.userProfilePic || "",
      caption: data.caption || "",
      viewCount: data.viewCount || 0,
      likesCount: data.likesCount || 0,
      commentsCount: data.commentsCount || 0,
      sharesCount: data.sharesCount || 0,
      duration: data.duration || 0,
      postDate: data.postDate || new Date().toISOString(),
      engagementRate: data.engagementRate || 0,
      viralityScore: data.viralityScore || 0,
      category: data.category || "general",
      captionSentiment: data.captionSentiment || {
        positive: 0,
        negative: 0,
        neutral: 100,
        overall: "neutral",
        score: 0,
      },
      commentsSentiment: data.commentsSentiment || {
        positive: 0,
        negative: 0,
        neutral: 100,
        overall: "neutral",
        score: 0,
      },
      overallSentiment: data.overallSentiment || {
        positive: 0,
        negative: 0,
        neutral: 100,
        overall: "neutral",
        score: 0,
      },
      topComments: data.topComments || [],
      wordCloud: data.wordCloud || [],
      hashtags: data.hashtags || [],
      spamCommentsCount: data.spamCommentsCount || 0,
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

      if (result.success && result.data) {
        const validatedData = validateReelData(result.data);
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
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Reel Analytics
                </h1>
                <p className="text-gray-500">Instagram Performance Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                Analytics
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                Reports
              </button>
              <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                Settings
              </button>
            </div>
          </div>

          {/* Welcome Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Hey, Need help? 👋
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Just ask me anything!
            </h2>
            <p className="text-xl text-gray-500 mb-8">
              Analyze your Instagram Reel performance with AI-powered insights
            </p>
          </div>

          {/* Search Section */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Paste Instagram Reel URL here..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-lg"
                  />
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !url}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ArrowUpRight className="w-5 h-5" />
                  )}
                  {loading ? "Analyzing..." : "Analyze"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reel Analytics
              </h1>
              <p className="text-gray-500">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setData(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </button>
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Date and User Info */}
          <div className="col-span-3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-500">Posted</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatDate(data.postDate).split(" ")[0] ||
                  new Date().getDate()}
              </div>
              <div className="text-gray-500 text-sm capitalize">
                {data.category}, {data.duration}s
              </div>
              <div className="mt-4 p-3 bg-orange-50 rounded-xl">
                <div className="text-sm text-orange-600 font-medium">
                  @{data.username}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <Eye className="w-5 h-5 text-gray-400" />
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatNumber(data.viewCount)}
                </div>
                <div className="text-gray-500 text-sm">Total views</div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <span className="text-xs bg-orange-50 text-orange-600 px-2 py-1 rounded-full">
                    2023
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {data.engagementRate.toFixed(1)}%
                </div>
                <div className="text-gray-500 text-sm">Engagement rate</div>
              </div>
            </div>
          </div>

          {/* Main Metrics */}
          <div className="col-span-6">
            {/* Performance Overview */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Performance Overview
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Filter className="w-4 h-4" />
                  <span>Weekly</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-8">
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
                  <div key={index} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <metric.icon className="w-5 h-5 text-gray-400" />
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
                    <div className="text-xl font-bold text-gray-900 mb-1">
                      {metric.value}
                    </div>
                    <div className="text-gray-500 text-xs">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Sentiment Analysis */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">
                      Caption Sentiment
                    </span>
                    <span className="text-sm font-bold text-orange-600 capitalize">
                      {data.captionSentiment.overall}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
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
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Positive {data.captionSentiment.positive}%</span>
                    <span>Negative {data.captionSentiment.negative}%</span>
                    <span>Neutral {data.captionSentiment.neutral}%</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-gray-900">
                      Comments Sentiment
                    </span>
                    <span className="text-sm font-bold text-orange-600 capitalize">
                      {data.commentsSentiment.overall}
                    </span>
                  </div>
                  <div className="bg-gray-100 rounded-full h-2 overflow-hidden mb-2">
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
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Positive {data.commentsSentiment.positive}%</span>
                    <span>Negative {data.commentsSentiment.negative}%</span>
                    <span>Neutral {data.commentsSentiment.neutral}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="col-span-3 space-y-6">
            {/* Engagement Rate Circle */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg
                    className="w-24 h-24 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f3f4f6"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2"
                      strokeDasharray={`${data.engagementRate}, 100`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {data.engagementRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">Engagement rate</div>
                <div className="text-xs text-green-600 mt-1">
                  +2.3% from last week
                </div>
              </div>
            </div>

            {/* Popular Words */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Hash className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-gray-900">Popular Words</h3>
              </div>
              <div className="space-y-3">
                {data.wordCloud.slice(0, 5).map((word, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">
                        {word.word}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">{word.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-gray-900">Key Insights</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-orange-600" />
                    <span className="font-semibold text-gray-900 text-sm">
                      High Performance
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    Your content shows excellent engagement with positive
                    audience sentiment
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-900 text-sm">
                      Optimal Timing
                    </span>
                  </div>
                  <p className="text-gray-600 text-xs">
                    Posted during peak engagement hours for your audience
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Comments */}
          <div className="col-span-12">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  Top Comments
                </h3>
                <div className="text-sm text-gray-500">
                  Showing {data.topComments.length} of {data.commentsCount}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {data.topComments.map((comment, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-orange-600" />
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">
                          @{comment.author}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-orange-500" />
                        <span className="text-xs text-gray-500">
                          {comment.likes}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {comment.text}
                    </p>
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
