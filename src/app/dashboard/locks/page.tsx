"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getLocks, SmartLock } from "@/lib/dummy-data";
import { LocksDataTable, columns } from "./data-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddLockDialog } from "./add-lock-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function LocksPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      {/* Skeleton for the header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-[250px]" />
        <Skeleton className="h-9 w-[140px]" />
      </div>
      <Card>
        <CardContent className="pt-6">
          {/* Skeleton for the mobile card view */}
          <div className="grid gap-4 md:hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-3/5" />
                    <Skeleton className="h-6 w-1/4" />
                  </div>
                </CardHeader>
                <CardContent className="grid gap-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Skeleton for the desktop table view */}
          <div className="hidden rounded-md border md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-5 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LocksPage() {
  const [locks, setLocks] = useState<SmartLock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadLocks = async () => {
      await new Promise((resolve) => setTimeout(resolve, 750));
      const data = await getLocks();
      setLocks(data);
      setIsLoading(false);
    };
    loadLocks();
  }, []);

  const handleLockAdded = (newLock: SmartLock) => {
    setLocks((prevLocks) => [newLock, ...prevLocks]);
    setIsDialogOpen(false);
    toast.success(`Successfully added lock: "${newLock.name}"`);
  };

  if (isLoading) {
    return <LocksPageSkeleton />;
  }

  return (
    <>
      <AddLockDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onLockAdded={handleLockAdded}
      />

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Locks</h1>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Lock
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <LocksDataTable columns={columns} data={locks} />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
