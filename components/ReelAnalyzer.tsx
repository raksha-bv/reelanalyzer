// components/ReelAnalyzer.tsx
"use client";
import React, { useState } from "react";
import Header from "./Header";
import SearchSection from "./SearchSection";
import UserProfileCard from "./UserProfileCard";
import MetricsGrid from "./MetricsGrid";
import SentimentAnalysis from "./SentimentAnalysis";
import TopComments from "./TopComments";
import WordCloud from "./WordCloud";
import HashtagPerformance from "./HashtagPerformance";
import PerformanceInsights from "./PerformanceInsights";
import { ReelData } from "@/types/ReelAnalyser.types"; // Adjust the import path as necessary
import { formatNumber, formatDate } from "@/utils/formatUtils";

const ReelAnalyzer = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ReelData | null>(null);

  const validateReelData = (data: any): ReelData => {
    console.log("Raw data being validated:", data);

    return {
      username: data.username || "unknown",
      userProfilePic:
        data.userProfilePic ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      caption:
        data.caption || "Check out this amazing content! 🔥 #viral #trending",
      viewCount: data.viewCount || 125400,
      likesCount: data.likesCount || 8900,
      commentsCount: data.commentsCount || 234,
      sharesCount: data.sharesCount || 89,
      duration: data.duration || 15,
      postDate: data.postDate || new Date().toISOString(),
      engagementRate: data.engagementRate || 7.2,
      viralityScore: data.viralityScore || 750,
      category: data.category || "lifestyle",
      captionSentiment: data.captionSentiment || {
        positive: 75,
        negative: 10,
        neutral: 15,
        overall: "positive",
        score: 0.75,
      },
      commentsSentiment: data.commentsSentiment || {
        positive: 65,
        negative: 20,
        neutral: 15,
        overall: "positive",
        score: 0.65,
      },
      overallSentiment: data.overallSentiment || {
        positive: 70,
        negative: 15,
        neutral: 15,
        overall: "positive",
        score: 0.7,
      },
      topComments: data.topComments || [
        {
          text: "This is absolutely amazing! 🔥",
          author: "user123",
          likes: 45,
          sentiment: "positive",
        },
        {
          text: "Love the creativity here!",
          author: "creator456",
          likes: 32,
          sentiment: "positive",
        },
        {
          text: "Not sure about this one",
          author: "critic789",
          likes: 12,
          sentiment: "negative",
        },
      ],
      wordCloud: data.wordCloud || [
        { word: "amazing", count: 15 },
        { word: "love", count: 12 },
        { word: "great", count: 10 },
        { word: "awesome", count: 8 },
        { word: "beautiful", count: 6 },
      ],
      hashtags: data.hashtags || [
        { tag: "viral", count: 25 },
        { tag: "trending", count: 18 },
        { tag: "lifestyle", count: 12 },
        { tag: "inspiration", count: 8 },
      ],
      spamCommentsCount: data.spamCommentsCount || 3,
    };
  };

  const handleAnalyze = async () => {
    if (!url) return;

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const demoData = validateReelData({});
      setData(demoData);
    } catch (error) {
      console.error("Error analyzing reel:", error);
      alert(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchSection
          url={url}
          setUrl={setUrl}
          loading={loading}
          onAnalyze={handleAnalyze}
        />

        {data && (
          <div className="space-y-8">
            <UserProfileCard data={data} formatDate={formatDate} />

            <MetricsGrid data={data} formatNumber={formatNumber} />

            <div className="grid lg:grid-cols-2 gap-8">
              <SentimentAnalysis data={data} />
              <TopComments data={data} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <WordCloud data={data} />
              <HashtagPerformance data={data} />
            </div>

            <PerformanceInsights />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelAnalyzer;
