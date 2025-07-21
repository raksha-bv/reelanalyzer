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

export interface ScrapedProfileData {
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

class InstagramScraper {
  private rapidApiKey: string;
  private apifyToken: string;

  constructor() {
    this.rapidApiKey = process.env.RAPIDAPI_KEY || "";
    this.apifyToken = process.env.APIFY_API_KEY || "";
  }

  // Extract reel ID from URL
  extractReelId(url: string): string {
    const match = url.match(/\/reel\/([A-Za-z0-9_-]+)/);
    return match ? match[1] : "";
  }
  // Replace your scrapeProfile method with better debugging:
  async scrapeProfile(username: string): Promise<ScrapedProfileData> {
    try {
      const runInput = {
        usernames: [username],
        resultsType: "details",
        resultsLimit: 1,
        addParentData: true,
      };

      console.log(`=== PROFILE SCRAPING DEBUG ===`);
      console.log(`Username: ${username}`);
      console.log(`Apify Token exists: ${!!this.apifyToken}`);
      console.log(`Run input:`, JSON.stringify(runInput, null, 2));

      const response = await axios.post(
        `https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items?token=${this.apifyToken}`,
        runInput,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 300000,
        }
      );

      console.log(`Response status: ${response.status}`);
      console.log(`Response data:`, JSON.stringify(response.data, null, 2));

      const data = response.data;
      if (!data || data.length === 0) {
        console.log(
          `No profile data returned for ${username} - trying alternative approach`
        );
        throw new Error(`No profile data returned for ${username}`);
      }

      const profileData = data[0];
      console.log(`Profile data found:`, Object.keys(profileData));
      return this.formatProfileData(profileData);
    } catch (error: any) {
      console.error("Profile scraping failed:", error.message);
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
      throw error;
    }
  }

  private formatProfileData(profileData: any): ScrapedProfileData {
    // Calculate additional metrics
    const avgLikesPerPost = profileData.latestPosts
      ? profileData.latestPosts.reduce(
          (sum: number, post: any) => sum + (post.likesCount || 0),
          0
        ) / profileData.latestPosts.length
      : 0;

    const avgCommentsPerPost = profileData.latestPosts
      ? profileData.latestPosts.reduce(
          (sum: number, post: any) => sum + (post.commentsCount || 0),
          0
        ) / profileData.latestPosts.length
      : 0;

    const engagementRate =
      profileData.followersCount > 0
        ? ((avgLikesPerPost + avgCommentsPerPost) /
            profileData.followersCount) *
          100
        : 0;

    return {
      id: profileData.id || "",
      username: profileData.username || "",
      fullName: profileData.fullName || "",
      biography: profileData.biography || "",
      externalUrl: profileData.externalUrl,
      followersCount: profileData.followersCount || 0,
      followsCount: profileData.followsCount || 0,
      hasChannel: profileData.hasChannel || false,
      highlightReelCount: profileData.highlightReelCount || 0,
      isBusinessAccount: profileData.isBusinessAccount || false,
      joinedRecently: profileData.joinedRecently || false,
      businessCategoryName: profileData.businessCategoryName,
      private: profileData.private || false,
      verified: profileData.verified || false,
      profilePicUrl: profileData.profilePicUrl || "",
      profilePicUrlHD:
        profileData.profilePicUrlHD || profileData.profilePicUrl || "",
      facebookPage: profileData.facebookPage,
      igtvVideoCount: profileData.igtvVideoCount || 0,
      postsCount: profileData.postsCount || 0,
      avgLikesPerPost,
      avgCommentsPerPost,
      engagementRate,
      contentCategories: this.analyzeContentCategories(
        profileData.latestPosts || []
      ),
      postingFrequency: this.calculatePostingFrequency(
        profileData.latestPosts || []
      ),
    };
  }

  private analyzeContentCategories(posts: any[]): string[] {
    const categories = new Set<string>();

    posts.forEach((post) => {
      const caption = (post.caption || "").toLowerCase();

      // Simple keyword-based categorization
      if (
        caption.includes("food") ||
        caption.includes("recipe") ||
        caption.includes("cooking")
      ) {
        categories.add("Food & Cooking");
      }
      if (
        caption.includes("travel") ||
        caption.includes("vacation") ||
        caption.includes("explore")
      ) {
        categories.add("Travel");
      }
      if (
        caption.includes("fitness") ||
        caption.includes("workout") ||
        caption.includes("gym")
      ) {
        categories.add("Fitness");
      }
      if (
        caption.includes("fashion") ||
        caption.includes("style") ||
        caption.includes("outfit")
      ) {
        categories.add("Fashion");
      }
      if (
        caption.includes("tech") ||
        caption.includes("gadget") ||
        caption.includes("review")
      ) {
        categories.add("Technology");
      }
      if (
        caption.includes("music") ||
        caption.includes("song") ||
        caption.includes("concert")
      ) {
        categories.add("Music");
      }
      // Add more categories as needed
    });

    return Array.from(categories);
  }

