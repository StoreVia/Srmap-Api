"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface SimulationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: number) => void;
    title: string;
    description: string;
    inputLabel: string;
    buttonText: string;
}

const SimulationDialog = ({ isOpen, onClose, onConfirm, title, description, inputLabel, buttonText }: SimulationDialogProps) => {
    const [value, setValue] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 0) {
            onConfirm(numValue);
            setValue("");
            onClose();
        }
    };

    const handleClose = () => {
        setValue("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="simulation-input" className="text-sm font-medium">
                            {inputLabel}
                        </label>
                        <Input
                            id="simulation-input"
                            type="number"
                            min="1"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Enter number of classes"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                            {buttonText}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SimulationDialog;