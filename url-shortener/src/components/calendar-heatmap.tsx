import { useState } from "react";
import { motion } from "framer-motion";
import { parseISO, format, startOfWeek, addDays, subWeeks, isAfter, isBefore } from "date-fns";

interface DailyClick {
  date: string;
  count: number;
}

interface CalendarHeatmapProps {
  dailyClicks: DailyClick[];
  weeks?: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
}

const INTENSITY_COLORS = [
  "hsl(var(--muted))",
  "hsl(189,94%,43%,0.2)",
  "hsl(189,94%,43%,0.45)",
  "hsl(189,94%,43%,0.7)",
  "hsl(189,94%,43%,1)",
];

const INTENSITY_LABELS = ["None", "1–2", "3–5", "6–10", "11+"];

export default function CalendarHeatmap({ dailyClicks, weeks = 26 }: CalendarHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const countMap = new Map<string, number>();
  for (const d of dailyClicks) {
    countMap.set(d.date, d.count);
  }

  const today = new Date();
  const endDate = today;
  const startDate = startOfWeek(subWeeks(today, weeks - 1), { weekStartsOn: 0 });

  const grid: Array<Array<{ date: Date; count: number } | null>> = [];

  let cursor = startDate;
  while (!isAfter(cursor, endDate)) {
    const week: Array<{ date: Date; count: number } | null> = [];
    for (let d = 0; d < 7; d++) {
      const dayDate = addDays(cursor, d);
      if (isBefore(dayDate, startDate) || isAfter(dayDate, endDate)) {
        week.push(null);
      } else {
        const key = format(dayDate, "yyyy-MM-dd");
        week.push({ date: dayDate, count: countMap.get(key) ?? 0 });
      }
    }
    grid.push(week);
    cursor = addDays(cursor, 7);
  }

  const monthLabels: Array<{ label: string; col: number }> = [];
  for (let i = 0; i < grid.length; i++) {
    const week = grid[i];
    const firstDay = week.find((d) => d !== null);
    if (!firstDay) continue;
    const dom = firstDay.date.getDate();
    if (dom <= 7) {
      const label = format(firstDay.date, "MMM");
      if (monthLabels.length === 0 || monthLabels[monthLabels.length - 1].label !== label) {
        monthLabels.push({ label, col: i });
      }
    }
  }

  const CELL = 13;
  const GAP = 2;
  const STEP = CELL + GAP;

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto pb-1 relative">
        <div style={{ minWidth: grid.length * STEP + 32 }}>
          <div className="flex" style={{ marginLeft: 28 }}>
            {monthLabels.map((m) => (
              <div
                key={m.col + m.label}
                className="text-[10px] text-muted-foreground absolute"
                style={{ left: 28 + m.col * STEP }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex mt-4 gap-[2px]">
            <div className="flex flex-col gap-[2px] mr-1">
              {DAYS.map((day, i) => (
                <div
                  key={day}
                  className="text-[10px] text-muted-foreground flex items-center justify-end pr-1"
                  style={{ height: CELL, visibility: i % 2 === 1 ? "visible" : "hidden" }}
                >
                  {day}
                </div>
              ))}
            </div>

            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[2px]">
                {week.map((day, di) => {
                  if (!day) {
                    return <div key={di} style={{ width: CELL, height: CELL }} />;
                  }
                  const intensity = getIntensity(day.count);
                  return (
                    <motion.div
                      key={di}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: (wi * 7 + di) * 0.001, duration: 0.2 }}
                      style={{
                        width: CELL,
                        height: CELL,
                        backgroundColor: INTENSITY_COLORS[intensity],
                        borderRadius: 3,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const containerRect = e.currentTarget.closest(".overflow-x-auto")?.getBoundingClientRect();
                        setTooltip({
                          date: format(day.date, "MMM d, yyyy"),
                          count: day.count,
                          x: rect.left - (containerRect?.left ?? 0) + CELL / 2,
                          y: rect.top - (containerRect?.top ?? 0),
                        });
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-50 bg-popover border border-border rounded-md px-2 py-1 text-xs text-popover-foreground shadow-md whitespace-nowrap"
            style={{
              left: tooltip.x,
              top: tooltip.y - 36,
              transform: "translateX(-50%)",
            }}
          >
            <span className="font-medium">{tooltip.count} click{tooltip.count !== 1 ? "s" : ""}</span>
            <span className="text-muted-foreground ml-1">on {tooltip.date}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        {INTENSITY_COLORS.map((color, i) => (
          <div
            key={i}
            title={INTENSITY_LABELS[i]}
            style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 2 }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
