// components/PerformanceInsights.tsx
import React from "react";
import { TrendingUp, CheckCircle, Clock, Sparkles } from "lucide-react";

const PerformanceInsights: React.FC = () => {
  const insights = [
    {
      icon: CheckCircle,
      title: "Engagement Quality",
      description:
        "High interaction rate with positive sentiment indicates strong audience connection",
      color: "bg-emerald-500",
      textColor: "text-emerald-700",
    },
    {
      icon: Clock,
      title: "Optimal Timing",
      description:
        "Content posted during peak hours shows 40% better engagement rates",
      color: "bg-blue-500",
      textColor: "text-blue-700",
    },
    {
      icon: Sparkles,
      title: "Content Strategy",
      description:
        "Similar lifestyle content with authentic storytelling performs exceptionally well",
      color: "bg-orange-500",
      textColor: "text-orange-700",
    },
  ];

  return (
    <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 border border-purple-200 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          AI-Powered Insights
        </h3>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6"
          >
            <div
              className={`w-12 h-12 ${insight.color} rounded-xl flex items-center justify-center mb-4`}
            >
              <insight.icon className="w-6 h-6 text-white" />
            </div>
            <div className={`${insight.textColor} font-bold text-lg mb-2`}>
              {insight.title}
            </div>
            <div className="text-gray-700">{insight.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceInsights;
