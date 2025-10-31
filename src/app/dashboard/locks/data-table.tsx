/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { MoreHorizontal, Lock, Unlock, Wifi, Battery } from "lucide-react";

import { SmartLock } from "@/lib/dummy-data";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ActionsCell = ({ lock }: { lock: SmartLock }) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [actionType, setActionType] = React.useState<"lock" | "unlock" | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleActionClick = (type: "lock" | "unlock") => {
    setActionType(type);
    setIsDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!actionType) return;
    setIsSubmitting(true);
    const toastId = toast.loading(`Sending ${actionType} command...`);

    try {
      await sendLockCommand(lock.id, actionType);
      toast.success(`Lock "${lock.name}" ${actionType}ed.`, { id: toastId });
    } catch (err: any) {
      toast.error(`Failed to ${actionType} lock: ${err.message}`, {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <div className="flex items-center justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/locks/${lock.id}`}>View Details</Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>More Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onSelect={() => handleActionClick("unlock")}
                disabled={lock.status === "unlocked"}
              >
                <Unlock className="mr-2 h-4 w-4" />
                Remote Unlock
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleActionClick("lock")}
                disabled={lock.status === "locked"}
              >
                <Lock className="mr-2 h-4 w-4" />
                Remote Lock
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Remotely <span className="font-semibold">{actionType}</span> the
              lock{" "}
              <span className="font-semibold">&quot;{lock.name}&quot;</span>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? "Confirming..." : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export const columns: ColumnDef<SmartLock>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "locked"
          ? "default"
          : status === "unlocked"
          ? "secondary"
          : "destructive";
      return (
        <Badge variant={variant}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "battery",
    header: "Battery",
    cell: ({ row }) => {
      const battery = Number(row.getValue("battery"));
      return (
        <div className="flex items-center gap-2">
          <Progress value={battery} className="w-24" />
          <span>{battery}%</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isOnline",
    header: "Connectivity",
    cell: ({ row }) =>
      row.getValue("isOnline") ? (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Online
        </Badge>
      ) : (
        <Badge variant="destructive">Offline</Badge>
      ),
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="text-right">
        <ActionsCell lock={row.original} />
      </div>
    ),
  },
];

const MobileLockCard = ({
  lock,
  index,
}: {
  lock: SmartLock;
  index: number;
}) => {
  const statusVariant =
    lock.status === "locked"
      ? "default"
      : lock.status === "unlocked"
      ? "secondary"
      : "destructive";

  const handleAction = async (action: "lock" | "unlock") => {
    const toastId = toast.loading(`Sending ${action} command...`);
    try {
      await sendLockCommand(lock.id, action);
      toast.success(`Lock ${action}ed.`, { id: toastId });
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`, { id: toastId });
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
      }}
      transition={{ delay: index * 0.05 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{lock.name}</CardTitle>
            <Badge variant={statusVariant}>{lock.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Location</span>
            <span>{lock.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Battery size={14} /> Battery
            </span>
            <span
              className={lock.battery < 25 ? "text-destructive font-bold" : ""}
            >
              {lock.battery}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Wifi size={14} /> Status
            </span>
            {lock.isOnline ? (
              <Badge
                variant="outline"
                className="border-green-500 text-green-500"
              >
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">Offline</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            size="sm"
            className="flex-1"
            disabled={lock.status === "locked"}
            onClick={() => handleAction("lock")}
          >
            <Lock className="mr-1 h-3 w-3" /> Lock
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            disabled={lock.status === "unlocked"}
            onClick={() => handleAction("unlock")}
          >
            <Unlock className="mr-1 h-3 w-3" /> Unlock
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/locks/${lock.id}`}>View</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export function LocksDataTable({
  columns,
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
        {data.map((lock, i) => (
          <MobileLockCard key={lock.id} lock={lock} index={i} />
        ))}
      </motion.div>

      <div className="hidden rounded-md border md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((g) => (
              <TableRow key={g.id}>
                {g.headers.map((h) => (
                  <TableHead key={h.id}>
                    {h.isPlaceholder
                      ? null
                      : flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
