/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { notFound } from "next/navigation";
import { getLockById, SmartLock, LockEvent } from "@/lib/dummy-data";
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
import {
  Activity,
  Lock,
  Unlock,
  Wifi,
  BatteryWarning,
  AlertTriangle,
} from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton"; // Add this component via `npx shadcn-ui@latest add skeleton`

/**
 * NEW: A dedicated component for displaying a single activity log item on mobile.
 */
const ActivityLogItem = ({ event }: { event: LockEvent }) => {
  const getIconForEventType = () => {
    switch (event.type) {
      case "locked":
        return <Lock className="h-5 w-5 text-muted-foreground" />;
      case "unlocked":
        return <Unlock className="h-5 w-5 text-muted-foreground" />;
      case "low_battery":
        return <BatteryWarning className="h-5 w-5 text-yellow-500" />;
      case "jammed":
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      default:
        return <Activity className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 border-b last:border-b-0">
      <div className="mt-1">{getIconForEventType()}</div>
      <div className="flex-1">
        <p className="font-medium">{event.message}</p>
        <p className="text-sm text-muted-foreground">
          by {event.user || "System"} on{" "}
          {new Date(event.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default function LockDetailPage({ params }: { params: { id: string } }) {
  const [lock, setLock] = useState<SmartLock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const fetchLock = async () => {
      // This now calls our updated getLockById which uses the live API
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
      // Replace simulateApiCall with a real fetch to our new command endpoint
      const res = await fetch(`/api/tuya/devices/${lock.id}/commands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commands: [
            // Again, confirm 'lock_motor_state' is the correct code for your device.
            { code: "lock_motor_state", value: action === "lock" },
          ],
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.error || result.msg || "Failed to send command."
        );
      }

      // Optimistically update the UI
      setLock((prevLock) =>
        prevLock
          ? { ...prevLock, status: action === "lock" ? "locked" : "unlocked" }
          : null
      );
      toast.success(`Successfully sent ${action} command to "${lock.name}".`, {
        id: toastId,
      });
    } catch (error: any) {
      toast.error(`Failed to ${action} the lock: ${error.message}`, {
        id: toastId,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    // A better loading state for the page
    return (
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <Skeleton className="h-9 w-1/3" />
          <Skeleton className="h-5 w-1/4" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-56 lg:col-span-1" />
          <Skeleton className="h-56 lg:col-span-2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
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

      {/* REFINED: Grid layout is now simpler and more robust */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
              <span className="text-muted-foreground">Status</span>
              <Badge variant={statusVariant}>{lock.status}</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Connectivity</span>
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
              <span className="text-muted-foreground">Battery</span>
              <div className="flex items-center gap-2">
                <Progress value={lock.battery} className="w-24" />
                <span>{lock.battery}%</span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Model</span>
              <span className="font-medium">{lock.model}</span>
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
        {/* REFINED: Conditionally render mobile list or desktop table */}
        <CardContent className="p-0">
          {/* Mobile View: A list of ActivityLogItem components */}
          <div className="lg:hidden">
            {lock.events.length > 0 ? (
              lock.events.map((event) => (
                <ActivityLogItem key={event.id} event={event} />
              ))
            ) : (
              <p className="p-6 text-center text-muted-foreground">
                No activity recorded.
              </p>
            )}
          </div>

          {/* Desktop View: The original table */}
          <div className="hidden lg:block">
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
                {lock.events.length > 0 ? (
                  lock.events.map((event) => (
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
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No activity recorded.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
