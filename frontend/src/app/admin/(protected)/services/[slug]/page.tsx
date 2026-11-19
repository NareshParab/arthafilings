import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceEditor } from "@/components/admin/ServiceEditor";

export const metadata: Metadata = { title: "Service editor" };

function ServiceEditorSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 rounded bg-muted" />
      <div className="h-40 rounded bg-muted" />
    </div>
  );
}

async function ServiceEditorContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ServiceEditor slug={slug} />;
}

export default function AdminServiceEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<ServiceEditorSkeleton />}>
      <ServiceEditorContent params={params} />
    </Suspense>
  );
}