  private calculatePostingFrequency(posts: any[]): string {
    if (posts.length < 2) return "Unknown";

    const timestamps = posts
      .map((post) => new Date(post.timestamp))
      .sort((a, b) => b.getTime() - a.getTime());

    const daysDiff =
      (timestamps[0].getTime() - timestamps[timestamps.length - 1].getTime()) /
      (1000 * 60 * 60 * 24);
    const avgDaysBetweenPosts = daysDiff / (posts.length - 1);

    if (avgDaysBetweenPosts <= 1) return "Daily";
    if (avgDaysBetweenPosts <= 3) return "3x per week";
    if (avgDaysBetweenPosts <= 7) return "Weekly";
    if (avgDaysBetweenPosts <= 14) return "Bi-weekly";
    return "Monthly";
  }

  // RapidAPI approach
  async scrapeWithRapidAPI(url: string): Promise<ScrapedReelData> {
    try {
      const options = {
        method: "GET",
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

  // Apify approach
  // Replace the existing scrapeWithApify method
  async scrapeWithApify(url: string): Promise<ScrapedReelData> {
    try {
      const runInput = {
        directUrls: [url],
        resultsType: "posts",
        resultsLimit: 1,
        addParentData: true, // Change this to true to get owner data
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
      return this.formatApifyReelData(reelData, url);
    } catch (error) {
      console.error("Apify scraping failed:", error);
      throw new Error("Failed to scrape with Apify");
    }
  }
  // Add this method to your InstagramScraper class:
  private extractProfileFromReelData(
    reelData: any,
    scrapedReel: ScrapedReelData
  ): ScrapedProfileData {
    console.log("=== EXTRACTING PROFILE FROM REEL DATA ===");
    console.log("Reel data keys:", Object.keys(reelData));

    // Try to extract from different possible locations in the response
    const ownerData = reelData.owner || reelData.user || {};

    return {
      id: ownerData.pk || ownerData.id || "",
      username: scrapedReel.username,
      fullName:
        ownerData.full_name || ownerData.fullName || scrapedReel.username,
      biography: ownerData.biography || "",
      externalUrl: ownerData.external_url || ownerData.externalUrl,
      followersCount:
        scrapedReel.userFollowers || ownerData.follower_count || 0,
      followsCount: scrapedReel.userFollowing || ownerData.following_count || 0,
      hasChannel: ownerData.has_channel || false,
      highlightReelCount: ownerData.highlight_reel_count || 0,
      isBusinessAccount:
        ownerData.is_business_account || ownerData.isBusinessAccount || false,
      joinedRecently: ownerData.joined_recently || false,
      businessCategoryName:
        ownerData.business_category_name || ownerData.businessCategoryName,
      private: ownerData.is_private || ownerData.private || false,
      verified: ownerData.is_verified || ownerData.verified || false,
      profilePicUrl:
        scrapedReel.userProfilePic || ownerData.profile_pic_url || "",
      profilePicUrlHD:
        ownerData.profile_pic_url_hd || scrapedReel.userProfilePic || "",
      facebookPage: ownerData.facebook_page,
      igtvVideoCount: ownerData.igtv_video_count || 0,
      postsCount: scrapedReel.userPostsCount || ownerData.media_count || 0,
    };
  }
  // Add method to format Apify-specific data
  private formatApifyReelData(
    reelData: any,
    originalUrl: string
  ): ScrapedReelData {
    console.log("=== REEL DATA ANALYSIS ===");
    console.log("Available reel data keys:", Object.keys(reelData));
    console.log("Owner data:", reelData.owner || "No owner data");
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
  private formatApifyComments(commentsData: any[]): any[] {
    return commentsData.slice(0, 20).map((comment: any, index: number) => ({
      id: comment.id || index.toString(),
      text: comment.text || "",
      author: comment.ownerUsername || comment.owner?.username || "",
      likes: comment.likesCount || 0,
      timestamp: new Date(comment.timestamp || Date.now()),
      replies: comment.repliesCount || 0,
    }));
  }

  // Fallback: Basic web scraping approach
  async scrapeBasic(url: string): Promise<ScrapedReelData> {
    try {
      // Add user agent to avoid blocking
      const response = await axios.get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      const $ = cheerio.load(response.data);

      // Extract JSON data from script tags
      let jsonData = null;
      $("script").each((_, element) => {
        const content = $(element).html();
        if (content && content.includes("window._sharedData")) {
          try {
            const match = content.match(/window\._sharedData = ({.*?});/);
            if (match) {
              jsonData = JSON.parse(match[1]);
            }
          } catch (e) {
            // Continue searching
          }
        }
      });

      if (!jsonData) {
        throw new Error("Could not extract Instagram data");
      }

      return this.parseInstagramData(jsonData, url);
    } catch (error) {
      console.error("Basic scraping failed:", error);
      throw new Error("Failed to scrape Instagram data");
    }
  }

  // Main scraping method with fallbacks
  async scrapeReel(
    url: string
  ): Promise<{ reel: ScrapedReelData; profile: ScrapedProfileData }> {
    const reelId = this.extractReelId(url);
    if (!reelId) {
      throw new Error("Invalid Instagram Reel URL");
    }

    // Try methods in order of preference
    const methods = [
      { name: "Apify", fn: () => this.scrapeWithApify(url) },
      { name: "Basic", fn: () => this.scrapeBasic(url) },
    ];

    let reelData: ScrapedReelData;
    let lastError;

    for (const method of methods) {
      try {
        console.log(`Trying ${method.name} scraping method...`);
        reelData = await method.fn();
        if (reelData) {
          console.log(`${method.name} scraping successful`);
          break;
        }
      } catch (error: any) {
        console.log(`${method.name} scraping failed:`, error.message);
        lastError = error;
        continue;
      }
    }

    if (!reelData!) {
      throw new Error(
        `All scraping methods failed. Last error: ${lastError?.message}`
      );
    }

    // Now scrape profile data
    // Replace the profile scraping section in scrapeReel method:
    // Now scrape profile data
    console.log(`Scraping profile for user: ${reelData.username}`);
    let profileData: ScrapedProfileData;

    try {
      profileData = await this.scrapeProfile(reelData.username);
    } catch (error) {
      console.log(
        "Apify profile scraping failed, extracting from reel data..."
      );
      try {
        // Try to extract profile data from the original reel scraping response
        const originalReelData = reelData;
        profileData = this.extractProfileFromReelData(
          originalReelData,
          reelData
        );

        // If still empty, try RapidAPI
        // if (profileData.followersCount === 0 && this.rapidApiKey) {
        //   console.log("Trying RapidAPI for profile data...");
        //   profileData = await this.scrapeProfileWithRapidAPI(reelData.username);
        // }
      } catch (extractError) {
        console.log(
          "All profile scraping methods failed, using minimal fallback"
        );
        // Minimal fallback
        profileData = {
          id: "",
          username: reelData.username,
          fullName: reelData.username,
          biography: "",
          followersCount: reelData.userFollowers || 0,
          followsCount: reelData.userFollowing || 0,
          hasChannel: false,
          highlightReelCount: 0,
          isBusinessAccount: false,
          joinedRecently: false,
          private: false,
          verified: false,
          profilePicUrl: reelData.userProfilePic,
          profilePicUrlHD: reelData.userProfilePic,
          igtvVideoCount: 0,
          postsCount: reelData.userPostsCount || 0,
        };
      }
    }

    return { reel: reelData, profile: profileData };
  }

  private formatReelData(rawData: any): ScrapedReelData {
    // This method needs to be adapted based on the API response structure
    // Each API returns data in different formats

    return {
      reelId: rawData.shortcode || rawData.id || "",
      username: rawData.owner?.username || rawData.username || "",
      userProfilePic:
        rawData.owner?.profile_pic_url || rawData.profilePicUrl || "",
      userFollowers: rawData.owner?.edge_followed_by?.count,
      userFollowing: rawData.owner?.edge_follow?.count,
      caption:
        rawData.edge_media_to_caption?.edges[0]?.node?.text ||
        rawData.caption ||
        "",
      viewCount: rawData.video_view_count || rawData.playCount || 0,
      likesCount:
        rawData.edge_media_preview_like?.count || rawData.likesCount || 0,
      commentsCount:
        rawData.edge_media_to_comment?.count || rawData.commentsCount || 0,
      sharesCount: 0, // Usually not available
      duration: rawData.video_duration || rawData.videoDuration || 0,
      postDate: new Date(
        rawData.taken_at_timestamp * 1000 || rawData.timestamp || Date.now()
      ),
      thumbnailUrl: rawData.display_url || rawData.thumbnailUrl || "",
      comments: this.formatComments(
        rawData.edge_media_to_comment?.edges || rawData.comments || []
      ),
    };
  }

  private formatComments(commentsData: any[]): any[] {
    return commentsData.slice(0, 20).map((comment: any, index: number) => ({
      id: comment.node?.id || comment.id || index.toString(),
      text: comment.node?.text || comment.text || "",
      author: comment.node?.owner?.username || comment.username || "",
      likes: comment.node?.edge_liked_by?.count || comment.likes || 0,
      timestamp: new Date(
        comment.node?.created_at * 1000 || comment.timestamp || Date.now()
      ),
      replies:
        comment.node?.edge_threaded_comments?.count || comment.replies || 0,
    }));
  }

  private parseInstagramData(sharedData: any, url: string): ScrapedReelData {
    // Parse Instagram's _sharedData format
    const postData =
      sharedData.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;

    if (!postData) {
      throw new Error("Could not find post data");
    }

    return this.formatReelData(postData);
  }
}

export default InstagramScraper;
