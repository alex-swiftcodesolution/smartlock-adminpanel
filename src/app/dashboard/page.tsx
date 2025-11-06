// src/app/dashboard/page.tsx
"use client";

import { motion } from "framer-motion";
import { getLocks, fetchRecords } from "@/lib/locks/api";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import Image from "next/image";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-9 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    online: 0,
    lowBat: 0,
    events: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  const eventMap: Record<string, string> = {
    unlock_app: "App",
    unlock_password: "Password",
    unlock_fingerprint: "Fingerprint",
    unlock_card: "Card",
    unlock_face: "Face",
    unlock_key: "Key",
    unlock_temporary: "Temp PWD",
    unlock_dynamic: "Dynamic PWD",
    hijack: "Duress",
    alarm_lock: "Alarm",
    doorbell: "Doorbell",
  };

  useEffect(() => {
    (async () => {
      const locks = await getLocks();
      const total = locks.length;
      const online = locks.filter((l) => l.isOnline).length;
      const lowBat = locks.filter((l) => l.battery < 25).length;

      const evs = (
        await Promise.all(
          locks.slice(0, 3).map(async (l) => {
            const r = await fetchRecords(l.id, "all");
            return r.map((e: any) => ({
              ...e,
              lockName: l.name,
            }));
          })
        )
      )
        .flat()
        .sort((a: any, b: any) => b.update_time - a.update_time)
        .slice(0, 5);

      setStats({ total, online, lowBat, events: evs });
      setLoading(false);
    })();
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Total</CardTitle>
              <Lock className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Online</CardTitle>
              <Wifi className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.online}/{stats.total}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm">Low Battery</CardTitle>
              <BatteryWarning className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {stats.lowBat}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lock</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.events.map((e) => {
                const event = eventMap[e.status.code] || e.status.code;
                const value =
                  e.status.value && e.status.value !== "0"
                    ? ` (${e.status.value})`
                    : "";
                return (
                  <TableRow key={e.update_time}>
                    <TableCell className="font-medium">{e.lockName}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <Image
                        src={e.avatar || "/fallback-avatar.png"}
                        alt={e.nick_name || "User"}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                      <span className="text-sm">{e.nick_name || "System"}</span>
                    </TableCell>
                    <TableCell>
                      {event}
                      {value}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-sm">
                      {new Date(e.update_time).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
