import mongoose, { Document, Schema } from "mongoose";

export interface IComment {
  id: string;
  text: string;
  author: string;
  likes: number;
  timestamp: Date;
  replies: number;
  sentiment: "positive" | "negative" | "neutral"; // This should be string, not object
  isSpam: boolean;
}

export interface IHashtag {
  tag: string;
  count: number;
}
export interface IProfileData {
  id: string;
  username: string;
  fullName: string;
  biography: string;
  externalUrl?: string;
  followersCount: number;
  followsCount: number;
  hasChannel: boolean;
  highlightReelCount: number;
  isBusinessAccount: boolean;
  joinedRecently: boolean;
  businessCategoryName?: string;
  private: boolean;
  verified: boolean;
  profilePicUrl: string;
  profilePicUrlHD: string;
  facebookPage?: string;
  igtvVideoCount: number;
  postsCount: number;
  avgLikesPerPost?: number;
  avgCommentsPerPost?: number;
  engagementRate?: number;
  contentCategories?: string[];
  postingFrequency?: string;
  audienceGrowthRate?: number;
}

export interface IProfileAnalysis {
  influencerTier: string;
  accountHealth: {
    followRatio: number;
    postsToFollowersRatio: number;
    avgEngagementRate: number;
  };
  contentStrategy: {
    isBusinessAccount: boolean;
    isVerified: boolean;
    hasExternalLink: boolean;
    usesStories: boolean;
    usesIGTV: boolean;
    postingFrequency: string;
    contentCategories: string[];
  };
  reelPerformance: {
    viewToFollowerRatio: number;
    likeToFollowerRatio: number;
    commentToFollowerRatio: number;
  };
}

export interface ISentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  overall: "positive" | "negative" | "neutral";
  score: number;
}
export interface IStrategicInsights {
  contentStrategy?: {
    strengths: string[];
    opportunities: string[];
    recommendations: string[];
  };
  audienceInsights?: {
    demographics: Record<string, number>;
    engagementPatterns: string[];
    behaviorInsights: string[];
  };
  performanceAnalysis?: {
    viralPotential: string;
    contentOptimization: string[];
    timingRecommendations: string[];
  };
}
export interface IReel extends Document {
  url: string;
  reelId: string;
  username: string;
  userProfilePic: string;
  userFollowers?: number;
  userFollowing?: number;
  userPostsCount?: number;

  // Reel Data
  caption: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  duration: number;
  postDate: Date;
  thumbnailUrl: string;

  // Analytics
  engagementRate: number;
  comments: IComment[];
  hashtags: IHashtag[];

  // Sentiment Analysis
  captionSentiment: ISentimentAnalysis;
  commentsSentiment: ISentimentAnalysis;
  overallSentiment: ISentimentAnalysis;

  // Advanced Analytics
  topComments: IComment[];
  spamCommentsCount: number;
  wordCloud: { word: string; count: number }[];
  category?: string;
  viralityScore?: number;
  strategicInsights?: IStrategicInsights; // Add this line

  // Metadata
  lastUpdated: Date;
  createdAt: Date;
  profileData?: IProfileData;
  profileAnalysis?: IProfileAnalysis;
}
const StrategicInsightsSchema = new Schema(
  {
    contentStrategy: {
      strengths: [String],
      opportunities: [String],
      recommendations: [String],
    },
    audienceInsights: {
      demographics: { type: Map, of: Number },
      engagementPatterns: [String],
      behaviorInsights: [String],
    },
    performanceAnalysis: {
      viralPotential: String,
      contentOptimization: [String],
      timingRecommendations: [String],
    },
  },
  { _id: false }
);
const commentSchema = new mongoose.Schema(
  {
    id: String,
    text: String,
    author: String,
    likes: Number,
    timestamp: Date,
    replies: Number,
    sentiment: String, // Change this from object to string
    isSpam: Boolean,
  },
  { _id: false }
);

const HashtagSchema = new Schema<IHashtag>({
  tag: { type: String, required: true },
  count: { type: Number, required: true },
});

const SentimentSchema = new Schema<ISentimentAnalysis>({
  positive: { type: Number, required: true },
  negative: { type: Number, required: true },
  neutral: { type: Number, required: true },
  overall: {
    type: String,
    enum: ["positive", "negative", "neutral"],
    required: true,
  },
  score: { type: Number, required: true },
});
const ProfileDataSchema = new Schema<IProfileData>(
  {
    id: String,
    username: String,
    fullName: String,
    biography: String,
    externalUrl: String,
    followersCount: Number,
    followsCount: Number,
    hasChannel: Boolean,
    highlightReelCount: Number,
    isBusinessAccount: Boolean,
    joinedRecently: Boolean,
    businessCategoryName: String,
    private: Boolean,
    verified: Boolean,
    profilePicUrl: String,
    profilePicUrlHD: String,
    facebookPage: String,
    igtvVideoCount: Number,
    postsCount: Number,
    avgLikesPerPost: Number,
    avgCommentsPerPost: Number,
    engagementRate: Number,
    contentCategories: [String],
    postingFrequency: String,
    audienceGrowthRate: Number,
  },
  { _id: false }
);

const ProfileAnalysisSchema = new Schema(
  {
    influencerTier: String,
    accountHealth: {
      followRatio: Number,
      postsToFollowersRatio: Number,
      avgEngagementRate: Number,
    },
    contentStrategy: {
      isBusinessAccount: Boolean,
      isVerified: Boolean,
      hasExternalLink: Boolean,
      usesStories: Boolean,
      usesIGTV: Boolean,
      postingFrequency: String,
      contentCategories: [String],
    },
    reelPerformance: {
      viewToFollowerRatio: Number,
      likeToFollowerRatio: Number,
      commentToFollowerRatio: Number,
    },
  },
  { _id: false }
);
const ReelSchema = new Schema<IReel>({
  url: { type: String, required: true, unique: true },
  reelId: { type: String, required: true },
  username: { type: String, required: true },
  userProfilePic: { type: String, default: "" },
  userFollowers: { type: Number },
  userFollowing: { type: Number },
  userPostsCount: { type: Number },

  caption: { type: String, default: "" },
  viewCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  sharesCount: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  postDate: { type: Date, required: true },
  thumbnailUrl: { type: String, default: "" },

  engagementRate: { type: Number, default: 0 },
  comments: [commentSchema],
  hashtags: [HashtagSchema],

  captionSentiment: { type: SentimentSchema },
  commentsSentiment: { type: SentimentSchema },
  overallSentiment: { type: SentimentSchema },
  profileData: { type: ProfileDataSchema },
  profileAnalysis: { type: ProfileAnalysisSchema },
  strategicInsights: { type: StrategicInsightsSchema }, // Add this line

  topComments: [commentSchema],
  spamCommentsCount: { type: Number, default: 0 },
  wordCloud: [{ word: String, count: Number }],
  category: { type: String },
  viralityScore: { type: Number },

  lastUpdated: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export type IReelLean = Omit<IReel, keyof Document> & {
  _id: string;
  __v?: number;
};

// Index for better query performance
// ReelSchema.index({ url: 1 });
// ReelSchema.index({ username: 1 });
// ReelSchema.index({ postDate: -1 });

export default mongoose.models.Reel ||
  mongoose.model<IReel>("Reel", ReelSchema);
