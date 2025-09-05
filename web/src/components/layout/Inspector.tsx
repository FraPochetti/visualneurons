"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function Inspector() {
    return (
        <div className="h-full border-l">
            <div className="px-4 py-3">
                <h2 className="text-sm font-medium">Inspector</h2>
            </div>
            <Separator />
            <ScrollArea className="h-[calc(100%-44px)] p-3">
                <div className="space-y-2 text-sm">
                    <Card className="p-3">Properties</Card>
                    <Card className="p-3">Versions</Card>
                    <Card className="p-3">Actions</Card>
                </div>
            </ScrollArea>
        </div>
    );
}


