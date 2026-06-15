import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { useGetPublicStats, getGetPublicStatsQueryKey } from "@workspace/api-client-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, MousePointerClick, Clock, Calendar, Monitor, Globe2, ExternalLink } from "lucide-react";
import { format, parseISO } from "date-fns";
import CalendarHeatmap from "@/components/calendar-heatmap";

const PIE_COLORS = [
  "hsl(189,94%,43%)",
  "hsl(280,80%,60%)",
  "hsl(160,80%,50%)",
  "hsl(340,80%,60%)",
  "hsl(40,80%,60%)",
];

export default function PublicStats() {
  const { shortCode } = useParams();

  const { data, isLoading, error } = useGetPublicStats(shortCode || "", {
    query: { enabled: !!shortCode, queryKey: getGetPublicStatsQueryKey(shortCode || "") }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark text-foreground flex items-center justify-center">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="flex flex-col items-center space-y-4">
          <Zap className="w-8 h-8 text-primary" />
          <p className="text-muted-foreground text-sm">Loading stats...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background dark text-foreground flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
          <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20 inline-flex">
            <Zap className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Link not found</h2>
          <p className="text-muted-foreground text-sm">This short link doesn't have public stats or doesn't exist.</p>
          <Link href="/login">
            <Button variant="outline">Create your own links</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark text-foreground flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold tracking-tight">Snip</span>
            <span className="text-muted-foreground text-sm hidden sm:inline">· Public Stats</span>
          </div>
          <Link href="/register">
            <Button size="sm" variant="outline">Create Free Account</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight font-mono">/s/{data.shortCode}</h1>
            {data.expiresAt && new Date(data.expiresAt) < new Date() && (
              <span className="text-xs bg-destructive/20 text-destructive px-2 py-1 rounded-full">Expired</span>
            )}
          </div>
          <a href={data.originalUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 max-w-2xl truncate">
            {data.originalUrl}
            <ExternalLink className="h-3 w-3 flex-shrink-0" />
          </a>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            { title: "Total Clicks", icon: MousePointerClick, display: data.totalClicks.toLocaleString() },
            { title: "Last Visited", icon: Clock, display: data.lastVisited ? format(parseISO(data.lastVisited), "MMM d, HH:mm") : "Never" },
            { title: "Created", icon: Calendar, display: format(parseISO(data.createdAt), "MMM d, yyyy") },
          ].map((stat, i) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.display}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Traffic Over Time</CardTitle>
              <CardDescription>Daily click volume for this link.</CardDescription>
            </CardHeader>
            <CardContent>
              {data.dailyClicks.length === 0 ? (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No click data yet.</div>
              ) : (
                <div className="h-[260px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.dailyClicks}>
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
              <CalendarHeatmap dailyClicks={data.dailyClicks} weeks={26} />
            </CardContent>
          </Card>
        </motion.div>

        {(data.browserBreakdown.length > 0 || data.deviceBreakdown.length > 0) && (
          <div className="grid gap-6 md:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-primary" />
                    Browsers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.browserBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                          {data.browserBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                        <Legend fontSize={11} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-primary" />
                    Devices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.deviceBreakdown} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                          {data.deviceBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }} />
                        <Legend fontSize={11} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center pb-8">
          <p className="text-muted-foreground text-sm mb-3">Want to shorten your own links and get analytics like this?</p>
          <Link href="/register">
            <Button>Get Started Free</Button>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
