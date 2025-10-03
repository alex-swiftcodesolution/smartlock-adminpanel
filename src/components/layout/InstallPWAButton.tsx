"use client";

import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { motion } from "framer-motion";

export function InstallPWAButton({ isFullWidth = false }) {
  const { isInstallable, promptInstall } = usePWAInstall();

  if (!isInstallable) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <Button
        size="sm"
        className={isFullWidth ? "w-full" : ""}
        onClick={promptInstall}
        variant="default" // Assuming this is a custom variant, otherwise use 'default', 'outline' etc.
      >
        <Download className="mr-2 h-4 w-4" />
        Install App
      </Button>
    </motion.div>
  );
}
