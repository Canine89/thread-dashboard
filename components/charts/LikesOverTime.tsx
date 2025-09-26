"use client";

type Point = { date: string; likes: number };

export function LikesOverTime({ data }: { data: Point[] }) {
  // Fixed virtual canvas; SVG scales to container via CSS width/height
  const canvasWidth = 1000;
  const canvasHeight = 256;
  const padding = { top: 12, right: 16, bottom: 24, left: 36 };
  const w = canvasWidth - padding.left - padding.right;
  const h = canvasHeight - padding.top - padding.bottom;

  const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date));
  const maxLikes = Math.max(1, ...sorted.map((d) => d.likes));
  const xStep = sorted.length > 1 ? w / (sorted.length - 1) : 0;
  const yScale = (v: number) => h - (v / maxLikes) * h;

  const pathD = sorted
    .map((d, i) => {
      const x = i * xStep;
      const y = yScale(d.likes);
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxLikes * i) / 4));
  const xTicksCount = Math.min(6, Math.max(1, sorted.length));
  const xTickEvery = Math.max(1, Math.floor(sorted.length / xTicksCount));

  return (
    <div className="h-64 w-full">
      <svg
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        width="100%"
        height="100%"
        role="img"
        aria-label="Likes over time"
      >
        <g transform={`translate(${padding.left},${padding.top})`}>
          {yTicks.map((t) => (
            <line
              key={`y-${t}`}
              x1={0}
              x2={w}
              y1={yScale(t)}
              y2={yScale(t)}
              stroke="var(--border)"
              strokeDasharray="3 3"
            />
          ))}

          {sorted.map((d, i) => {
            if (i % xTickEvery !== 0 && i !== sorted.length - 1) return null;
            const x = i * xStep;
            return (
              <g key={`x-${i}`} transform={`translate(${x}, ${h})`}>
                <line y2={6} stroke="var(--border)" />
                <text y={18} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
                  {d.date}
                </text>
              </g>
            );
          })}

          {yTicks.map((t) => (
            <g key={`yt-${t}`}>
              <line x1={-6} x2={0} y1={yScale(t)} y2={yScale(t)} stroke="var(--border)" />
              <text x={-10} y={yScale(t)} dy="0.32em" fontSize={10} textAnchor="end" fill="var(--muted-foreground)">
                {t}
              </text>
            </g>
          ))}

          <path d={pathD} fill="none" stroke="var(--chart-1, var(--primary))" strokeWidth={2} />
        </g>
      </svg>
    </div>
  );
}
