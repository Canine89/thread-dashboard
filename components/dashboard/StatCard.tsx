import { Card } from "@/components/ui/card";

type Props = { label: string; value: string | number; sub?: string };
export function StatCard({ label, value, sub }: Props) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <div className="text-muted-foreground text-sm">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </Card>
  );
}
