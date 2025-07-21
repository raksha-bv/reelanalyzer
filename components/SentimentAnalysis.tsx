// components/SentimentAnalysis.tsx
import React from "react";
import { Target, Sparkles } from "lucide-react";
import { ReelData } from "@/types/ReelAnalyser.types"; // Adjust the import path as necessary
import {
  getSentimentColor,
  getSentimentBg,
  getSentimentIcon,
} from "@/utils/sentimentUtils";

interface SentimentAnalysisProps {
  data: ReelData;
}

const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
          <Target className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Sentiment Analysis</h3>
      </div>

      <div className="space-y-8">
        {/* Caption Sentiment */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-medium">Caption Sentiment</span>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${getSentimentBg(
                data.captionSentiment.overall
              )}`}
            >
              {getSentimentIcon(data.captionSentiment.overall)}
              <span
                className={`font-medium capitalize ${getSentimentColor(
                  data.captionSentiment.overall
                )}`}
              >
                {data.captionSentiment.overall}
              </span>
            </div>
          </div>
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="flex h-full">
              <div
                className="bg-emerald-500"
                style={{
                  width: `${data.captionSentiment.positive}%`,
                }}
              ></div>
              <div
                className="bg-red-500"
                style={{
                  width: `${data.captionSentiment.negative}%`,
                }}
              ></div>
              <div
                className="bg-gray-400"
                style={{ width: `${data.captionSentiment.neutral}%` }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Positive: {data.captionSentiment.positive}%</span>
            <span>Negative: {data.captionSentiment.negative}%</span>
            <span>Neutral: {data.captionSentiment.neutral}%</span>
          </div>
        </div>

        {/* Comments Sentiment */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700 font-medium">
              Comments Sentiment
            </span>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full ${getSentimentBg(
                data.commentsSentiment.overall
              )}`}
            >
              {getSentimentIcon(data.commentsSentiment.overall)}
              <span
                className={`font-medium capitalize ${getSentimentColor(
                  data.commentsSentiment.overall
                )}`}
              >
                {data.commentsSentiment.overall}
              </span>
            </div>
          </div>
          <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
            <div className="flex h-full">
              <div
                className="bg-emerald-500"
                style={{
                  width: `${data.commentsSentiment.positive}%`,
                }}
              ></div>
              <div
                className="bg-red-500"
                style={{
                  width: `${data.commentsSentiment.negative}%`,
                }}
              ></div>
              <div
                className="bg-gray-400"
                style={{
                  width: `${data.commentsSentiment.neutral}%`,
                }}
              ></div>
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>Positive: {data.commentsSentiment.positive}%</span>
            <span>Negative: {data.commentsSentiment.negative}%</span>
            <span>Neutral: {data.commentsSentiment.neutral}%</span>
          </div>
        </div>

        {/* Virality Score */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span className="font-bold text-gray-900 text-lg">
              Virality Score
            </span>
          </div>
          <div className="text-4xl font-bold text-purple-600 mb-1">
            {data.viralityScore}/1000
          </div>
          <div className="text-gray-600">
            {data.viralityScore >= 700
              ? "Very High"
              : data.viralityScore >= 500
              ? "High"
              : data.viralityScore >= 300
              ? "Medium"
              : "Low"}{" "}
            viral potential
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentAnalysis;
