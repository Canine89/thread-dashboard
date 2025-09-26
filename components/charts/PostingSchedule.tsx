"use client";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Cell = { dow: number; hour: number; count: number };
const dayLabels = ["일", "월", "화", "수", "목", "금", "토"];

export function PostingSchedule({ data }: { data: Cell[] }) {
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const c of data) grid[c.dow][c.hour] = c.count;

  const color = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/60";
    return "bg-primary";
  };

  return (
    <div className="w-full">
      <div className="text-sm text-muted-foreground mb-2">요일 × 시간대 업로드 현황</div>
      <TooltipProvider>
        <div className="space-y-2">
          {grid.map((row, dow) => (
            <div key={dow} className="flex items-center gap-2">
              <div className="w-8 text-xs text-right text-muted-foreground">{dayLabels[dow]}</div>
              <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(24, 1fr)", width: "100%" }}>
                {row.map((count, hour) => (
                  <Tooltip key={hour}>
                    <TooltipTrigger asChild>
                      <div className={`h-4 rounded ${color(count)}`} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs">{dayLabels[dow]} {hour}:00 - {count}건</div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </TooltipProvider>
      <div className="mt-2 flex justify-end gap-2 items-center text-xs text-muted-foreground">
        <span>빈도</span>
        <div className="h-3 w-4 rounded bg-muted" />
        <div className="h-3 w-4 rounded bg-primary/30" />
        <div className="h-3 w-4 rounded bg-primary/60" />
        <div className="h-3 w-4 rounded bg-primary" />
      </div>
    </div>
  );
}
