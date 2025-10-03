"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { MoreHorizontal, Lock, Unlock } from "lucide-react";

import { SmartLock } from "@/lib/dummy-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
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

// Helper function to simulate an API call
const simulateApiCall = () =>
  new Promise((resolve) => setTimeout(resolve, 1000));

// The ActionsCell component is updated to have a separate button
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
      await simulateApiCall(); // Replace with your actual API call
      toast.success(`Lock "${lock.name}" has been ${actionType}ed.`, {
        id: toastId,
      });
    } catch (error) {
      toast.error(`Failed to ${actionType} lock "${lock.name}".`, {
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
        {/* We now use a flex container to align the button and the dropdown */}
        <div className="flex items-center justify-end gap-2">
          {/* THE NEW PROMINENT BUTTON */}
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/locks/${lock.id}`}>View Details</Link>
          </Button>

          {/* The dropdown now only contains secondary actions */}
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
                <span>Remote Unlock</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => handleActionClick("lock")}
                disabled={lock.status === "locked"}
              >
                <Lock className="mr-2 h-4 w-4" />
                <span>Remote Lock</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* The Dialog for confirmation remains unchanged */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to remotely{" "}
              <span className="font-semibold">{actionType}</span> the lock named{" "}
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
              {isSubmitting ? `Confirming...` : `Confirm ${actionType}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// The columns definition remains the same, as it just renders the ActionsCell
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
      const battery = parseFloat(row.getValue("battery"));
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
    cell: ({ row }) => {
      return row.getValue("isOnline") ? (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Online
        </Badge>
      ) : (
        <Badge variant="destructive">Offline</Badge>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    id: "actions",
    // We align the cell content to the right
    cell: ({ row }) => (
      <div className="text-right">
        <ActionsCell lock={row.original} />
      </div>
    ),
  },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function LocksDataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
