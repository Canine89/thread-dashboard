import type { ThreadPost } from "./types";

const BASE_URL = process.env.THREADS_GRAPH_BASE_URL || "";
const USER_ID = process.env.THREADS_USER_ID || "";
const ACCESS_TOKEN = process.env.THREADS_ACCESS_TOKEN || "";

function assertEnv() {
  if (!BASE_URL || !USER_ID || !ACCESS_TOKEN) {
    throw new Error(
      "Missing Threads API env vars. Set THREADS_GRAPH_BASE_URL, THREADS_USER_ID, THREADS_ACCESS_TOKEN."
    );
  }
}

async function apiGet<T = unknown>(
  path: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  assertEnv();
  const q = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  );
  const base = `${BASE_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const url = q.toString() ? `${base}?${q.toString()}` : base;

  const res = await fetch(url, {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("Threads API Error:", {
      status: res.status,
      statusText: res.statusText,
      response: text,
      url: url.replace(ACCESS_TOKEN, "***TOKEN***")
    });
    throw new Error(`Threads API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

type InsightsResponse = {
  data?: Array<{ values?: Array<{ value?: number }> }>;
};

type LikesEdgeResponse = {
  summary?: { total_count?: number };
};

async function getLikeCountForPost(postId: string): Promise<number> {
  // Try insights first
  try {
    const insights = await apiGet<InsightsResponse>(`${postId}/insights`, { metric: "likes" });
    const value = insights.data?.[0]?.values?.[0]?.value;
    if (typeof value === "number") return value;
  } catch {
    // ignore and try fallback
  }

  // Fallback to likes summary edge
  try {
    const likesEdge = await apiGet<LikesEdgeResponse>(`${postId}/likes`, { summary: "true", limit: 0 });
    const total = likesEdge.summary?.total_count;
    if (typeof total === "number") return total;
  } catch {
    // ignore
  }

  return 0;
}

type ThreadsApiPost = {
  id: string | number;
  timestamp?: string;
  text?: string;
  shortcode?: string;
};

type ThreadsListResponse = {
  data?: ThreadsApiPost[];
};

export async function getRecentPosts(limit = 50) {
  // Based on official Threads API documentation:
  // https://developers.facebook.com/docs/threads/posts
  const fields = [
    "id",
    "media_product_type",
    "media_type", 
    "text",
    "timestamp",
    "shortcode",
    "thumbnail_url",
    "children",
    "is_quote_post"
  ].join(",");
  
  try {
    // Use the correct endpoint from official docs
    const data = await apiGet<ThreadsListResponse>(`${USER_ID}/threads`, { fields, limit });
    console.log("Threads API Response:", JSON.stringify(data, null, 2));
    
    const posts: ThreadPost[] = (data.data ?? []).map((p: ThreadsApiPost): ThreadPost => ({
      id: String(p.id),
      created_time: p.timestamp || new Date().toISOString(),
      text: p.text || "",
      like_count: 0, // Like count needs separate API call
      permalink: p.shortcode ? `https://www.threads.net/t/${p.shortcode}` : undefined,
    }));
    
    // Get like counts separately if posts exist
    if (posts.length > 0) {
      console.log("Fetching like counts (insights -> likes summary)...");
      const postsWithLikes: ThreadPost[] = await Promise.all(
        posts.map(async (post): Promise<ThreadPost> => ({
          ...post,
          like_count: await getLikeCountForPost(post.id),
        }))
      );
      return postsWithLikes;
    }
    
    return posts;
  } catch (error) {
    console.error("API call failed, trying basic approach...", error);
    
    // Fallback: try with just basic fields
    try {
      const basicFields = "id,text,timestamp";
      const data = await apiGet<ThreadsListResponse>(`${USER_ID}/threads`, { fields: basicFields, limit });
      console.log("Basic API Response:", JSON.stringify(data, null, 2));
      
      const posts: ThreadPost[] = (data.data ?? []).map((p: ThreadsApiPost): ThreadPost => ({
        id: String(p.id),
        created_time: p.timestamp || new Date().toISOString(),
        text: p.text || `Thread ${p.id}`,
        like_count: 0,
        permalink: undefined,
      }));
      return posts;
    } catch (secondError) {
      console.error("Both attempts failed", secondError);
      throw error;
    }
  }
}
