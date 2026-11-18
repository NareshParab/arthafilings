"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

function columnsForCount(count: number) {
  if (count > 18) return "sm:grid-cols-3";
  if (count > 8) return "sm:grid-cols-2";
  return "";
}

// Desktop mega menu: the 9 groups across the top, each opening a panel of that
// group's services. Hover or click opens; Escape and arrow keys navigate.
export default function MegaMenu() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  function closeMenu(refocusIndex?: number) {
    setOpenSlug(null);
    if (refocusIndex !== undefined) {
      triggerRefs.current[refocusIndex]?.focus();
    }
  }

  useEffect(() => {
    if (!openSlug) return;

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenSlug(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        const index = serviceGroups.findIndex((group) => group.slug === openSlug);
        closeMenu(index);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openSlug]);

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
      setOpenSlug(slug);
      requestAnimationFrame(() => {
        const panel = panelRefs.current[index];
        const firstLink = panel?.querySelector<HTMLAnchorElement>("a");
        firstLink?.focus();
      });
    }
  }

  function handlePanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>, index: number) {
    const panel = panelRefs.current[index];
    if (!panel) return;
    const links = Array.from(panel.querySelectorAll<HTMLAnchorElement>("a"));
    const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

    if (event.key === "Escape") {
      event.preventDefault();
      closeMenu(index);
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

  return (
    <div ref={containerRef} className="relative hidden items-center gap-1 md:flex" aria-label="Service categories">
      {serviceGroups.map((group, index) => {
        const isOpen = openSlug === group.slug;
        const groupServices = getGroupServices(group.slug);

        return (
          <div key={group.slug} className="relative">
            <Button
              ref={(node) => {
                triggerRefs.current[index] = node;
              }}
              variant="ghost"
              size="sm"
              className="gap-1 text-foreground"
              aria-haspopup="true"
              aria-expanded={isOpen}
              aria-controls={`mega-panel-${group.slug}`}
              onMouseEnter={() => setOpenSlug(group.slug)}
              onClick={() => setOpenSlug(isOpen ? null : group.slug)}
              onKeyDown={(event) => handleTriggerKeyDown(event, index, group.slug)}
            >
              {group.name}
              <ChevronDown
                className={cn("size-3.5 transition-transform", isOpen && "rotate-180")}
                aria-hidden="true"
              />
            </Button>

            {isOpen && (
              <div
                id={`mega-panel-${group.slug}`}
                ref={(node) => {
                  panelRefs.current[index] = node;
                }}
                role="region"
                aria-label={`${group.name} services`}
                onMouseLeave={() => setOpenSlug(null)}
                onKeyDown={(event) => handlePanelKeyDown(event, index)}
                className="absolute left-0 top-full z-50 mt-1 w-[min(90vw,32rem)] rounded-xl bg-popover p-4 shadow-md ring-1 ring-foreground/10"
              >
                <p className="text-xs text-muted-foreground">{group.description}</p>
                <div className={cn("mt-3 grid gap-x-6 gap-y-2", columnsForCount(groupServices.length))}>
                  {groupServices.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/${service.slug}`}
                      onClick={() => setOpenSlug(null)}
                      className="rounded-md px-1.5 py-1 text-sm text-foreground outline-none hover:bg-muted hover:text-primary-hover focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
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
