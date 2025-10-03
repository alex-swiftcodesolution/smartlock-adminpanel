"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmartLock } from "@/lib/dummy-data";

interface AddLockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLockAdded: (newLock: SmartLock) => void;
}

export function AddLockDialog({
  isOpen,
  onOpenChange,
  onLockAdded,
}: AddLockDialogProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [model, setModel] = useState("TuyaGuard Pro");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setError("Name and location are required.");
      return;
    }

    // Create a new mock lock object
    const newLock: SmartLock = {
      id: `SL-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      name: name.trim(),
      location: location.trim(),
      model: model.trim(),
      status: "locked",
      battery: Math.floor(Math.random() * (100 - 50 + 1) + 50), // Random battery between 50-100
      isOnline: true,
      events: [
        {
          id: `evt-${Date.now()}`,
          type: "locked",
          timestamp: new Date().toISOString(),
          user: "Admin",
          message: "Device added and locked remotely.",
        },
      ],
    };

    onLockAdded(newLock);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setLocation("");
    setModel("TuyaGuard Pro");
    setError("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Lock</DialogTitle>
          <DialogDescription>
            Enter the details for the new smart lock. Click save when
            you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Main Entrance"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
                placeholder="e.g., Lobby"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">
                Model
              </Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="col-span-3"
              />
            </div>
            {error && (
              <p className="col-span-4 text-center text-sm text-red-500">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Add Lock</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
