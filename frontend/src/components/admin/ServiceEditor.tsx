"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowUp, ArrowDown, Plus, Trash2, ExternalLink, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getService } from "@/data/service-catalog";
import { useAdminSession } from "@/lib/admin-session";
import { getAdminServiceContent, saveServiceContent } from "@/lib/admin-services-store";
import { canManageCatalog } from "@/lib/admin-permissions";
import { canMarkContentReady, canGoLive } from "@/lib/admin-service-rules";
import { NoAccessPage } from "@/components/admin/NoAccessPage";
import type { AdminServiceContent, AdminServiceFaq, AdminServiceDocument, AdminServicePackage } from "@/types/admin";

function moveItem<T>(arr: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1000)}`;
}

function RuleBanner({ title, result }: { title: string; result: { ok: boolean; reasons: string[] } }) {
  if (result.ok) {
    return (
      <p className="flex items-center gap-1.5 rounded-lg bg-blue-tint px-3 py-2 text-sm text-primary">
        <Check className="size-3.5 shrink-0" /> {title}
      </p>
    );
  }
  return (
    <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <p className="flex items-center gap-1.5 font-medium">
        <X className="size-3.5 shrink-0" /> {title}
      </p>
      <ul className="mt-1 list-disc space-y-0.5 pl-6">
        {result.reasons.map((reason) => (
          <li key={reason}>{reason}</li>
        ))}
      </ul>
    </div>
  );
}

function ReorderButtons({ index, length, onMove }: { index: number; length: number; onMove: (dir: -1 | 1) => void }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Button variant="ghost" size="icon-xs" disabled={index === 0} onClick={() => onMove(-1)} aria-label="Move up">
        <ArrowUp className="size-3" />
      </Button>
      <Button variant="ghost" size="icon-xs" disabled={index === length - 1} onClick={() => onMove(1)} aria-label="Move down">
        <ArrowDown className="size-3" />
      </Button>
    </div>
  );
}

export function ServiceEditor({ slug }: { slug: string }) {
  const session = useAdminSession();
  const router = useRouter();
  const service = getService(slug);

  const [content, setContent] = useState<AdminServiceContent | null>(() => getAdminServiceContent(slug) ?? null);
  const [savedSnapshot, setSavedSnapshot] = useState<AdminServiceContent | null>(() => getAdminServiceContent(slug) ?? null);

  const dirty = content !== null && savedSnapshot !== null && JSON.stringify(content) !== JSON.stringify(savedSnapshot);

  // Unsaved-changes warning: covers tab close/refresh (beforeunload) and the
  // browser back button (popstate). In-app navigation away from this page
  // (sidebar links, "Back to services") goes through confirmNavigate below.
  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!dirty) return;
      event.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    window.history.pushState(null, "", window.location.href);
    function handlePopState() {
      if (!dirty || window.confirm("You have unsaved changes. Leave this page without saving?")) {
        return;
      }
      window.history.pushState(null, "", window.location.href);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [dirty]);

  function confirmNavigate(href: string) {
    if (dirty && !window.confirm("You have unsaved changes. Leave this page without saving?")) {
      return;
    }
    router.push(href);
  }

  if (!session) return null;
  if (!canManageCatalog(session)) {
    return <NoAccessPage message="Services and prices are managed by admins only." />;
  }
  if (!service || !content) {
    return <p className="text-sm text-muted-foreground">This service couldn&apos;t be found.</p>;
  }

  function update<K extends keyof AdminServiceContent>(key: K, value: AdminServiceContent[K]) {
    setContent((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function handleSave() {
    if (!content || !service) return;
    const actor = { id: session!.userId, name: session!.name, role: session!.role };
    const next = saveServiceContent(slug, content, actor, service.name);
    setContent(next);
    setSavedSnapshot(next);
    toast.success("Saved. An activity log entry was recorded.");
  }

  const readyCheck = canMarkContentReady(content);
  const liveCheck = canGoLive(content);

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => confirmNavigate("/admin/services")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-3.5" /> Back to services
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold text-navy">{service.name}</h2>
          <p className="text-sm text-muted-foreground">/{service.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          {dirty && <Badge variant="outline">Unsaved changes</Badge>}
          <a
            href={`/${service.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            Preview public page <ExternalLink className="size-3.5" />
          </a>
          <Button onClick={handleSave} disabled={!dirty}>
            Save
          </Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Preview opens the real public page in a new tab — it won&apos;t show your edits yet, since this mock editor
        isn&apos;t wired up to the public site in this phase.
      </p>

      <Tabs defaultValue="basics">
        <TabsList className="flex-wrap">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="packages">Packages and prices</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="legal">Legal review</TabsTrigger>
        </TabsList>

        {/* --- Basics ----------------------------------------------------- */}
        <TabsContent value="basics">
          <Card className="ring-border">
            <CardContent className="space-y-4 pt-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Name</Label>
                  <Input value={service.name} readOnly disabled />
                </div>
                <div className="space-y-1.5">
                  <Label>Slug</Label>
                  <Input value={service.slug} readOnly disabled />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Mode</Label>
                  <Select
                    value={content.mode}
                    onValueChange={(value) => {
                      if (!value) return;
                      if (value === "live" && !canGoLive(content).ok) {
                        toast.error(`Can't set this service to Live: ${canGoLive(content).reasons.join(" ")}`);
                        return;
                      }
                      update("mode", value as AdminServiceContent["mode"]);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="enquiry">Enquiry</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Content status</Label>
                  <Select
                    value={content.contentStatus}
                    onValueChange={(value) => {
                      if (!value) return;
                      if (value === "ready" && !canMarkContentReady(content).ok) {
                        toast.error(`Can't mark as Ready: ${canMarkContentReady(content).reasons.join(" ")}`);
                        return;
                      }
                      update("contentStatus", value as AdminServiceContent["contentStatus"]);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <RuleBanner title="Needed before this can be marked Ready" result={readyCheck} />
              <RuleBanner title="Needed before this can go Live" result={liveCheck} />

              <div className="space-y-1.5">
                <Label htmlFor="intro">Intro line</Label>
                <Textarea id="intro" rows={3} value={content.intro} onChange={(e) => update("intro", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="priceChip">Price chip text</Label>
                <Input id="priceChip" value={content.priceChipText} onChange={(e) => update("priceChipText", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Packages and prices ----------------------------------------- */}
        <TabsContent value="packages">
          <div className="space-y-3">
            {content.packages.map((pkg, index) => (
              <PackageEditorRow
                key={pkg.id}
                pkg={pkg}
                index={index}
                length={content.packages.length}
                onChange={(patch) => update("packages", content.packages.map((p) => (p.id === pkg.id ? { ...p, ...patch } : p)))}
                onMove={(dir) => update("packages", moveItem(content.packages, index, dir))}
                onRemove={() => update("packages", content.packages.filter((p) => p.id !== pkg.id))}
              />
            ))}
            <Button
              variant="outline"
              onClick={() =>
                update("packages", [
                  ...content.packages,
                  {
                    id: newId("pkg"),
                    name: "New package",
                    pricePaise: 0,
                    govtFeeNote: "Govt. fees not included — billed separately. [TBD]",
                    popular: false,
                    features: [],
                    buttonLabel: "Continue",
                  },
                ])
              }
            >
              <Plus className="size-4" /> Add package
            </Button>
          </div>
        </TabsContent>

        {/* --- Content ------------------------------------------------------ */}
        <TabsContent value="content">
          <Card className="ring-border">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <Label htmlFor="whatIsIt">What is it</Label>
                <Textarea id="whatIsIt" rows={5} value={content.whatIsIt} onChange={(e) => update("whatIsIt", e.target.value)} />
              </div>

              <StringListEditor
                label="Who needs it"
                items={content.whoNeedsIt}
                onChange={(items) => update("whoNeedsIt", items)}
                placeholder="Add a reason someone would need this service..."
              />

              <StringListEditor
                label="Benefits"
                items={content.benefits}
                onChange={(items) => update("benefits", items)}
                placeholder="Add a benefit..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Documents ------------------------------------------------- */}
        <TabsContent value="documents">
          <Card className="ring-border">
            <CardContent className="space-y-3 pt-6">
              {content.documents.length === 0 && <p className="text-sm text-muted-foreground">No documents yet.</p>}
              {content.documents.map((doc, index) => (
                <DocumentEditorRow
                  key={doc.id}
                  doc={doc}
                  index={index}
                  length={content.documents.length}
                  onChange={(patch) => update("documents", content.documents.map((d) => (d.id === doc.id ? { ...d, ...patch } : d)))}
                  onMove={(dir) => update("documents", moveItem(content.documents, index, dir))}
                  onRemove={() => update("documents", content.documents.filter((d) => d.id !== doc.id))}
                />
              ))}
              <Button
                variant="outline"
                onClick={() =>
                  update("documents", [...content.documents, { id: newId("doc"), label: "New document", required: true }])
                }
              >
                <Plus className="size-4" /> Add document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- FAQs -------------------------------------------------------- */}
        <TabsContent value="faqs">
          <div className="space-y-3">
            {content.faqs.length === 0 && <p className="text-sm text-muted-foreground">No FAQs yet — needs at least 3 to go Ready.</p>}
            {content.faqs.map((faq, index) => (
              <FaqEditorRow
                key={faq.id}
                faq={faq}
                index={index}
                length={content.faqs.length}
                onChange={(patch) => update("faqs", content.faqs.map((f) => (f.id === faq.id ? { ...f, ...patch } : f)))}
                onMove={(dir) => update("faqs", moveItem(content.faqs, index, dir))}
                onRemove={() => update("faqs", content.faqs.filter((f) => f.id !== faq.id))}
              />
            ))}
            <Button
              variant="outline"
              onClick={() => update("faqs", [...content.faqs, { id: newId("faq"), question: "", answer: "" }])}
            >
              <Plus className="size-4" /> Add FAQ
            </Button>
          </div>
        </TabsContent>

        {/* --- SEO --------------------------------------------------------- */}
        <TabsContent value="seo">
          <Card className="ring-border">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seoTitle">Page title</Label>
                  <span className={`text-xs ${content.seoTitle.length > 60 ? "text-destructive" : "text-muted-foreground"}`}>
                    {content.seoTitle.length} / 60 recommended
                  </span>
                </div>
                <Input id="seoTitle" value={content.seoTitle} onChange={(e) => update("seoTitle", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seoDescription">Meta description</Label>
                  <span className={`text-xs ${content.seoDescription.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                    {content.seoDescription.length} / 160 recommended
                  </span>
                </div>
                <Textarea id="seoDescription" rows={3} value={content.seoDescription} onChange={(e) => update("seoDescription", e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Legal review -------------------------------------------------- */}
        <TabsContent value="legal">
          <Card className="ring-border">
            <CardContent className="space-y-4 pt-6">
              <RuleBanner title="Needed before this can be marked Ready" result={readyCheck} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="reviewedBy">Reviewed by</Label>
                  <Input
                    id="reviewedBy"
                    value={content.legalReviewedBy}
                    onChange={(e) => update("legalReviewedBy", e.target.value)}
                    placeholder="Name, CS / CA / Legal — [VERIFY] with client"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reviewDate">Review date</Label>
                  <Input
                    id="reviewDate"
                    type="date"
                    value={content.legalReviewDate}
                    onChange={(e) => update("legalReviewDate", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PackageEditorRow({
  pkg,
  index,
  length,
  onChange,
  onMove,
  onRemove,
}: {
  pkg: AdminServicePackage;
  index: number;
  length: number;
  onChange: (patch: Partial<AdminServicePackage>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="ring-border">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm text-navy">{pkg.name || "Untitled package"}</CardTitle>
        <div className="flex items-center gap-2">
          <ReorderButtons index={index} length={length} onMove={onMove} />
          <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remove package">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={pkg.name} onChange={(e) => onChange({ name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Price (₹, whole rupees)</Label>
            <Input
              inputMode="numeric"
              value={pkg.pricePaise > 0 ? String(Math.round(pkg.pricePaise / 100)) : ""}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  onChange({ pricePaise: 0 });
                  return;
                }
                if (/^\d+$/.test(raw)) onChange({ pricePaise: Number(raw) * 100 });
              }}
            />
            {pkg.pricePaise <= 0 && <p className="text-xs text-muted-foreground">Not priced yet — must be a positive whole number of rupees.</p>}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Government fee note</Label>
          <Input value={pkg.govtFeeNote} onChange={(e) => onChange({ govtFeeNote: e.target.value })} />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox checked={pkg.popular} onCheckedChange={(checked) => onChange({ popular: checked === true })} id={`${pkg.id}-popular`} />
          <Label htmlFor={`${pkg.id}-popular`} className="font-normal">
            Mark as popular
          </Label>
        </div>

        <div className="space-y-1.5">
          <Label>Button label</Label>
          <Input value={pkg.buttonLabel} onChange={(e) => onChange({ buttonLabel: e.target.value })} />
        </div>

        <StringListEditor
          label="Features"
          items={pkg.features}
          onChange={(features) => onChange({ features })}
          placeholder="Add a feature..."
        />
      </CardContent>
    </Card>
  );
}

function DocumentEditorRow({
  doc,
  index,
  length,
  onChange,
  onMove,
  onRemove,
}: {
  doc: AdminServiceDocument;
  index: number;
  length: number;
  onChange: (patch: Partial<AdminServiceDocument>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg ring-1 ring-border p-2.5">
      <ReorderButtons index={index} length={length} onMove={onMove} />
      <Input value={doc.label} onChange={(e) => onChange({ label: e.target.value })} className="flex-1" />
      <div className="flex items-center gap-1.5">
        <Checkbox checked={doc.required} onCheckedChange={(checked) => onChange({ required: checked === true })} id={`${doc.id}-required`} />
        <Label htmlFor={`${doc.id}-required`} className="font-normal text-sm whitespace-nowrap">
          Required
        </Label>
      </div>
      <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remove document">
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

function FaqEditorRow({
  faq,
  index,
  length,
  onChange,
  onMove,
  onRemove,
}: {
  faq: AdminServiceFaq;
  index: number;
  length: number;
  onChange: (patch: Partial<AdminServiceFaq>) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <Card className="ring-border">
      <CardContent className="flex gap-2 pt-6">
        <ReorderButtons index={index} length={length} onMove={onMove} />
        <div className="flex-1 space-y-2">
          <Input placeholder="Question" value={faq.question} onChange={(e) => onChange({ question: e.target.value })} />
          <Textarea placeholder="Answer" rows={2} value={faq.answer} onChange={(e) => onChange({ answer: e.target.value })} />
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remove FAQ">
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </CardContent>
    </Card>
  );
}

function StringListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <ReorderButtons
              index={index}
              length={items.length}
              onMove={(dir) => onChange(moveItem(items, index, dir))}
            />
            <Input
              value={item}
              placeholder={placeholder}
              onChange={(e) => onChange(items.map((value, i) => (i === index ? e.target.value : value)))}
              className="flex-1"
            />
            <Button variant="ghost" size="icon-sm" onClick={() => onChange(items.filter((_, i) => i !== index))} aria-label="Remove">
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={() => onChange([...items, ""])}>
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
    </div>
  );
}
