"use client";

type Item = { label: string; value: string };
export function StatsMarquee({ items }: { items: Item[] }) {
  const list = [...items, ...items];
  return (
    <div className="relative overflow-hidden">
      <div className="flex whitespace-nowrap gap-6 will-change-transform animate-marquee">
        {list.map((it, i) => (
          <div
            key={i}
            className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground"
          >
            <span className="font-medium mr-2">{it.label}</span>
            <span className="opacity-80">{it.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
