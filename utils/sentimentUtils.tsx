// utils/sentimentUtils.ts
import React from "react";
import { CheckCircle, X, AlertTriangle } from "lucide-react";

export const getSentimentColor = (sentiment: string): string => {
  const colorMap: { [key: string]: string } = {
    positive: "text-emerald-600",
    negative: "text-red-500",
  };
  return colorMap[sentiment] ?? "text-gray-500";
};

export const getSentimentBg = (sentiment: string): string => {
  const colorMap: { [key: string]: string } = {
    positive: "bg-emerald-50 border-emerald-200",
    negative: "bg-red-50 border-red-200",
  };
  return colorMap[sentiment] ?? "bg-gray-50 border-gray-200";
};

export const getSentimentIcon = (sentiment: string): React.JSX.Element => {
  switch (sentiment) {
    case "positive":
      return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    case "negative":
      return <X className="w-4 h-4 text-red-500" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-gray-500" />;
  }
};
