import { getLocks } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BatteryWarning, Lock, Wifi, WifiOff } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
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

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Locks</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLocks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {onlineLocks} / {totalLocks}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Low Battery Alerts
            </CardTitle>
            <BatteryWarning className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {lowBatteryLocks}
            </div>
          </CardContent>
        </Card>
      </div>

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
              {recentEvents.map((event) => (
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
    </div>
  );
}
