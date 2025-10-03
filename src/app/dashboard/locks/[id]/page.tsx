"use client";

import { notFound } from "next/navigation";
import { getLockById, SmartLock } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Lock, Unlock, Wifi } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Helper function to simulate an API call
const simulateApiCall = () =>
  new Promise((resolve) => setTimeout(resolve, 1200));

export default function LockDetailPage({ params }: { params: { id: string } }) {
  const [lock, setLock] = useState<SmartLock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchLock = async () => {
      const fetchedLock = await getLockById(params.id);
      if (fetchedLock) {
        setLock(fetchedLock);
      }
      setIsLoading(false);
    };
    fetchLock();
  }, [params.id]);

  const handleAction = async (action: "lock" | "unlock") => {
    if (!lock) return;

    setIsActionLoading(true);
    const toastId = toast.loading(`Sending ${action} command...`);

    try {
      await simulateApiCall(); // Replace with your actual Tuya API call

      // Update local state to reflect the change immediately
      setLock((prevLock) =>
        prevLock
          ? { ...prevLock, status: action === "lock" ? "locked" : "unlocked" }
          : null
      );

      toast.success(`Successfully sent ${action} command to "${lock.name}".`, {
        id: toastId,
      });
    } catch (error) {
      toast.error(`Failed to ${action} the lock. Please try again.`, {
        id: toastId,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading device details...</div>;
  }

  if (!lock) {
    notFound();
  }

  const statusVariant =
    lock.status === "locked"
      ? "default"
      : lock.status === "unlocked"
      ? "secondary"
      : "destructive";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">{lock.name}</h1>
        <p className="text-muted-foreground">{lock.location}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Perform remote actions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              size="lg"
              disabled={lock.status === "locked" || isActionLoading}
              onClick={() => handleAction("lock")}
            >
              <Lock className="mr-2 h-4 w-4" />
              {isActionLoading ? "Locking..." : "Lock Remotely"}
            </Button>
            <Button
              size="lg"
              variant="secondary"
              disabled={lock.status === "unlocked" || isActionLoading}
              onClick={() => handleAction("unlock")}
            >
              <Unlock className="mr-2 h-4 w-4" />
              {isActionLoading ? "Unlocking..." : "Unlock Remotely"}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Device Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Status</span>
              <Badge variant={statusVariant}>{lock.status}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>Connectivity</span>
              {lock.isOnline ? (
                <span className="flex items-center gap-2 text-green-500">
                  <Wifi size={16} /> Online
                </span>
              ) : (
                <span className="text-red-500">Offline</span>
              )}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>Battery</span>
              <div className="flex items-center gap-2">
                <Progress value={lock.battery} className="w-24" />
                <span>{lock.battery}%</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span>Model</span>
              <span className="text-muted-foreground">{lock.model}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Message</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lock.events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium capitalize">
                    {event.type}
                  </TableCell>
                  <TableCell>{event.user || "System"}</TableCell>
                  <TableCell>{event.message}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
