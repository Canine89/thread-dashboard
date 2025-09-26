export type ThreadPost = {
  id: string;
  created_time: string; // ISO
  text?: string;
  like_count: number;
  permalink?: string;
};

export type Metrics = {
  totals: {
    posts: number;
    likes: number;
    avgLikesPerPost: number;
  };
  timeSeries: Array<{ date: string; likes: number }>;
  byHour: Array<{ hour: number; likes: number }>;
  topPosts: Array<ThreadPost>;
  postingGrid: Array<{ dow: number; hour: number; count: number }>; // 0=Sun..6=Sat
  generatedAt: string;
};
