import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background dark text-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-6 max-w-md"
      >
        <div className="flex justify-center">
          <div className="p-4 bg-primary/10 rounded-full ring-1 ring-primary/20">
            <Zap className="w-10 h-10 text-primary" />
          </div>
        </div>
        <div>
          <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Link not found</h2>
          <p className="text-muted-foreground">
            This short link doesn't exist or may have been deleted.
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="w-full sm:w-auto">Back to Dashboard</Button>
        </Link>
      </motion.div>
    </div>
  );
}
