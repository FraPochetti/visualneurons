"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ChatTimeline() {
    return (
        <div className="flex h-full flex-col">
            <div className="px-4 py-3 border-b">
                <h2 className="text-sm font-medium">Timeline</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, idx) => (
                        <Card key={idx} className="p-4 text-sm">
                            Message result {idx + 1}
                        </Card>
                    ))}
                </div>
            </ScrollArea>
            <Separator />
            <div className="p-3 flex gap-2 border-t">
                <Input placeholder="Type a prompt or choose a tool…" />
                <Button>Send</Button>
            </div>
        </div>
    );
}


