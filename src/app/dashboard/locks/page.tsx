"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getLocks, SmartLock } from "@/lib/dummy-data";
import { LocksDataTable, columns } from "./data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { AddLockDialog } from "./add-lock-dialog";

export default function LocksPage() {
  const [locks, setLocks] = useState<SmartLock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loadLocks = async () => {
      const data = await getLocks();
      setLocks(data);
      setIsLoading(false);
    };
    loadLocks();
  }, []);

  const handleLockAdded = (newLock: SmartLock) => {
    setLocks((prevLocks) => [newLock, ...prevLocks]);
    setIsDialogOpen(false); // Close the dialog
    toast.success(`Successfully added lock: "${newLock.name}"`);
  };

  if (isLoading) {
    return <div className="p-6">Loading lock data...</div>;
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
