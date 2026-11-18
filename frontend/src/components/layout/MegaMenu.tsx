"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { serviceGroups, getGroupServices } from "@/data/service-catalog";

const OPEN_DELAY_MS = 120;
const CLOSE_DELAY_MS = 180;

function columnsForCount(count: number) {
  if (count > 12) return "grid-cols-4";
  if (count > 6) return "grid-cols-3";
  return "grid-cols-2";
}

// Desktop mega menu: the 9 groups across the top (1280px and wider), each
// opening one shared panel centred under the header — never anchored to the
// trigger itself, so it can never be clipped at the screen edge.
export default function MegaMenu() {
  const pathname = usePathname();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [lastPathname, setLastPathname] = useState(pathname);

  // Close on route change — adjusted during render rather than in an effect,
  // per React's guidance for resetting state when a prop changes.
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpenSlug(null);
  }
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearTimers() {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    openTimerRef.current = null;
    closeTimerRef.current = null;
  }

  function openNow(slug: string) {
    clearTimers();
    setOpenSlug(slug);
  }

  function closeNow(refocusIndex?: number) {
    clearTimers();
    setOpenSlug(null);
    if (refocusIndex !== undefined) {
      triggerRefs.current[refocusIndex]?.focus();
    }
  }

  function scheduleOpen(slug: string) {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    if (openSlug === slug) return;
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = setTimeout(() => setOpenSlug(slug), OPEN_DELAY_MS);
  }

  function scheduleClose() {
    if (openTimerRef.current) clearTimeout(openTimerRef.current);
    openTimerRef.current = null;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpenSlug(null), CLOSE_DELAY_MS);
  }

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!openSlug) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (navRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpenSlug(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const index = serviceGroups.findIndex((group) => group.slug === openSlug);
        closeNow(index);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSlug]);

  useEffect(() => clearTimers, []);

  function focusTrigger(index: number) {
    const count = serviceGroups.length;
    const nextIndex = (index + count) % count;
    triggerRefs.current[nextIndex]?.focus();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, index: number, slug: string) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusTrigger(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusTrigger(index - 1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      openNow(slug);
      requestAnimationFrame(() => {
        panelRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
      });
    }
  }

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>, index: number) {
    const panel = panelRef.current;
    if (!panel) return;
    const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>("a"));
    const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeNow(index);
    } else if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = links[(currentIndex + 1 + links.length) % links.length];
      next?.focus();
    } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      if (currentIndex <= 0) {
        focusTrigger(index);
        setOpenSlug(null);
        return;
      }
      links[currentIndex - 1]?.focus();
    }
  }

  const openIndex = serviceGroups.findIndex((group) => group.slug === openSlug);
  const openGroup = openIndex >= 0 ? serviceGroups[openIndex] : null;

  return (
    <>
      <nav
        ref={navRef}
        className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto xl:flex"
        aria-label="Service categories"
      >
        {serviceGroups.map((group, index) => {
          const isOpen = openSlug === group.slug;

          return (
            <Button
              key={group.slug}
              ref={(node) => {
                triggerRefs.current[index] = node;
              }}
              variant="ghost"
              size="sm"
              className={cn(
                "gap-1 whitespace-nowrap px-2.5 text-[15px] text-foreground",
                isOpen && "bg-muted text-primary"
              )}
              aria-haspopup="true"
              aria-expanded={isOpen}
              aria-controls="mega-menu-panel"
              onMouseEnter={() => scheduleOpen(group.slug)}
              onMouseLeave={scheduleClose}
              onClick={() => (isOpen ? closeNow() : openNow(group.slug))}
              onKeyDown={(event) => handleTriggerKeyDown(event, index, group.slug)}
            >
              {group.name}
              <ChevronDown
                className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
                aria-hidden="true"
              />
            </Button>
          );
        })}
      </nav>

      {openGroup && (
        <div
          id="mega-menu-panel"
          ref={panelRef}
          role="region"
          aria-label={`${openGroup.name} services`}
          onMouseEnter={() => {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            closeTimerRef.current = null;
          }}
          onMouseLeave={scheduleClose}
          onKeyDown={(event) => handlePanelKeyDown(event, openIndex)}
          className="absolute top-full left-1/2 z-50 w-[min(72rem,calc(100vw-2rem))] -translate-x-1/2 overflow-y-auto rounded-xl bg-popover p-6 shadow-md ring-1 ring-foreground/10"
          style={{ maxHeight: "calc(100vh - 124px)" }}
        >
          <div className="grid grid-cols-[16rem_1fr] gap-8">
            <div>
              <h3 className="font-semibold text-navy">{openGroup.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{openGroup.description}</p>
              <Link
                href={`/services/${openGroup.slug}`}
                onClick={() => setOpenSlug(null)}
                className="mt-4 inline-block text-sm font-medium text-primary hover:text-primary-hover"
              >
                View all {openGroup.name} services →
              </Link>
            </div>

            <div className={cn("grid gap-x-6 gap-y-1.5", columnsForCount(getGroupServices(openGroup.slug).length))}>
              {getGroupServices(openGroup.slug).map((service) => (
                <Link
                  key={service.slug}
                  href={`/${service.slug}`}
                  onClick={() => setOpenSlug(null)}
                  className="rounded-md px-1.5 py-1 text-[15px] text-foreground outline-none hover:bg-muted hover:text-primary-hover focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {service.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Mobile: an accordion by group, used inside the Header's Sheet.
export function ServiceGroupAccordion({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Accordion className="w-full">
      {serviceGroups.map((group) => (
        <AccordionItem key={group.slug} value={group.slug}>
          <AccordionTrigger>{group.name}</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col gap-1">
              {getGroupServices(group.slug).map((service) => (
                <Link
                  key={service.slug}
                  href={`/${service.slug}`}
                  onClick={onNavigate}
                  className="rounded-md px-1.5 py-1.5 text-sm text-foreground hover:bg-muted hover:text-primary-hover"
                >
                  {service.name}
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
