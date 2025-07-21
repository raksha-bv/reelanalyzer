// components/MetricsGrid.tsx
import React from "react";
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Zap,
} from "lucide-react";
import { ReelData } from "@/types/ReelAnalyser.types"; // Adjust the import path as necessary

interface MetricsGridProps {
  data: ReelData;
  formatNumber: (num: number) => string;
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ data, formatNumber }) => {
  const metrics = [
    {
      icon: Eye,
      label: "Views",
      value: formatNumber(data.viewCount),
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: Heart,
      label: "Likes",
      value: formatNumber(data.likesCount),
      color: "bg-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: MessageCircle,
      label: "Comments",
      value: data.commentsCount.toString(),
      color: "bg-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: Share2,
      label: "Shares",
      value: data.sharesCount.toString(),
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
    },
    {
      icon: TrendingUp,
      label: "Engagement",
      value: `${data.engagementRate.toFixed(1)}%`,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
    },
    {
      icon: Zap,
      label: "Virality",
      value: data.viralityScore.toString(),
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`${metric.bgColor} rounded-2xl p-6 border border-gray-100`}
        >
          <div
            className={`${metric.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}
          >
            <metric.icon className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-600 text-sm font-medium mb-1">
            {metric.label}
          </p>
          <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
        </div>
      ))}
    </div>
  );
};

export default MetricsGrid;
