// components/UserProfileCard.tsx
import React from "react";
import { CheckCircle, Download } from "lucide-react";
import { ReelData } from "@/types/ReelAnalyser.types";

interface UserProfileCardProps {
  data: ReelData;
  formatDate: (dateString: string) => string;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({
  data,
  formatDate,
}) => {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={data.userProfilePic}
              alt={data.username}
              className="w-20 h-20 rounded-full border-4 border-purple-200"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              @{data.username}
            </h2>
            <p className="text-gray-600 text-lg capitalize">
              {data.category} creator
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-sm text-gray-500">
                {formatDate(data.postDate)}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">{data.duration}s</span>
            </div>
          </div>
        </div>
        <button className="bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-2xl transition-colors duration-200 flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6">
        <p className="text-gray-700 text-lg leading-relaxed">{data.caption}</p>
      </div>
    </div>
  );
};

export default UserProfileCard;
