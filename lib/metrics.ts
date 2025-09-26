import { ThreadPost, Metrics } from "./types";
import { formatISO, startOfDay } from "date-fns";

export function computeMetrics(posts: ThreadPost[]): Metrics {
  const totalsLikes = posts.reduce((sum, post) => sum + (post.like_count || 0), 0);
  const byDate = new Map<string, number>();
  const likesByHour = new Array<number>(24).fill(0);
  const grid = Array.from({ length: 7 }, () => new Array<number>(24).fill(0));

  for (const post of posts) {
    const createdAt = new Date(post.created_time);
    const dayKey = formatISO(startOfDay(createdAt), { representation: "date" });
    byDate.set(dayKey, (byDate.get(dayKey) || 0) + post.like_count);
    likesByHour[createdAt.getHours()] += post.like_count;
    grid[createdAt.getDay()][createdAt.getHours()] += 1;
  }

  const timeSeries = Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, likes]) => ({ date, likes }));

  const topPosts = [...posts]
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 10);

  const postingGrid = grid.flatMap((row, dow) =>
    row.map((count, hour) => ({ dow, hour, count }))
  );

  return {
    totals: {
      posts: posts.length,
      likes: totalsLikes,
      avgLikesPerPost: posts.length
        ? Math.round((totalsLikes / posts.length) * 10) / 10
        : 0,
    },
    timeSeries,
    byHour: likesByHour.map((likes, hour) => ({ hour, likes })),
    topPosts,
    postingGrid,
    generatedAt: new Date().toISOString(),
  };
}
