"use client";

import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import { useCallback, useEffect, useRef, useState } from "react";

export function AssetList() {
    const { assets, loadAssets, uploadImage, selectAsset, currentAsset, isLoading } = useApp();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        loadAssets();
    }, [loadAssets]);

    const onFilesSelected = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        await uploadImage(file, file.name);
    }, [uploadImage]);

    const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        await onFilesSelected(e.dataTransfer.files);
    }, [onFilesSelected]);

    const onPaste = useCallback(async (e: React.ClipboardEvent<HTMLDivElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === "file") {
                const file = item.getAsFile();
                if (file) {
                    await onFilesSelected({ 0: file, length: 1, item: () => file } as unknown as FileList);
                }
            }
        }
    }, [onFilesSelected]);

    return (
        <div className="h-full border-r" onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={onDrop} onPaste={onPaste}>
            <div className="px-4 py-3 flex items-center justify-between">
                <h2 className="text-sm font-medium">Assets</h2>
                <div className="flex items-center gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFilesSelected(e.target.files)} />
                    <Button size="sm" variant="secondary" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>Upload</Button>
                </div>
            </div>
            <Separator />
            <div className={`px-3 ${isDragging ? 'bg-accent/40' : ''}`}>
                <p className="text-xs text-muted-foreground py-2">Drag & drop or paste an image here to upload</p>
            </div>
            <ScrollArea className="h-[calc(100%-72px)] p-3">
                <div className="space-y-2">
                    {assets.map((asset) => (
                        <Card key={asset.assetId} className={`p-3 text-sm cursor-pointer ${currentAsset?.assetId === asset.assetId ? 'border-primary' : ''}`} onClick={() => selectAsset(asset)}>
                            {asset.title}
                        </Card>
                    ))}
                    {assets.length === 0 && (
                        <p className="text-xs text-muted-foreground">No assets yet. Upload an image to create one.</p>
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}


