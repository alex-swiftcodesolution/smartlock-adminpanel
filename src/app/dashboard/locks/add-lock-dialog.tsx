"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
import type { SmartLock } from "@/lib/locks/types";
import { Loader, CheckCircle, Router } from "lucide-react";

interface AddLockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLockAdded: (newLock: SmartLock) => void;
}

// Define the steps for our wizard
type PairingStep = "instructions" | "searching" | "found" | "success";

export function AddLockDialog({
  isOpen,
  onOpenChange,
  onLockAdded,
}: AddLockDialogProps) {
  const [step, setStep] = useState<PairingStep>("instructions");

  // We'll store the partially discovered device here
  const [foundDevice, setFoundDevice] = useState<Partial<SmartLock> | null>(
    null
  );

  // State for the final user-provided details
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  // Reset state whenever the dialog is closed
  useEffect(() => {
    if (!isOpen) {
      // Add a small delay to allow for the closing animation
      setTimeout(() => {
        setStep("instructions");
        setFoundDevice(null);
        setName("");
        setLocation("");
        setError("");
      }, 300);
    }
  }, [isOpen]);

  const handleStartPairing = () => {
    setStep("searching");
    // Simulate the time it takes for a device to be found
    setTimeout(() => {
      // Create a mock "discovered" device
      setFoundDevice({
        id: `SL-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        model: "TuyaGuard Pro",
        status: "locked",
        isOnline: true,
      });
      setStep("found");
    }, 4000); // 4-second delay
  };

  const handleConfirmAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim()) {
      setError("Name and location are required.");
      return;
    }

    const newLock: SmartLock = {
      ...(foundDevice as Partial<SmartLock>),
      name: name.trim(),
      location: location.trim(),
      battery: Math.floor(Math.random() * (100 - 50 + 1) + 50),
      events: [
        {
          id: `evt-${Date.now()}`,
          type: "locked",
          timestamp: new Date().toISOString(),
          user: "Admin",
          message: "Device paired and configured via admin panel.",
        },
      ],
    } as SmartLock;

    onLockAdded(newLock);
    setStep("success");
  };

  const renderContent = () => {
    switch (step) {
      case "instructions":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Add a New Smart Lock</DialogTitle>
              <DialogDescription>
                This will begin the pairing process. Please ensure your device
                is powered on and in pairing mode (usually with a blinking
                light).
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <Router className="h-16 w-16 text-primary" />
              <p className="text-muted-foreground">
                The system will search for a new, un-paired device on your
                network.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleStartPairing}>Begin Pairing</Button>
            </DialogFooter>
          </>
        );

      case "searching":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Searching for Device...</DialogTitle>
              <DialogDescription>
                Listening for a new device to connect to the Tuya Cloud. This
                may take up to a minute.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader className="h-16 w-16 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Waiting for device signal...
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("instructions")}>
                Cancel
              </Button>
            </DialogFooter>
          </>
        );

      case "found":
        return (
          <form onSubmit={handleConfirmAdd}>
            <DialogHeader>
              <DialogTitle>Device Found!</DialogTitle>
              <DialogDescription>
                A new device has been detected. Please name it and assign a
                location before adding it to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg border bg-muted p-4">
                <p className="text-sm font-medium">
                  Model: {foundDevice?.model}
                </p>
                <p className="text-sm text-muted-foreground">
                  Device ID: {foundDevice?.id}
                </p>
              </div>
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
              {error && (
                <p className="col-span-4 text-center text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("instructions")}>
                Cancel
              </Button>
              <Button type="submit">Confirm & Add Device</Button>
            </DialogFooter>
          </form>
        );

      case "success":
        return (
          <>
            <DialogHeader>
              <DialogTitle>Success!</DialogTitle>
              <DialogDescription>
                The new lock has been successfully added to your dashboard.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-8">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="font-semibold">{name}</p>
              <p className="text-muted-foreground">has been paired.</p>
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
