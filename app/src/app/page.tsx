"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { AssetList } from "@/components/layout/AssetList";
import { ChatTimeline } from "@/components/layout/ChatTimeline";
import { Inspector } from "@/components/layout/Inspector";
import { AuthWrapper } from "@/components/auth/AuthWrapper";

export default function Home() {
  return (
    <AuthWrapper>
      <div className="h-full w-full">
        <div className="md:hidden flex h-full items-center justify-center p-6 text-center">
          <p className="text-sm text-muted-foreground">
            This MVP is desktop-only. Please use a larger screen (≥ md).
          </p>
        </div>
        <div className="hidden md:flex h-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={22} minSize={16} maxSize={32}>
              <AssetList />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={56} minSize={40}>
              <ChatTimeline />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={22} minSize={18} maxSize={34}>
              <Inspector />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </AuthWrapper>
  );
}
