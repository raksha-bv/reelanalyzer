// components/TopComments.tsx
import React from "react";
import { MessageCircle, User, Heart } from "lucide-react";
import { ReelData } from "@/types/ReelAnalyser.types";
import {
  getSentimentColor,
  getSentimentBg,
  getSentimentIcon,
} from "@/utils/sentimentUtils";

interface TopCommentsProps {
  data: ReelData;
}

const TopComments: React.FC<TopCommentsProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Top Comments</h3>
      </div>

      <div className="space-y-4">
        {data.topComments.map((comment, index) => (
          <div key={index} className="bg-gray-50 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">
                  @{comment.author}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-600">{comment.likes}</span>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{comment.text}</p>
            <div
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getSentimentBg(
                comment.sentiment
              )}`}
            >
              {getSentimentIcon(comment.sentiment)}
              <span className={getSentimentColor(comment.sentiment)}>
                {comment.sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Spam Comments Detected:</span>
          <span className="font-bold text-red-500">
            {data.spamCommentsCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TopComments;
