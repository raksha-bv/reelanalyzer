import axios from "axios";
import * as cheerio from "cheerio";

export interface ScrapedReelData {
  reelId: string;
  username: string;
  userProfilePic: string;
  userFollowers?: number;
  userFollowing?: number;
  userPostsCount?: number;
  caption: string;
  viewCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  duration: number;
  postDate: Date;
  thumbnailUrl: string;
  comments: Array<{
    id: string;
    text: string;
    author: string;
    likes: number;
    timestamp: Date;
    replies: number;
  }>;
}

// Simple profile interface for basic user info from reel data
export interface BasicProfileData {
  username: string;
  userProfilePic: string;
  userFollowers?: number;
  userFollowing?: number;
  userPostsCount?: number;
}

interface ApifyReelResponse {
  shortCode?: string;
  id?: string;
  ownerUsername?: string;
  ownerProfilePicUrl?: string;
  ownerFollowersCount?: number;
  ownerFollowingCount?: number;
  ownerPostsCount?: number;
  caption?: string;
  videoViewCount?: number;
  videoPlayCount?: number;
  likesCount?: number;
  commentsCount?: number;
  videoDuration?: number;
  timestamp?: string;
  displayUrl?: string;
  images?: string[];
  latestComments?: Array<{
    id?: string;
    text?: string;
    ownerUsername?: string;
    owner?: { username?: string };
    likesCount?: number;
    timestamp?: string;
    repliesCount?: number;
  }>;
}

interface InstagramSharedData {
  entry_data?: {
    PostPage?: Array<{
      graphql?: {
        shortcode_media?: {
          shortcode?: string;
          id?: string;
          owner?: {
            username?: string;
            profile_pic_url?: string;
            edge_followed_by?: { count?: number };
            edge_follow?: { count?: number };
          };
          edge_media_to_caption?: {
            edges?: Array<{
              node?: { text?: string };
            }>;
          };
          video_view_count?: number;
          playCount?: number;
          edge_media_preview_like?: { count?: number };
          edge_media_to_comment?: {
            count?: number;
            edges?: Array<{
              node?: {
                id?: string;
                text?: string;
                owner?: { username?: string };
                edge_liked_by?: { count?: number };
                created_at?: number;
                edge_threaded_comments?: { count?: number };
              };
            }>;
          };
          video_duration?: number;
          videoDuration?: number;
          taken_at_timestamp?: number;
          timestamp?: string;
          display_url?: string;
          thumbnailUrl?: string;
        };
      };
    }>;
  };
}

// Add proper type for RapidAPI response
interface RapidAPIResponse {
  shortcode?: string;
  id?: string;
  owner?: {
    username?: string;
    profile_pic_url?: string;
    edge_followed_by?: { count?: number };
    edge_follow?: { count?: number };
  };
  username?: string;
  profilePicUrl?: string;
  edge_media_to_caption?: {
    edges?: Array<{
      node?: { text?: string };
    }>;
  };
  caption?: string;
  video_view_count?: number;
  playCount?: number;
  edge_media_preview_like?: { count?: number };
  likesCount?: number;
  edge_media_to_comment?: {
    count?: number;
    edges?: Array<{
      node?: {
        id?: string;
        text?: string;
        owner?: { username?: string };
        edge_liked_by?: { count?: number };
        created_at?: number;
        edge_threaded_comments?: { count?: number };
      };
    }>;
  };
  commentsCount?: number;
  video_duration?: number;
  videoDuration?: number;
  taken_at_timestamp?: number;
  timestamp?: string;
  display_url?: string;
  thumbnailUrl?: string;
}

