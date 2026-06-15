import { useState, useRef } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { QRCodeCanvas } from "qrcode.react";
import {
  useGetDashboardStats,
  getGetDashboardStatsQueryKey,
  useListUrls,
  getListUrlsQueryKey,
  useCreateUrl,
  useDeleteUrl,
  useUpdateUrl,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Zap, Copy, Trash2, BarChart2, Link as LinkIcon,
  MousePointerClick, Globe, QrCode, Download, X, Pencil, ExternalLink, Share2
} from "lucide-react";

const urlSchema = z.object({
  originalUrl: z.string().url("Must be a valid URL"),
  customAlias: z.string().optional(),
  expiresAt: z.string().optional(),
});

const editSchema = z.object({
  originalUrl: z.string().url("Must be a valid URL"),
  expiresAt: z.string().optional(),
});

function StatCard({ title, value, icon: Icon, loading }: { title: string; value: number | undefined; icon: React.ElementType; loading: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "—" : (value ?? 0)}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function Dashboard() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [editingUrl, setEditingUrl] = useState<{ id: number; originalUrl: string; expiresAt: string | null } | null>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);

  const { data: stats, isLoading: statsLoading } = useGetDashboardStats({
    query: { queryKey: getGetDashboardStatsQueryKey() },
  });

  const { data: urls, isLoading: urlsLoading } = useListUrls({
    query: { queryKey: getListUrlsQueryKey() },
  });

  const createMutation = useCreateUrl();
  const deleteMutation = useDeleteUrl();
  const updateMutation = useUpdateUrl();

  const form = useForm<z.infer<typeof urlSchema>>({
    resolver: zodResolver(urlSchema),
    defaultValues: { originalUrl: "", customAlias: "", expiresAt: "" },
  });

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: { originalUrl: "", expiresAt: "" },
  });

  function getShortUrl(shortCode: string) {
    return `${window.location.origin}/api/s/${shortCode}`;
  }

  function onSubmit(values: z.infer<typeof urlSchema>) {
    createMutation.mutate(
      { data: { ...values, customAlias: values.customAlias || undefined, expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : undefined } },
      {
        onSuccess: () => {
          toast({ title: "Link created", description: "Your short link is ready." });
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListUrlsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "Creation failed", description: err.data?.error || "Could not create link", variant: "destructive" });
        },
      }
    );
  }

  function openEdit(url: { id: number; originalUrl: string; expiresAt: string | null }) {
    setEditingUrl(url);
    editForm.reset({
      originalUrl: url.originalUrl,
      expiresAt: url.expiresAt ? url.expiresAt.slice(0, 16) : "",
    });
  }

  function onEditSubmit(values: z.infer<typeof editSchema>) {
    if (!editingUrl) return;
    updateMutation.mutate(
      {
        id: editingUrl.id,
        data: {
          originalUrl: values.originalUrl,
          expiresAt: values.expiresAt ? new Date(values.expiresAt).toISOString() : null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Link updated" });
          setEditingUrl(null);
          queryClient.invalidateQueries({ queryKey: getListUrlsQueryKey() });
        },
        onError: (err: any) => {
          toast({ title: "Update failed", description: err.data?.error || "Could not update link", variant: "destructive" });
        },
      }
    );
  }

  function copyToClipboard(shortCode: string) {
    const url = getShortUrl(shortCode);
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: "Short link copied to clipboard." });
  }

  function openQr(shortCode: string) {
    setQrUrl(getShortUrl(shortCode));
    setQrCode(shortCode);
  }

  function downloadQr() {
    if (!qrRef.current) return;
    const dataUrl = qrRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${qrCode}.png`;
    a.click();
  }

  function handleDelete(id: number) {
    if (confirm("Delete this link? This cannot be undone.")) {
      deleteMutation.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Link deleted" });
            queryClient.invalidateQueries({ queryKey: getListUrlsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
          },
        }
      );
    }
  }

  function shareStats(shortCode: string) {
    const statsUrl = `${window.location.origin}/stats/${shortCode}`;
    navigator.clipboard.writeText(statsUrl);
    toast({ title: "Stats link copied!", description: "Share this link for public analytics." });
  }

  return (
    <div className="min-h-screen bg-background dark text-foreground flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="text-xl font-bold tracking-tight">Snip</span>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
            Sign Out
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <StatCard title="Total Links" value={stats?.totalUrls} icon={LinkIcon} loading={statsLoading} />
          <StatCard title="Total Clicks" value={stats?.totalClicks} icon={MousePointerClick} loading={statsLoading} />
          <StatCard title="Active Links" value={stats?.activeUrls} icon={Globe} loading={statsLoading} />
        </div>

        <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
          <div>
            <Card className="bg-card border-border sticky top-24">
              <CardHeader>
                <CardTitle>Create Link</CardTitle>
                <CardDescription>Shorten a URL and start tracking clicks.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="originalUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Destination URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com/very-long-url" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="customAlias" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Alias <span className="text-muted-foreground">(optional)</span></FormLabel>
                        <FormControl>
                          <Input placeholder="my-campaign" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="expiresAt" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date <span className="text-muted-foreground">(optional)</span></FormLabel>
                        <FormControl>
                          <Input type="datetime-local" {...field} className="bg-background" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                      {createMutation.isPending ? "Creating..." : "Shorten URL"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Your Links</CardTitle>
                <CardDescription>Manage and monitor your shortened URLs.</CardDescription>
              </CardHeader>
              <CardContent>
                {urlsLoading ? (
                  <div className="py-12 text-center">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
                    </motion.div>
                    <p className="text-muted-foreground text-sm">Loading your links...</p>
                  </div>
                ) : !urls || urls.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center space-y-3">
                    <LinkIcon className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-muted-foreground font-medium">No links yet</p>
                    <p className="text-sm text-muted-foreground/60">Shorten your first URL to get started.</p>
                  </motion.div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                          <TableHead>Short URL</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead className="text-right">Clicks</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {urls.map((url, i) => (
                            <motion.tr
                              key={url.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ delay: i * 0.04 }}
                              className="border-border"
                            >
                              <TableCell className="font-medium text-primary">
                                <a href={getShortUrl(url.shortCode)} target="_blank" rel="noopener noreferrer" className="hover:underline font-mono text-sm flex items-center gap-1">
                                  /s/{url.shortCode}
                                  <ExternalLink className="h-3 w-3 opacity-50" />
                                </a>
                              </TableCell>
                              <TableCell className="max-w-[160px] truncate text-muted-foreground text-sm" title={url.originalUrl}>
                                {url.originalUrl}
                              </TableCell>
                              <TableCell className="text-right tabular-nums">{url.totalClicks}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(url.shortCode)} title="Copy link">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => openQr(url.shortCode)} title="QR Code">
                                    <QrCode className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => shareStats(url.shortCode)} title="Share public stats">
                                    <Share2 className="h-4 w-4" />
                                  </Button>
                                  <Link href={`/analytics/${url.id}`}>
                                    <Button variant="ghost" size="icon" title="Analytics">
                                      <BarChart2 className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button variant="ghost" size="icon" onClick={() => openEdit(url)} title="Edit">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={() => handleDelete(url.id)} title="Delete" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {qrUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => { setQrUrl(null); setQrCode(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-card border border-border rounded-xl shadow-2xl p-6 flex flex-col items-center gap-5 w-80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-foreground">QR Code</span>
                <button onClick={() => { setQrUrl(null); setQrCode(null); }} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs font-mono text-muted-foreground break-all text-center">{qrUrl}</p>
              <div className="bg-white p-4 rounded-lg">
                <QRCodeCanvas ref={qrRef} value={qrUrl} size={200} level="H" />
              </div>
              <Button onClick={downloadQr} className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setEditingUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-card border border-border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold">Edit Link</h3>
                <button onClick={() => setEditingUrl(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                  <FormField control={editForm.control} name="originalUrl" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/new-url" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={editForm.control} name="expiresAt" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date <span className="text-muted-foreground">(optional)</span></FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" type="button" className="flex-1" onClick={() => setEditingUrl(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                      {updateMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
