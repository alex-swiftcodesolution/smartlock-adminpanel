"use client"; // Required for animations

import { motion } from "framer-motion";
import { getLocks, LockEvent } from "@/lib/dummy-data"; // FIX 1: Import the LockEvent type
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BatteryWarning, Lock, Wifi } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

// Animation variants for staggering children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

// FIX 2: Define a specific type for our recent events and the overall state
type RecentEvent = LockEvent & { lockName: string };

interface DashboardStats {
  totalLocks: number;
  onlineLocks: number;
  lowBatteryLocks: number;
  recentEvents: RecentEvent[];
}

export default function DashboardPage() {
  // FIX 3: Apply the new type to useState for proper type checking
  const [stats, setStats] = useState<DashboardStats>({
    totalLocks: 0,
    onlineLocks: 0,
    lowBatteryLocks: 0,
    recentEvents: [],
  });

  useEffect(() => {
    async function fetchData() {
      const locks = await getLocks();
      const totalLocks = locks.length;
      const onlineLocks = locks.filter((l) => l.isOnline).length;
      const lowBatteryLocks = locks.filter((l) => l.battery < 25).length;
      const recentEvents = locks
        .flatMap((l) => l.events.map((e) => ({ ...e, lockName: l.name })))
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
        .slice(0, 5);
      setStats({ totalLocks, onlineLocks, lowBatteryLocks, recentEvents });
    }
    fetchData();
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Animated Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locks</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLocks}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.onlineLocks} / {stats.totalLocks}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Battery Alerts
              </CardTitle>
              <BatteryWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.lowBatteryLocks}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lock</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* FIX 4: Access recentEvents from the stats object */}
                {stats.recentEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      {event.lockName}
                    </TableCell>
                    <TableCell>{event.message}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
