"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function AssetList() {
    return (
        <div className="h-full border-r">
            <div className="px-4 py-3">
                <h2 className="text-sm font-medium">Assets</h2>
            </div>
            <Separator />
            <ScrollArea className="h-[calc(100%-44px)] p-3">
                <div className="space-y-2">
                    {Array.from({ length: 12 }).map((_, idx) => (
                        <Card key={idx} className="p-3 text-sm">
                            Untitled Asset {idx + 1}
                        </Card>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}


