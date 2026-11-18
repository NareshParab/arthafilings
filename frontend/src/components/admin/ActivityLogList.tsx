import type { ActivityLogEntry } from "@/types/admin";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ActivityLogList({ entries }: { entries: ActivityLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  const sorted = [...entries].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <ol className="space-y-3">
      {sorted.map((entry) => (
        <li key={entry.id} className="flex gap-3 text-sm">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <div>
            <p className="text-foreground">
              <span className="font-medium">{entry.actorName}</span> — {entry.action}
            </p>
            <p className="text-xs text-muted-foreground">{formatWhen(entry.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
