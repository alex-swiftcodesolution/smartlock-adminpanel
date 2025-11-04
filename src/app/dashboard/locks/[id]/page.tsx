// src/app/dashboard/locks/[id]/page.tsx
"use client";

import { notFound } from "next/navigation";
import {
  getLockById,
  fetchRecords,
  fetchStatus,
  createTempPwd,
} from "@/lib/locks/api";
import type { SmartLock } from "@/lib/locks/types";
import { sendLockCommand } from "@/lib/tuya/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Lock,
  Unlock,
  Wifi,
  DoorOpen,
  DoorClosed,
  Key,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-96" />
        <Skeleton className="h-5 w-64 mt-2" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-48" />
        <Skeleton className="h-48 lg:col-span-2" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}

export default function LockDetailPage({ params }: { params: { id: string } }) {
  const [lock, setLock] = useState<SmartLock | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [tab, setTab] = useState("log");
  const [pwdName, setPwdName] = useState("");
  const [pwdVal, setPwdVal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const l = await getLockById(params.id);
      const s = await fetchStatus(params.id);
      const r = await fetchRecords(params.id);
      if (l) setLock({ ...l, battery: Number(s.battery), door: s.door });
      setRecords(r);
      setLoading(false);
    })();
  }, [params.id]);

  const run = async (a: "lock" | "unlock") => {
    try {
      await sendLockCommand(params.id, a);
      setLock((p) =>
        p ? { ...p, status: a === "lock" ? "locked" : "unlocked" } : null
      );
      toast.success(`${a}ed`);
    } catch {
      toast.error("Failed");
    }
  };

  const makePwd = async () => {
    try {
      await createTempPwd(params.id, pwdName, pwdVal);
      toast.success(`Password ${pwdVal} created`);
      setPwdName("");
      setPwdVal("");
    } catch {
      toast.error("Failed");
    }
  };

  if (loading) return <DetailSkeleton />;
  if (!lock) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{lock.name}</h1>
        <p className="text-muted-foreground">{lock.location}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() => run("lock")}
              disabled={lock.status === "locked"}
            >
              <Lock className="mr-2" />
              Lock
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full"
              onClick={() => run("unlock")}
              disabled={lock.status === "unlocked"}
            >
              <Unlock className="mr-2" />
              Unlock
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span>Status</span>
              <Badge
                variant={lock.status === "locked" ? "default" : "secondary"}
              >
                {lock.status}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Door</span>
              {lock.door ? (
                <DoorOpen className="text-green-500" />
              ) : (
                <DoorClosed />
              )}
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Battery</span>
              <div className="flex items-center gap-2">
                <Progress value={lock.battery} className="w-24" />
                {lock.battery}%
              </div>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span>Online</span>
              {lock.isOnline ? <Wifi className="text-green-500" /> : "Offline"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="pwd">Temp PWD</TabsTrigger>
          <TabsTrigger value="alert">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="log">
          <Card>
            <CardHeader>
              <CardTitle>
                <Activity className="inline mr-2" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow key={r.record_id}>
                      <TableCell>
                        {new Date(r.create_time * 1000).toLocaleString()}
                      </TableCell>
                      <TableCell>{r.event_desc}</TableCell>
                      <TableCell>{r.user_name || "System"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pwd">
          <Card>
            <CardHeader>
              <CardTitle>
                <Key className="inline mr-2" />
                One-Time Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  placeholder="Guest"
                  value={pwdName}
                  onChange={(e) => setPwdName(e.target.value)}
                />
              </div>
              <div>
                <Label>6-digit</Label>
                <Input
                  maxLength={6}
                  value={pwdVal}
                  onChange={(e) => setPwdVal(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <Button onClick={makePwd}>Create</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alert">
          <Button
            onClick={async () =>
              setRecords(await fetchRecords(params.id, "alert"))
            }
          >
            Load Alerts
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
