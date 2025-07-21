// components/WordCloud.tsx
import React from "react";
import { MessageCircle } from "lucide-react";
import { ReelData } from "@/types/ReelAnalyser.types";

interface WordCloudProps {
  data: ReelData;
}

const WordCloud: React.FC<WordCloudProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Popular Words</h3>
      </div>
      <div className="flex flex-wrap gap-3">
        {data.wordCloud.map((word, index) => (
          <span
            key={index}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-full font-medium hover:bg-green-100 transition-colors"
            style={{
              fontSize: `${Math.max(14, Math.min(20, word.count + 10))}px`,
            }}
          >
            {word.word} ({word.count})
          </span>
        ))}
      </div>
    </div>
  );
};

export default WordCloud;
