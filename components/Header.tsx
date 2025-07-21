// components/Header.tsx
import React from "react";
import { BarChart3 } from "lucide-react";

const Header: React.FC = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Reel Analyzer
              </h1>
              <p className="text-gray-500">
                Analyze Instagram Reels performance
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
              Home
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
              Analytics
            </button>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
              Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
