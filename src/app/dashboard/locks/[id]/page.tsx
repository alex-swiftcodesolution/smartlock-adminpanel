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
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { eventMap } from "@/lib/utils";

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

type Record = {
  update_time: number;
  status: { code: string; value?: string };
  avatar?: string;
  nick_name?: string;
};

export default function LockDetailPage({ params }: { params: { id: string } }) {
  const [lock, setLock] = useState<SmartLock | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [tab, setTab] = useState("log");
  const [pwdName, setPwdName] = useState("");
  const [pwdVal, setPwdVal] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const l = await getLockById(params.id);
      const s = await fetchStatus(params.id);
      const r = await fetchRecords(params.id, "all");
      if (l) setLock({ ...l, battery: Number(s.battery), door: s.door });
      setRecords(r as Record[]);
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
                    <TableHead>User</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => {
                    const event = eventMap[r.status.code] || r.status.code;
                    const value = r.status.value;
                    const detail = value && value !== "0" ? ` (${value})` : "";
                    return (
                      <TableRow key={r.update_time}>
                        <TableCell className="flex items-center gap-2">
                          <Image
                            src={r.avatar || "/fallback-avatar.png"}
                            alt={r.nick_name || "User"}
                            width={24}
                            height={24}
                            className="rounded-full"
                            loading="lazy"
                          />
                          <span>{r.nick_name || "System"}</span>
                        </TableCell>
                        <TableCell>
                          {event}
                          {detail}
                        </TableCell>
                        <TableCell>
                          {new Date(r.update_time).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
            variant="destructive"
            className="mb-4"
            onClick={async () => {
              const alerts = await fetchRecords(params.id, "alert");
              setRecords(alerts as Record[]);
              setTab("alert");
            }}
          >
            Load Alerts
          </Button>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {records.length === 0 ? (
                <p className="text-muted-foreground">No alerts yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Alert</TableHead>
                      <TableHead>Detail</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((r) => {
                      const alert = eventMap[r.status.code] || r.status.code;
                      const raw = r.status.value ?? "";
                      const detail = raw.includes("-")
                        ? raw
                            .split("-")[0]
                            .replace("unlock_", "")
                            .replace("_", " ")
                        : raw && raw !== "0"
                        ? raw
                        : "";
                      return (
                        <TableRow key={r.update_time} className="text-red-700">
                          <TableCell className="flex items-center gap-2">
                            <Image
                              src={r.avatar || "/fallback-avatar.png"}
                              alt={r.nick_name || "User"}
                              width={24}
                              height={24}
                              className="rounded-full"
                              loading="lazy"
                            />
                            <span>{r.nick_name || "System"}</span>
                          </TableCell>
                          <TableCell className="font-medium">{alert}</TableCell>
                          <TableCell className="italic">
                            {detail ? `via ${detail}` : "-"}
                          </TableCell>
                          <TableCell>
                            {new Date(r.update_time).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
