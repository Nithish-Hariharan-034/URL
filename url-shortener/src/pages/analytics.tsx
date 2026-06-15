import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import {
  useGetUrlAnalytics,
  getGetUrlAnalyticsQueryKey
} from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Zap, MousePointerClick, Clock, Calendar, Monitor, Globe2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import CalendarHeatmap from "@/components/calendar-heatmap";

const PIE_COLORS = [
  "hsl(189,94%,43%)",
  "hsl(280,80%,60%)",
  "hsl(160,80%,50%)",
  "hsl(340,80%,60%)",
  "hsl(40,80%,60%)",
];

function EmptyChart() {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center text-muted-foreground gap-2">
      <Globe2 className="w-8 h-8 opacity-30" />
      <p className="text-sm">No data yet</p>
    </div>
  );
}

export default function Analytics() {
  const { id } = useParams();
  const urlId = parseInt(id || "0", 10);

  const { data, isLoading, error } = useGetUrlAnalytics(urlId, {
    query: { enabled: !!urlId, queryKey: getGetUrlAnalyticsQueryKey(urlId) }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark text-foreground flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="flex flex-col items-center space-y-4"
        >
          <Zap className="w-8 h-8 text-primary" />
          <p className="text-muted-foreground text-sm">Loading analytics...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background dark text-foreground flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-card border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Analytics Error</CardTitle>
            <CardDescription>Could not retrieve data for this link.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { shortUrl, totalClicks, lastVisited, dailyClicks, recentClicks, browserBreakdown, deviceBreakdown } = data;

  return (
    <div className="min-h-screen bg-background dark text-foreground flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-xl font-bold tracking-tight">Analytics</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-mono">/s/{shortUrl.shortCode}</h1>
          <p className="text-muted-foreground truncate max-w-2xl text-sm" title={shortUrl.originalUrl}>
            {shortUrl.originalUrl}
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Total Clicks", value: totalClicks, icon: MousePointerClick, display: totalClicks.toLocaleString() },
            { title: "Last Visited", value: lastVisited, icon: Clock, display: lastVisited ? format(parseISO(lastVisited), "MMM d, HH:mm") : "Never" },
            { title: "Created On", value: shortUrl.createdAt, icon: Calendar, display: format(parseISO(shortUrl.createdAt), "MMM d, yyyy") },
          ].map((stat, i) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold truncate">{stat.display}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Traffic Over Time</CardTitle>
              <CardDescription>Daily click volume.</CardDescription>
            </CardHeader>
            <CardContent>
              {dailyClicks.length === 0 ? <EmptyChart /> : (
                <div className="h-[280px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailyClicks}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} tickFormatter={(v) => format(parseISO(v), "MMM d")} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                      <RechartsTooltip
                        cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                        labelFormatter={(l) => format(parseISO(l as string), "MMMM d, yyyy")}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Activity Calendar
              </CardTitle>
              <CardDescription>Click activity over the past 26 weeks.</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarHeatmap dailyClicks={dailyClicks} weeks={26} />
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-primary" />
                  Browser Breakdown
                </CardTitle>
                <CardDescription>Browsers used to visit this link.</CardDescription>
              </CardHeader>
              <CardContent>
                {browserBreakdown.length === 0 ? <EmptyChart /> : (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={browserBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                          {browserBreakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                        <Legend fontSize={11} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe2 className="h-4 w-4 text-primary" />
                  Device Breakdown
                </CardTitle>
                <CardDescription>Device types that clicked this link.</CardDescription>
              </CardHeader>
              <CardContent>
                {deviceBreakdown.length === 0 ? <EmptyChart /> : (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={deviceBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                          {deviceBreakdown.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                        <Legend fontSize={11} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Recent Clicks</CardTitle>
              <CardDescription>The latest visitors to this link.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentClicks.length === 0 ? (
                <div className="py-10 text-center text-muted-foreground text-sm">No clicks yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Time</TableHead>
                        <TableHead>Browser</TableHead>
                        <TableHead>Device</TableHead>
                        <TableHead>IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentClicks.map((click) => (
                        <TableRow key={click.id} className="border-border">
                          <TableCell className="whitespace-nowrap font-medium text-sm">
                            {format(parseISO(click.timestamp), "MMM d, HH:mm:ss")}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{click.browser || "Unknown"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{click.device || "Unknown"}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{click.ipAddress || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
