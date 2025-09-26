import { NextResponse } from "next/server";
import type { Metrics, ThreadPost } from "@/lib/types";
import { getRecentPosts } from "@/lib/threads";
import { computeMetrics } from "@/lib/metrics";
import { readMetricsCache, writeMetricsCache } from "@/lib/cache";

export const revalidate = 0;

export async function GET() {
  try {
    const useMock = !process.env.THREADS_ACCESS_TOKEN;
    let posts: ThreadPost[];
    if (useMock) {
      const mock = await import("@/data/mock/likes-sample.json");
      posts = mock.default as ThreadPost[];
    } else {
      posts = await getRecentPosts(50);
    }
    const metrics = computeMetrics(posts);
    writeMetricsCache(metrics);
    return NextResponse.json({ posts, metrics });
  } catch (e) {
    const cached = readMetricsCache<Metrics>();
    if (cached) {
      return NextResponse.json(
        { posts: [], metrics: cached, cached: true },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}
