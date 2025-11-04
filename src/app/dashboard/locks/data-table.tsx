"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  MoreHorizontal,
  Lock,
  Unlock,
  DoorOpen,
  DoorClosed,
} from "lucide-react";

import { remoteUnlock } from "@/lib/locks/api";
import type { SmartLock } from "@/lib/locks/types";
import { sendLockCommand } from "@/lib/tuya/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ActionsCell = ({ lock }: { lock: SmartLock }) => {
  const [open, setOpen] = React.useState(false);
  const [action, setAction] = React.useState<"lock" | "unlock" | null>(null);
  const [sending, setSending] = React.useState(false);

  const run = async () => {
    setSending(true);
    try {
      await sendLockCommand(lock.id, action!);
      toast.success(`${action}ed`);
    } catch {
      toast.error("Failed");
    }
    setSending(false);
    setOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onSelect={() => {
              setAction("unlock");
              setOpen(true);
            }}
            disabled={lock.status === "unlocked"}
          >
            <Unlock className="mr-2 h-4 w-4" />
            Unlock
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => {
              setAction("lock");
              setOpen(true);
            }}
            disabled={lock.status === "locked"}
          >
            <Lock className="mr-2 h-4 w-4" />
            Lock
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={async () => {
              try {
                await remoteUnlock(lock.id);
                toast.success("Remote unlock sent");
              } catch {
                toast.error("Failed");
              }
            }}
          >
            Remote Unlock (App)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-80">
            <CardHeader>
              <CardTitle>Confirm {action}</CardTitle>
            </CardHeader>
            <CardContent>
              Remote {action} &quot;{lock.name}&quot;?
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={run} disabled={sending}>
                {sending ? "..." : "Confirm"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
};

export const columns: ColumnDef<SmartLock>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "locked"
            ? "default"
            : row.original.status === "unlocked"
            ? "secondary"
            : "destructive"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "battery",
    header: "Battery",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Progress value={row.original.battery} className="w-20" />
        <span>{row.original.battery}%</span>
      </div>
    ),
  },
  {
    accessorKey: "door",
    header: "Door",
    cell: ({ row }) =>
      row.original.door === true ? (
        <DoorOpen className="text-green-500" />
      ) : row.original.door === false ? (
        <DoorClosed />
      ) : (
        "-"
      ),
  },
  {
    accessorKey: "isOnline",
    header: "Link",
    cell: ({ row }) =>
      row.original.isOnline ? (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Online
        </Badge>
      ) : (
        <Badge variant="destructive">Offline</Badge>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <Button asChild variant="outline" size="sm" className="mr-2">
          <Link href={`/dashboard/locks/${row.original.id}`}>View</Link>
        </Button>
        <ActionsCell lock={row.original} />
      </div>
    ),
  },
];

const MobileCard = ({ lock, i }: { lock: SmartLock; i: number }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay: i * 0.05 }}
  >
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>{lock.name}</CardTitle>
          <Badge variant={lock.status === "locked" ? "default" : "secondary"}>
            {lock.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Battery</span>
          <span>{lock.battery}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Door</span>
          {lock.door === true ? "Open" : lock.door === false ? "Closed" : "-"}
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => sendLockCommand(lock.id, "lock")}
          disabled={lock.status === "locked"}
        >
          Lock
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="flex-1"
          onClick={() => sendLockCommand(lock.id, "unlock")}
          disabled={lock.status === "unlocked"}
        >
          Unlock
        </Button>
        <Button size="sm" variant="outline" asChild>
          <Link href={`/dashboard/locks/${lock.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  </motion.div>
);

export function LocksDataTable({
  data,
}: {
  columns: ColumnDef<SmartLock>[];
  data: SmartLock[];
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <motion.div
        className="grid gap-4 md:hidden"
        initial="hidden"
        animate="visible"
      >
        {data.map((l, i) => (
          <MobileCard key={l.id} lock={l} i={i} />
        ))}
      </motion.div>
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((g) => (
              <TableRow key={g.id}>
                {g.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((r) => (
              <TableRow key={r.id}>
                {r.getVisibleCells().map((c) => (
                  <TableCell key={c.id}>
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
