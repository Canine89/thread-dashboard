import { StatCard } from "@/components/dashboard/StatCard";
import { StatsMarquee } from "@/components/dashboard/StatsMarquee";
import { LikesOverTime } from "@/components/charts/LikesOverTime";
import { PostingSchedule } from "@/components/charts/PostingSchedule";
import { TopPostsTable } from "@/components/dashboard/TopPostsTable";
import { getRecentPosts } from "@/lib/threads";
import { computeMetrics } from "@/lib/metrics";
import { readMetricsCache, writeMetricsCache } from "@/lib/cache";
import type { Metrics } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getMetrics() {
  try {
    const useMock = !process.env.THREADS_ACCESS_TOKEN;
    let posts;
    if (useMock) {
      const mock = await import("@/data/mock/likes-sample.json");
      posts = mock.default;
    } else {
      posts = await getRecentPosts(50);
    }
    const metrics = computeMetrics(posts);
    writeMetricsCache(metrics);
    return { posts, metrics };
  } catch (e) {
    const cached = readMetricsCache<Metrics>();
    if (cached) {
      return { posts: [], metrics: cached, cached: true };
    }
    throw new Error(
      `Failed to load metrics: ${e instanceof Error ? e.message : "Unknown error"}`
    );
  }
}

export default async function Page() {
  const { metrics } = await getMetrics();
  const marqueeItems = [
    { label: "총 좋아요", value: String(metrics.totals.likes) },
    { label: "평균/게시물", value: String(metrics.totals.avgLikesPerPost) },
    { label: "게시물 수", value: String(metrics.totals.posts) },
    { label: "생성", value: new Date(metrics.generatedAt).toLocaleString() },
  ];
  return (
    <div className="container mx-auto p-6 flex flex-col gap-6">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold mb-2">Threads 좋아요 분석 대시보드</h1>
        <p className="text-muted-foreground">@limedaddy_8924의 Threads 활동 분석</p>
      </div>
      
      <StatsMarquee items={marqueeItems} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="총 좋아요" value={metrics.totals.likes} />
        <StatCard label="평균/게시물" value={metrics.totals.avgLikesPerPost} />
        <StatCard label="게시물 수" value={metrics.totals.posts} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">시간별 좋아요 추이</h2>
          <LikesOverTime data={metrics.timeSeries} />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">업로드 시간표 (요일 × 시간)</h2>
          <PostingSchedule data={metrics.postingGrid} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">인기 게시물 TOP 5</h2>
        <TopPostsTable posts={metrics.topPosts.slice(0, 5)} />
      </div>
    </div>
  );
}
