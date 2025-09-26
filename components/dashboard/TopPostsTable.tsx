import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThreadPost } from "@/lib/types";

export function TopPostsTable({ posts }: { posts: ThreadPost[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Post</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Likes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="max-w-[420px] truncate">
                <a className="underline" href={p.permalink} target="_blank" rel="noreferrer">{p.text || p.id}</a>
              </TableCell>
              <TableCell>{new Date(p.created_time).toLocaleString()}</TableCell>
              <TableCell className="text-right">{p.like_count}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
