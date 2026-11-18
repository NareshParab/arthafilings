"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-blue-tint px-4 py-20 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-foreground">
        Please try again. If the problem continues, contact us and we&apos;ll help.
      </p>
      <div className="mt-8">
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
