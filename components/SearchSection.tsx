// components/SearchSection.tsx
import React from "react";
import { Search } from "lucide-react";

interface SearchSectionProps {
  url: string;
  setUrl: (url: string) => void;
  loading: boolean;
  onAnalyze: () => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({
  url,
  setUrl,
  loading,
  onAnalyze,
}) => {
  return (
    <div className="bg-white rounded-3xl p-8 mb-8 shadow-sm border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Analyze Your Instagram Reel
        </h2>
        <p className="text-gray-600 text-lg">
          Get detailed insights about engagement, sentiment, and performance
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Paste Instagram Reel URL here..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 text-lg"
            />
          </div>
          <button
            onClick={onAnalyze}
            disabled={loading || !url}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-200 flex items-center gap-3 text-lg shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-6 h-6" />
            )}
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchSection;