class InstagramScraper {
  private rapidApiKey: string;
  private apifyToken: string;

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || "";
    this.apifyToken = process.env.APIFY_API_KEY || "";
  }

  extractReelId(url: string): string {
    const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : "";
  }

  async scrapeWithRapidAPI(url: string): Promise<ScrapedReelData> {
    try {
      const options = {
        method: "GET" as const,
        url: "https://instagram-scraper-api2.p.rapidapi.com/v1/post_info",
        params: { code_or_id_or_url: url },
        headers: {
          "X-RapidAPI-Key": this.rapidApiKey,
          "X-RapidAPI-Host": "instagram-scraper-api2.p.rapidapi.com",
        },
      };

      const response = await axios.request(options);
      const data = response.data.data;

      return this.formatReelData(data);
    } catch (error) {
      console.error("RapidAPI scraping failed:", error);
      throw new Error("Failed to scrape with RapidAPI");
    }
  }

  async scrapeWithApify(url: string): Promise<ScrapedReelData> {
    try {
      const runInput = {
        directUrls: [url],
        resultsType: "posts",
        resultsLimit: 1,
        addParentData: true,
      };

      const response = await axios.post(
        `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${this.apifyToken}`,
        runInput,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 300000,
        }
      );

      const data = response.data;
      if (!data || data.length === 0) {
        throw new Error("No reel data returned");
      }

      const reelData = data[0];
      return this.formatApifyReelData(reelData);
    } catch (error) {
      console.error("Apify scraping failed:", error);
      throw new Error("Failed to scrape with Apify");
    }
  }

  private formatApifyReelData(reelData: ApifyReelResponse): ScrapedReelData {
    console.log("=== REEL DATA ANALYSIS ===");
    console.log("Available reel data keys:", Object.keys(reelData));
    console.log("Owner username:", reelData.ownerUsername);
    console.log("Owner followers:", reelData.ownerFollowersCount);

    return {
      reelId: reelData.shortCode || reelData.id || "",
      username: reelData.ownerUsername || "",
      userProfilePic: reelData.ownerProfilePicUrl || "",
      userFollowers: reelData.ownerFollowersCount,
      userFollowing: reelData.ownerFollowingCount,
      userPostsCount: reelData.ownerPostsCount,
      caption: reelData.caption || "",
      viewCount: reelData.videoViewCount || reelData.videoPlayCount || 0,
      likesCount: reelData.likesCount || 0,
      commentsCount: reelData.commentsCount || 0,
      sharesCount: 0,
      duration: reelData.videoDuration || 0,
      postDate: new Date(reelData.timestamp || Date.now()),
      thumbnailUrl: reelData.displayUrl || reelData.images?.[0] || "",
      comments: this.formatApifyComments(reelData.latestComments || []),
    };
  }

  private formatApifyComments(
    commentsData: ApifyReelResponse["latestComments"]
  ): ScrapedReelData["comments"] {
    return (commentsData || []).slice(0, 20).map((comment, index) => ({
      id: comment?.id || index.toString(),
      text: comment?.text || "",
      author: comment?.ownerUsername || comment?.owner?.username || "",
      likes: comment?.likesCount || 0,
      timestamp: new Date(comment?.timestamp || Date.now()),
      replies: comment?.repliesCount || 0,
    }));
  }

  async scrapeBasic(url: string): Promise<ScrapedReelData> {
    try {
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const $ = cheerio.load(response.data);

      let jsonData: InstagramSharedData | null = null;
      $("script").each((_index, element) => {
        const content = $(element).html();
        if (content && content.includes("window._sharedData")) {
          try {
            const match = content.match(/window\._sharedData = ({.*?});/);
            if (match) {
              jsonData = JSON.parse(match[1]);
            }
          } catch {
            // Continue searching
          }
        }
      });

      if (!jsonData) {
        throw new Error("Could not extract Instagram data");
      }

      return this.parseInstagramData(jsonData);
    } catch (error) {
      console.error("Basic scraping failed:", error);
      throw new Error("Failed to scrape Instagram data");
    }
  }

  // Main scraping method - simplified to return only reel data
  async scrapeReel(url: string): Promise<ScrapedReelData> {
    const reelId = this.extractReelId(url);
    if (!reelId) {
      throw new Error("Invalid Instagram Reel URL");
    }

    const methods = [
      { name: "Apify", fn: () => this.scrapeWithApify(url) },
      { name: "Basic", fn: () => this.scrapeBasic(url) },
    ];

    let reelData: ScrapedReelData | undefined;
    let lastError: unknown;

    for (const method of methods) {
      try {
        console.log(`Trying ${method.name} scraping method...`);
        reelData = await method.fn();
        if (reelData) {
          console.log(`${method.name} scraping successful`);
          break;
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        console.log(`${method.name} scraping failed:`, errorMessage);
        lastError = error;
        continue;
      }
    }

    if (!reelData) {
      const errorMessage =
        lastError instanceof Error ? lastError.message : "Unknown error";
      throw new Error(
        `All scraping methods failed. Last error: ${errorMessage}`
      );
    }

    return reelData;
  }

  // Fixed the formatReelData method to use proper typing
  private formatReelData(rawData: unknown): ScrapedReelData {
    // Type guard to ensure we have the expected structure
    if (!rawData || typeof rawData !== "object") {
      throw new Error("Invalid data structure received from API");
    }

    const data = rawData as RapidAPIResponse;

    return {
      reelId: data.shortcode || data.id || "",
      username: data.owner?.username || data.username || "",
      userProfilePic: data.owner?.profile_pic_url || data.profilePicUrl || "",
      userFollowers: data.owner?.edge_followed_by?.count,
      userFollowing: data.owner?.edge_follow?.count,
      caption:
        data.edge_media_to_caption?.edges?.[0]?.node?.text ||
        data.caption ||
        "",
      viewCount: data.video_view_count || data.playCount || 0,
      likesCount: data.edge_media_preview_like?.count || data.likesCount || 0,
      commentsCount:
        data.edge_media_to_comment?.count || data.commentsCount || 0,
      sharesCount: 0,
      duration: data.video_duration || data.videoDuration || 0,
      postDate: new Date(
        data.taken_at_timestamp
          ? data.taken_at_timestamp * 1000
          : data.timestamp
          ? new Date(data.timestamp).getTime()
          : Date.now()
      ),
      thumbnailUrl: data.display_url || data.thumbnailUrl || "",
      comments: this.formatComments(data.edge_media_to_comment?.edges || []),
    };
  }

  private formatComments(
    commentsData: Array<{
      node?: {
        id?: string;
        text?: string;
        owner?: { username?: string };
        edge_liked_by?: { count?: number };
        created_at?: number;
        edge_threaded_comments?: { count?: number };
      };
    }>
  ): ScrapedReelData["comments"] {
    return commentsData.slice(0, 20).map((comment, index) => ({
      id: comment.node?.id || index.toString(),
      text: comment.node?.text || "",
      author: comment.node?.owner?.username || "",
      likes: comment.node?.edge_liked_by?.count || 0,
      timestamp: new Date(
        comment.node?.created_at ? comment.node.created_at * 1000 : Date.now()
      ),
      replies: comment.node?.edge_threaded_comments?.count || 0,
    }));
  }

  private parseInstagramData(sharedData: InstagramSharedData): ScrapedReelData {
    const postData =
      sharedData.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;

    if (!postData) {
      throw new Error("Could not find post data");
    }

    return {
      reelId: postData.shortcode || postData.id || "",
      username: postData.owner?.username || "",
      userProfilePic: postData.owner?.profile_pic_url || "",
      userFollowers: postData.owner?.edge_followed_by?.count,
      userFollowing: postData.owner?.edge_follow?.count,
      caption: postData.edge_media_to_caption?.edges?.[0]?.node?.text || "",
      viewCount: postData.video_view_count || postData.playCount || 0,
      likesCount: postData.edge_media_preview_like?.count || 0,
      commentsCount: postData.edge_media_to_comment?.count || 0,
      sharesCount: 0,
      duration: postData.video_duration || postData.videoDuration || 0,
      postDate: new Date(
        postData.taken_at_timestamp
          ? postData.taken_at_timestamp * 1000
          : postData.timestamp
          ? new Date(postData.timestamp).getTime()
          : Date.now()
      ),
      thumbnailUrl: postData.display_url || postData.thumbnailUrl || "",
      comments: this.formatComments(
        postData.edge_media_to_comment?.edges || []
      ),
    };
  }

  // Helper method to extract basic profile info from reel data
  extractBasicProfile(reelData: ScrapedReelData): BasicProfileData {
    return {
      username: reelData.username,
      userProfilePic: reelData.userProfilePic,
      userFollowers: reelData.userFollowers,
      userFollowing: reelData.userFollowing,
      userPostsCount: reelData.userPostsCount,
    };
  }
}

export default InstagramScraper;
