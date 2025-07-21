// types/ReelAnalyzer.types.ts
export type Sentiment = {
  positive: number;
  negative: number;
  neutral: number;
  overall: string;
  score: number;
};

export type Comment = {
  text: string;
  author: string;
  likes: number;
  sentiment: string;
};

export type WordCloudItem = {
  word: string;
  count: number;
};

export type HashtagItem = {
  tag: string;
  count: number;
};

export type ReelData = {
  username: string;
  userProfilePic: string;
  caption: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  duration: number;
  postDate: string;
  engagementRate: number;
  viralityScore: number;
  category: string;
  captionSentiment: Sentiment;
  commentsSentiment: Sentiment;
  overallSentiment: Sentiment;
  topComments: Comment[];
  wordCloud: WordCloudItem[];
  hashtags: HashtagItem[];
  spamCommentsCount: number;
};
