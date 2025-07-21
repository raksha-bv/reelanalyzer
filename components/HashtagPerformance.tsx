// components/HashtagPerformance.tsx
import React from "react";
import { Hash } from "lucide-react";
import { ReelData } from "@/types/ReelAnalyser.types"; // Adjust the import path as necessary

interface HashtagPerformanceProps {
  data: ReelData;
}

const HashtagPerformance: React.FC<HashtagPerformanceProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
          <Hash className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          Hashtag Performance
        </h3>
      </div>
      <div className="space-y-4">
        {data.hashtags.map((hashtag, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-4 bg-indigo-50 rounded-2xl border border-indigo-100"
          >
            <span className="text-indigo-700 font-semibold text-lg">
              #{hashtag.tag}
            </span>
            <span className="text-indigo-600 font-medium">
              {hashtag.count} uses
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HashtagPerformance;
