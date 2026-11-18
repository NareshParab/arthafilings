export function LeadsBarChart({ data }: { data: { date: string; label: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="flex h-36 items-stretch gap-3">
      {data.map((day) => {
        const heightPct = Math.max(4, Math.round((day.count / max) * 100));
        return (
          <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="flex w-full flex-1 items-end"
              title={`${day.count} lead${day.count === 1 ? "" : "s"} on ${day.label}`}
            >
              <div
                className="w-full rounded-t-sm bg-primary transition-[height]"
                style={{ height: `${heightPct}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{day.label}</span>
          </div>
        );
      })}
    </div>
  );
}
