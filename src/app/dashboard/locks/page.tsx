// src/app/dashboard/locks/page.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getLocks } from "@/lib/locks/api";
import type { SmartLock } from "@/lib/locks/types";
import { LocksDataTable, columns } from "./data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { AddLockDialog } from "./add-lock-dialog";
import { Skeleton } from "@/components/ui/skeleton";

function LocksPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <Card>
        <CardContent className="pt-6">
          <Skeleton className="h-96" />
        </CardContent>
      </Card>
    </div>
  );
}

export default function LocksPage() {
  const [locks, setLocks] = useState<SmartLock[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setLocks(await getLocks());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <LocksPageSkeleton />;

  return (
    <>
      <AddLockDialog
        isOpen={open}
        onOpenChange={setOpen}
        onLockAdded={(l) => {
          setLocks((p) => [l, ...p]);
          toast.success("Added");
        }}
      />
      <div className="space-y-6">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold">Manage Locks</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={load}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
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
