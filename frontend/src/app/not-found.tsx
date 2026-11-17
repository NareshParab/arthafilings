import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-blue-tint px-4 py-20 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-navy sm:text-4xl">
        We couldn&apos;t find that page
      </h1>
      <p className="mt-3 max-w-md text-foreground">
        The page you&apos;re looking for may have moved or no longer exists.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button nativeButton={false} render={<Link href="/">Go home</Link>} />
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/proprietorship-registration">Proprietorship Registration</Link>}
        />
      </div>
    </div>
  );
}
