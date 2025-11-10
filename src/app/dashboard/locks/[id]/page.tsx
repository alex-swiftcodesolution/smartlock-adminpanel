"use client";

import { notFound } from "next/navigation";
import {
  getLockById,
  fetchRecords,
  fetchStatus,
  createTempPwd,
  fetchUsers,
  fetchUser,
  addUser,
  updateUser,
  deleteUser,
  updateUserSchedule,
  batchDeleteUsers,
  updateUserRole,
  fetchOpmodes,
  cancelAllocateOpmodes,
} from "@/lib/locks/api";
import type { User, OpMode } from "@/lib/locks/api";
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
  Users,
  Calendar,
  Shield,
  Fingerprint,
  Trash2,
  Plus,
  Edit,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { eventMap } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

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

/* ---------- types (mirrored from api.ts) ---------- */
type Record = {
  update_time: number;
  status: { code: string; value?: string };
  avatar?: string;
  nick_name?: string;
};

export default function LockDetailPage({ params }: { params: { id: string } }) {
  /* ---------- state ---------- */
  const [lock, setLock] = useState<SmartLock | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [tab, setTab] = useState("log");
  const [pwdName, setPwdName] = useState("");
  const [pwdVal, setPwdVal] = useState("");
  const [loading, setLoading] = useState(true);

  // members
  const [members, setMembers] = useState<User[]>([]);
  const [membersPage, setMembersPage] = useState(1);
  const [membersTotalPages, setMembersTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // edit modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    nick_name: "",
    sex: 1 as 1 | 2,
    contact: "",
  });
  const [role, setRole] = useState<"admin" | "normal">("normal");

  // schedule
  const [scheduleForm, setScheduleForm] = useState<{
    permanent: boolean;
    effective_time: number | null;
    expired_time: number | null;
    schedule_details: Array<{
      start_minute: number;
      end_minute: number;
      working_day: number;
      all_day: boolean;
      time_zone_id?: string;
    }>;
  }>({
    permanent: true,
    effective_time: null,
    expired_time: null,
    schedule_details: [],
  });

  // opmodes
  const [opmodes, setOpmodes] = useState<OpMode[]>([]);
  const [opmodesPage, setOpmodesPage] = useState(1);
  const [opmodesTotalPages, setOpmodesTotalPages] = useState(1);

  // schedule slot UI
  const [showScheduleSlot, setShowScheduleSlot] = useState(false);
  const [newSlot, setNewSlot] = useState<{
    start_hour: number;
    start_minute: number;
    end_hour: number;
    end_minute: number;
    all_day: boolean;
    days: globalThis.Record<1 | 2 | 4 | 8 | 16 | 32 | 64, boolean>;
  }>({
    start_hour: 9,
    start_minute: 0,
    end_hour: 17,
    end_minute: 0,
    all_day: false,
    days: {
      1: false,
      2: true,
      4: true,
      8: true,
      16: true,
      32: true,
      64: false,
    },
  });

  /* ---------- initial load ---------- */
  useEffect(() => {
    (async () => {
      try {
        const [l, s, r, u] = await Promise.all([
          getLockById(params.id),
          fetchStatus(params.id),
          fetchRecords(params.id, "all"),
          fetchUsers(params.id, 1, 10),
        ]);
        if (l) setLock({ ...l, battery: Number(s.battery), door: s.door });
        setRecords(r as Record[]);
        setMembers(u.records);
        setMembersTotalPages(u.total_pages);
        setLoading(false);
      } catch {
        toast.error("Failed to load data");
        setLoading(false);
      }
    })();
  }, [params.id]);

  /* ---------- lock commands ---------- */
  const run = async (a: "lock" | "unlock") => {
    try {
      await sendLockCommand(params.id, a);
      setLock((p) =>
        p ? { ...p, status: a === "lock" ? "locked" : "unlocked" } : null
      );
      toast.success(`${a === "lock" ? "Locked" : "Unlocked"}`);
    } catch {
      toast.error("Command failed");
    }
  };

  const makePwd = async () => {
    if (!pwdName || !pwdVal || pwdVal.length !== 6) {
      toast.error("Invalid password");
      return;
    }
    try {
      await createTempPwd(params.id, pwdName, pwdVal);
      toast.success(`Password ${pwdVal} created`);
      setPwdName("");
      setPwdVal("");
    } catch {
      toast.error("Failed to create password");
    }
  };

  /* ---------- members pagination ---------- */
  const loadMembersPage = async (page: number) => {
    try {
      const data = await fetchUsers(params.id, page, 10);
      setMembers(data.records);
      setMembersPage(page);
      setMembersTotalPages(data.total_pages);
    } catch {
      toast.error("Failed to load members");
    }
  };

  /* ---------- add user ---------- */
  const handleAddUser = async () => {
    if (!userForm.nick_name) {
      toast.error("Name required");
      return;
    }
    try {
      await addUser(params.id, userForm);
      const data = await fetchUsers(params.id, 1, 10);
      setMembers(data.records);
      setMembersTotalPages(data.total_pages);
      setMembersPage(1);
      setUserForm({ nick_name: "", sex: 1, contact: "" });
      toast.success("User added");
    } catch {
      toast.error("Failed to add user");
    }
  };

  /* ---------- edit user (open modal) ---------- */
  const handleEditUser = async (user: User) => {
    try {
      const fullUser = await fetchUser(params.id, user.user_id);
      setSelectedUser(fullUser);
      setUserForm({
        nick_name: fullUser.nick_name,
        sex: fullUser.sex ?? 1,
        contact: fullUser.user_contact ?? "",
      });
      setRole(fullUser.user_type === 10 ? "admin" : "normal");

      // schedule
      if (fullUser.time_schedule_info) {
        setScheduleForm({
          permanent: fullUser.time_schedule_info.permanent,
          effective_time: fullUser.time_schedule_info.effective_time ?? null,
          expired_time: fullUser.time_schedule_info.expired_time ?? null,
          schedule_details: fullUser.time_schedule_info.schedule_details ?? [],
        });
      } else {
        setScheduleForm({
          permanent: true,
          effective_time: null,
          expired_time: null,
          schedule_details: [],
        });
      }

      // opmodes
      const ops = await fetchOpmodes(params.id, user.user_id, 1, 20);
      setOpmodes(ops.records);
      setOpmodesTotalPages(ops.total_pages);
      setOpmodesPage(1);
    } catch {
      toast.error("Failed to load user details");
    }
  };

  /* ---------- update basic info ---------- */
  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await updateUser(params.id, selectedUser.user_id, {
        nick_name: userForm.nick_name,
        contact: userForm.contact,
      });
      toast.success("User updated");
      const data = await fetchUsers(params.id, membersPage, 10);
      setMembers(data.records);
    } catch {
      toast.error("Failed to update user");
    }
  };

  /* ---------- delete single ---------- */
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user?")) return;
    try {
      await deleteUser(params.id, userId);
      const data = await fetchUsers(params.id, membersPage, 10);
      setMembers(data.records);
      setMembersTotalPages(data.total_pages);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  /* ---------- batch delete ---------- */
  const handleBatchDelete = async () => {
    if (
      selectedUsers.size === 0 ||
      !confirm(`Delete ${selectedUsers.size} users?`)
    )
      return;
    try {
      await batchDeleteUsers(params.id, Array.from(selectedUsers).join(","));
      const data = await fetchUsers(params.id, membersPage, 10);
      setMembers(data.records);
      setMembersTotalPages(data.total_pages);
      setSelectedUsers(new Set());
      toast.success("Users deleted");
    } catch {
      toast.error("Failed to delete users");
    }
  };

  /* ---------- role ---------- */
  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    try {
      await updateUserRole(params.id, selectedUser.user_id, role);
      toast.success("Role updated");
      const data = await fetchUsers(params.id, membersPage, 10);
      setMembers(data.records);
    } catch {
      toast.error("Failed to update role");
    }
  };

  /* ---------- schedule ---------- */
  const handleUpdateSchedule = async () => {
    if (!selectedUser) return;
    try {
      await updateUserSchedule(params.id, selectedUser.user_id, scheduleForm);
      toast.success("Schedule updated");
    } catch {
      toast.error("Failed to update schedule");
    }
  };

  /* ---------- opmode unbind ---------- */
  const handleUnbindOpMode = async (op: OpMode) => {
    if (!selectedUser) return;
    try {
      await cancelAllocateOpmodes(params.id, {
        user_id: selectedUser.user_id,
        unlock_list: [{ code: op.dp_code, unlock_sn: op.unlock_sn }],
      });
      const ops = await fetchOpmodes(
        params.id,
        selectedUser.user_id,
        opmodesPage,
        20
      );
      setOpmodes(ops.records);
      toast.success("Method unbound");
    } catch {
      toast.error("Failed to unbind");
    }
  };

  const loadOpmodesPage = async (page: number) => {
    if (!selectedUser) return;
    try {
      const ops = await fetchOpmodes(params.id, selectedUser.user_id, page, 20);
      setOpmodes(ops.records);
      setOpmodesPage(page);
      setOpmodesTotalPages(ops.total_pages);
    } catch {
      toast.error("Failed to load unlock methods");
    }
  };

  /* ---------- schedule slot ---------- */
  const addScheduleSlot = () => {
    const startMinute = newSlot.start_hour * 60 + newSlot.start_minute;
    const endMinute = newSlot.end_hour * 60 + newSlot.end_minute;
    if (endMinute <= startMinute) {
      toast.error("End time must be after start time");
      return;
    }
    const workingDay = Object.entries(newSlot.days)
      .filter(([, v]) => v)
      .map(([k]) => Number(k) as 1 | 2 | 4 | 8 | 16 | 32 | 64)
      .reduce((a, b) => a + b, 0);

    const newDetail = {
      start_minute: startMinute,
      end_minute: endMinute,
      working_day: workingDay,
      all_day: newSlot.all_day,
      time_zone_id: "America/New_York",
    };

    setScheduleForm({
      ...scheduleForm,
      schedule_details: [...scheduleForm.schedule_details, newDetail],
    });
    setShowScheduleSlot(false);
    setNewSlot({
      start_hour: 9,
      start_minute: 0,
      end_hour: 17,
      end_minute: 0,
      all_day: false,
      days: {
        1: false,
        2: true,
        4: true,
        8: true,
        16: true,
        32: true,
        64: false,
      },
    });
  };

  const removeScheduleSlot = (index: number) => {
    setScheduleForm({
      ...scheduleForm,
      schedule_details: scheduleForm.schedule_details.filter(
        (_, i) => i !== index
      ),
    });
  };

  const toggleUserSelection = (userId: string) => {
    const copy = new Set(selectedUsers);
    copy.has(userId) ? copy.delete(userId) : copy.add(userId);
    setSelectedUsers(copy);
  };

  /* ---------- render ---------- */
  if (loading) return <DetailSkeleton />;
  if (!lock) return notFound();

  return (
    <div className="space-y-6">
      {/* ---------- header ---------- */}
      <div>
        <h1 className="text-3xl font-bold">{lock.name}</h1>
        <p className="text-muted-foreground">{lock.location}</p>
      </div>

      {/* ---------- controls + status ---------- */}
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
          <CardContent className="space-y-4   text-sm">
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

      {/* ---------- tabs ---------- */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="log">Log</TabsTrigger>
          <TabsTrigger value="pwd">Temp PWD</TabsTrigger>
          <TabsTrigger value="alert">Alerts</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        {/* ---------- LOG ---------- */}
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
                    const event = eventMap[r.status.code] ?? r.status.code;
                    const detail =
                      r.status.value && r.status.value !== "0"
                        ? ` (${r.status.value})`
                        : "";
                    return (
                      <TableRow key={r.update_time}>
                        <TableCell className="flex items-center gap-2">
                          <Image
                            src={r.avatar ?? "/fallback-avatar.png"}
                            alt={r.nick_name ?? "User"}
                            width={24}
                            height={24}
                            className="rounded-full"
                            loading="lazy"
                          />
                          <span>{r.nick_name ?? "System"}</span>
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

        {/* ---------- TEMP PWD ---------- */}
        <TabsContent value="pwd">
          <Card>
            <CardHeader>
              <CardTitle>
                <Key className="inline mr-2" />
                One‑Time Password
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
                <Label>6‑digit</Label>
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

        {/* ---------- ALERTS ---------- */}
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
                      const alert = eventMap[r.status.code] ?? r.status.code;
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
                              src={r.avatar ?? "/fallback-avatar.png"}
                              alt={r.nick_name ?? "User"}
                              width={24}
                              height={24}
                              className="rounded-full"
                              loading="lazy"
                            />
                            <span>{r.nick_name ?? "System"}</span>
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

        {/* ---------- MEMBERS ---------- */}
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Members
                </span>
                {selectedUsers.size > 0 && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBatchDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete ({selectedUsers.size})
                  </Button>
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* ----- add user form ----- */}
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Member
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Nickname *</Label>
                    <Input
                      placeholder="John Doe"
                      value={userForm.nick_name}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          nick_name: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Select
                      value={userForm.sex.toString()}
                      onValueChange={(v) =>
                        setUserForm({
                          ...userForm,
                          sex: Number(v) as 1 | 2,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Male</SelectItem>
                        <SelectItem value="2">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Contact</Label>
                    <Input
                      placeholder="phone/email"
                      value={userForm.contact}
                      onChange={(e) =>
                        setUserForm({
                          ...userForm,
                          contact: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleAddUser} size="sm">
                  Add Member
                </Button>
              </div>

              {/* ----- members table ----- */}
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            selectedUsers.size === members.length &&
                            members.length > 0
                          }
                          onCheckedChange={(c) => {
                            if (c) {
                              setSelectedUsers(
                                new Set(members.map((m) => m.user_id))
                              );
                            } else {
                              setSelectedUsers(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.user_id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(m.user_id)}
                            onCheckedChange={() =>
                              toggleUserSelection(m.user_id)
                            }
                          />
                        </TableCell>
                        <TableCell className="flex items-center gap-2">
                          <Image
                            src={m.avatar_url ?? "/fallback-avatar.png"}
                            alt={m.nick_name}
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                          {m.nick_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              m.user_type === 50
                                ? "default"
                                : m.user_type === 10
                                ? "secondary"
                                : "outline"
                            }
                          >
                            {m.user_type === 50
                              ? "Owner"
                              : m.user_type === 10
                              ? "Admin"
                              : "Member"}
                          </Badge>
                        </TableCell>
                        <TableCell>{m.user_contact ?? "-"}</TableCell>
                        <TableCell className="space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(m)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(m.user_id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* pagination */}
                {membersTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={membersPage === 1}
                      onClick={() => loadMembersPage(membersPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {membersPage} of {membersTotalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={membersPage === membersTotalPages}
                      onClick={() => loadMembersPage(membersPage + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* ----- edit modal ----- */}
              {selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Edit {selectedUser.nick_name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedUser(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* basic info */}
                      <div className="space-y-3">
                        <h4 className="font-semibold">Basic Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Nickname</Label>
                            <Input
                              value={userForm.nick_name}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  nick_name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label>Contact</Label>
                            <Input
                              value={userForm.contact}
                              onChange={(e) =>
                                setUserForm({
                                  ...userForm,
                                  contact: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                        <Button size="sm" onClick={handleUpdateUser}>
                          Save Changes
                        </Button>
                      </div>

                      <Separator />

                      {/* role */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Role
                        </h4>
                        <div className="flex items-center gap-4">
                          <Select
                            value={role}
                            onValueChange={(v: "admin" | "normal") =>
                              setRole(v)
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">
                                Administrator
                              </SelectItem>
                              <SelectItem value="normal">
                                Ordinary Member
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" onClick={handleUpdateRole}>
                            Update Role
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* schedule */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Access Schedule
                        </h4>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={scheduleForm.permanent}
                            onCheckedChange={(c) =>
                              setScheduleForm({
                                ...scheduleForm,
                                permanent: c,
                              })
                            }
                          />
                          <Label>Permanent Access</Label>
                        </div>

                        {!scheduleForm.permanent && (
                          <>
                            {/* dates */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label>Effective Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !scheduleForm.effective_time &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      {scheduleForm.effective_time
                                        ? format(
                                            new Date(
                                              scheduleForm.effective_time * 1000
                                            ),
                                            "PPP"
                                          )
                                        : "Pick a date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <CalendarComponent
                                      mode="single"
                                      selected={
                                        scheduleForm.effective_time
                                          ? new Date(
                                              scheduleForm.effective_time * 1000
                                            )
                                          : undefined
                                      }
                                      onSelect={(d) =>
                                        setScheduleForm({
                                          ...scheduleForm,
                                          effective_time: d
                                            ? Math.floor(d.getTime() / 1000)
                                            : 0,
                                        })
                                      }
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <div>
                                <Label>Expiration Date</Label>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !scheduleForm.expired_time &&
                                          "text-muted-foreground"
                                      )}
                                    >
                                      {scheduleForm.expired_time
                                        ? format(
                                            new Date(
                                              scheduleForm.expired_time * 1000
                                            ),
                                            "PPP"
                                          )
                                        : "Pick a date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0">
                                    <CalendarComponent
                                      mode="single"
                                      selected={
                                        scheduleForm.expired_time
                                          ? new Date(
                                              scheduleForm.expired_time * 1000
                                            )
                                          : undefined
                                      }
                                      onSelect={(d) =>
                                        setScheduleForm({
                                          ...scheduleForm,
                                          expired_time: d
                                            ? Math.floor(d.getTime() / 1000)
                                            : 0,
                                        })
                                      }
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            </div>

                            {/* time slots */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Time Slots</Label>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setShowScheduleSlot(true)}
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Slot
                                </Button>
                              </div>

                              {showScheduleSlot && (
                                <Card className="p-3 space-y-3">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <Label>Start Time</Label>
                                      <div className="flex gap-1">
                                        <Select
                                          value={newSlot.start_hour.toString()}
                                          onValueChange={(v) =>
                                            setNewSlot({
                                              ...newSlot,
                                              start_hour: Number(v),
                                            })
                                          }
                                        >
                                          <SelectTrigger className="w-20">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.from(
                                              { length: 24 },
                                              (_, i) => (
                                                <SelectItem
                                                  key={i}
                                                  value={i.toString()}
                                                >
                                                  {i
                                                    .toString()
                                                    .padStart(2, "0")}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <Select
                                          value={newSlot.start_minute.toString()}
                                          onValueChange={(v) =>
                                            setNewSlot({
                                              ...newSlot,
                                              start_minute: Number(v),
                                            })
                                          }
                                        >
                                          <SelectTrigger className="w-20">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {[0, 15, 30, 45].map((m) => (
                                              <SelectItem
                                                key={m}
                                                value={m.toString()}
                                              >
                                                {m.toString().padStart(2, "0")}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>

                                    <div>
                                      <Label>End Time</Label>
                                      <div className="flex gap-1">
                                        <Select
                                          value={newSlot.end_hour.toString()}
                                          onValueChange={(v) =>
                                            setNewSlot({
                                              ...newSlot,
                                              end_hour: Number(v),
                                            })
                                          }
                                        >
                                          <SelectTrigger className="w-20">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {Array.from(
                                              { length: 24 },
                                              (_, i) => (
                                                <SelectItem
                                                  key={i}
                                                  value={i.toString()}
                                                >
                                                  {i
                                                    .toString()
                                                    .padStart(2, "0")}
                                                </SelectItem>
                                              )
                                            )}
                                          </SelectContent>
                                        </Select>
                                        <Select
                                          value={newSlot.end_minute.toString()}
                                          onValueChange={(v) =>
                                            setNewSlot({
                                              ...newSlot,
                                              end_minute: Number(v),
                                            })
                                          }
                                        >
                                          <SelectTrigger className="w-20">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {[0, 15, 30, 45].map((m) => (
                                              <SelectItem
                                                key={m}
                                                value={m.toString()}
                                              >
                                                {m.toString().padStart(2, "0")}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label>Days</Label>
                                    <div className="flex gap-2 flex-wrap">
                                      {[
                                        { bit: 1, label: "Sun" },
                                        { bit: 2, label: "Mon" },
                                        { bit: 4, label: "Tue" },
                                        { bit: 8, label: "Wed" },
                                        { bit: 16, label: "Thu" },
                                        { bit: 32, label: "Fri" },
                                        { bit: 64, label: "Sat" },
                                      ].map((d) => (
                                        <label
                                          key={d.bit}
                                          className="flex items-center gap-1 cursor-pointer"
                                        >
                                          <Checkbox
                                            checked={
                                              newSlot.days[
                                                d.bit as keyof typeof newSlot.days
                                              ]
                                            }
                                            onCheckedChange={(c) =>
                                              setNewSlot({
                                                ...newSlot,
                                                days: {
                                                  ...newSlot.days,
                                                  [d.bit]: c as boolean,
                                                },
                                              })
                                            }
                                          />
                                          <span className="text-sm">
                                            {d.label}
                                          </span>
                                        </label>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <Button size="sm" onClick={addScheduleSlot}>
                                      <Check className="h-3 w-3 mr-1" />
                                      Add
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setShowScheduleSlot(false)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </Card>
                              )}

                              {/* list of slots */}
                              <div className="space-y-1">
                                {scheduleForm.schedule_details.map(
                                  (slot, i) => {
                                    const start = `${Math.floor(
                                      slot.start_minute / 60
                                    )
                                      .toString()
                                      .padStart(2, "0")}:${(
                                      slot.start_minute % 60
                                    )
                                      .toString()
                                      .padStart(2, "0")}`;
                                    const end = `${Math.floor(
                                      slot.end_minute / 60
                                    )
                                      .toString()
                                      .padStart(2, "0")}:${(
                                      slot.end_minute % 60
                                    )
                                      .toString()
                                      .padStart(2, "0")}`;
                                    const days = [
                                      slot.working_day & 1 ? "Sun" : "",
                                      slot.working_day & 2 ? "Mon" : "",
                                      slot.working_day & 4 ? "Tue" : "",
                                      slot.working_day & 8 ? "Wed" : "",
                                      slot.working_day & 16 ? "Thu" : "",
                                      slot.working_day & 32 ? "Fri" : "",
                                      slot.working_day & 64 ? "Sat" : "",
                                    ]
                                      .filter(Boolean)
                                      .join(", ");

                                    return (
                                      <div
                                        key={i}
                                        className="flex items-center justify-between p-2 border rounded"
                                      >
                                        <span className="text-sm">
                                          {start} – {end} ({days || "No days"})
                                        </span>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => removeScheduleSlot(i)}
                                        >
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>

                            <Button size="sm" onClick={handleUpdateSchedule}>
                              Save Schedule
                            </Button>
                          </>
                        )}
                      </div>

                      <Separator />

                      {/* unlock methods */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Fingerprint className="h-4 w-4" />
                          Unlock Methods
                        </h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {opmodes.map((op) => (
                              <TableRow key={`${op.dp_code}-${op.unlock_sn}`}>
                                <TableCell>{op.unlock_name}</TableCell>
                                <TableCell>
                                  {op.dp_code
                                    .replace("unlock_", "")
                                    .replace("_", " ")}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleUnbindOpMode(op)}
                                  >
                                    Unbind
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        {opmodesTotalPages > 1 && (
                          <div className="flex justify-center items-center gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={opmodesPage === 1}
                              onClick={() => loadOpmodesPage(opmodesPage - 1)}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                              Page {opmodesPage} of {opmodesTotalPages}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={opmodesPage === opmodesTotalPages}
                              onClick={() => loadOpmodesPage(opmodesPage + 1)}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
