"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Image as ImageIcon, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DocumentStatusBadge } from "@/components/dashboard/StatusBadge";
import type { DocumentRequirement, UploadedDocument } from "@/types";

const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);
const ALLOWED_EXTENSION = /\.(pdf|jpe?g|png)$/i;
// [VERIFY] 10 MB limit — confirm with the team before launch.
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const PROGRESS_STEP_MS = 120;

function sanitizeFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? name;
  const cleaned = base.replace(/[^\w.\- ]/g, "_").trim();
  return cleaned.length > 0 ? cleaned.slice(0, 120) : "document";
}

function isAllowedFile(file: File) {
  if (ALLOWED_MIME_TYPES.has(file.type)) return true;
  return ALLOWED_EXTENSION.test(file.name);
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateDocId() {
  return `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function DocumentUploader({
  requirements,
  documents,
  onChange,
  onSubmitForReview,
  submitted = false,
}: {
  requirements: DocumentRequirement[];
  documents: UploadedDocument[];
  onChange: (documents: UploadedDocument[]) => void;
  onSubmitForReview: () => void;
  submitted?: boolean;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [liveMessage, setLiveMessage] = useState("");
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const timerRefs = useRef<Record<string, ReturnType<typeof setInterval>>>({});
  const previewsRef = useRef(previews);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    const timers = timerRefs.current;
    return () => {
      Object.values(timers).forEach(clearInterval);
      Object.values(previewsRef.current).forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  function documentFor(requirementId: string) {
    return documents.find((doc) => doc.requirementId === requirementId);
  }

  function clearPreview(requirementId: string) {
    setPreviews((current) => {
      const url = current[requirementId];
      if (!url) return current;
      URL.revokeObjectURL(url);
      const next = { ...current };
      delete next[requirementId];
      return next;
    });
  }

  function handleFiles(requirement: DocumentRequirement, fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;

    if (!isAllowedFile(file)) {
      const message = "Only PDF, JPG or PNG files are allowed.";
      setErrors((current) => ({ ...current, [requirement.id]: message }));
      setLiveMessage(`${requirement.label}: ${message}`);
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      const message = "This file is larger than 10 MB.";
      setErrors((current) => ({ ...current, [requirement.id]: message }));
      setLiveMessage(`${requirement.label}: ${message}`);
      return;
    }

    setErrors((current) => {
      const next = { ...current };
      delete next[requirement.id];
      return next;
    });

    if (file.type.startsWith("image/")) {
      clearPreview(requirement.id);
      const url = URL.createObjectURL(file);
      setPreviews((current) => ({ ...current, [requirement.id]: url }));
    }

    // Simulated upload progress — no file is ever sent anywhere.
    setProgress((current) => ({ ...current, [requirement.id]: 0 }));
    const timer = setInterval(() => {
      setProgress((current) => {
        const value = (current[requirement.id] ?? 0) + 20;
        if (value >= 100) {
          clearInterval(timerRefs.current[requirement.id]);
          delete timerRefs.current[requirement.id];

          const fileName = sanitizeFileName(file.name);
          const newDoc: UploadedDocument = {
            id: generateDocId(),
            requirementId: requirement.id,
            fileName,
            sizeBytes: file.size,
            mimeType: file.type || "application/octet-stream",
            status: "uploaded",
            uploadedAt: new Date().toISOString(),
          };
          onChange([...documents.filter((doc) => doc.requirementId !== requirement.id), newDoc]);
          setLiveMessage(`${fileName} uploaded successfully for ${requirement.label}.`);

          const rest = { ...current };
          delete rest[requirement.id];
          return rest;
        }
        return { ...current, [requirement.id]: value };
      });
    }, PROGRESS_STEP_MS);
    timerRefs.current[requirement.id] = timer;
  }

  function handleRemove(requirement: DocumentRequirement) {
    const doc = documentFor(requirement.id);
    onChange(documents.filter((item) => item.requirementId !== requirement.id));
    clearPreview(requirement.id);
    setLiveMessage(`${doc?.fileName ?? "File"} removed from ${requirement.label}.`);
  }

  const allReady = requirements.every((requirement) => {
    const doc = documentFor(requirement.id);
    return doc && (doc.status === "uploaded" || doc.status === "accepted");
  });

  return (
    <div className="space-y-4">
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      <ul className="space-y-4">
        {requirements.map((requirement) => {
          const doc = documentFor(requirement.id);
          const status = doc?.status ?? "not_uploaded";
          const error = errors[requirement.id];
          const uploadProgress = progress[requirement.id];
          const preview = previews[requirement.id];
          const isDragOver = dragOverId === requirement.id;
          const canUpload = status === "not_uploaded" || status === "rejected";

          return (
            <li key={requirement.id} className="rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-navy">{requirement.label}</p>
                  <p className="text-sm text-muted-foreground">{requirement.hint}</p>
                </div>
                <DocumentStatusBadge status={status} />
              </div>

              {status === "rejected" && doc?.rejectReason && (
                <p className="mt-2 text-sm text-destructive">{doc.rejectReason}</p>
              )}

              {uploadProgress !== undefined ? (
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Uploading… {uploadProgress}%</p>
                </div>
              ) : doc ? (
                <div className="mt-3 flex items-center gap-3">
                  {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="size-12 rounded-md object-cover ring-1 ring-border" />
                  ) : doc.mimeType.startsWith("image/") ? (
                    <ImageIcon className="size-8 text-muted-foreground" aria-hidden="true" />
                  ) : (
                    <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">{formatSize(doc.sizeBytes)}</p>
                  </div>
                  {status === "uploaded" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(requirement)}
                      aria-label={`Remove ${doc.fileName}`}
                    >
                      <X aria-hidden="true" />
                      Remove
                    </Button>
                  )}
                </div>
              ) : null}

              {canUpload && uploadProgress === undefined && (
                <div
                  className={cn(
                    "mt-3 flex flex-col items-center gap-2 rounded-lg border border-dashed border-input p-4 text-center transition-colors",
                    isDragOver && "border-primary bg-blue-tint"
                  )}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragOverId(requirement.id);
                  }}
                  onDragLeave={() => setDragOverId((current) => (current === requirement.id ? null : current))}
                  onDrop={(event) => {
                    event.preventDefault();
                    setDragOverId(null);
                    handleFiles(requirement, event.dataTransfer.files);
                  }}
                >
                  <UploadCloud className="size-5 text-muted-foreground" aria-hidden="true" />
                  <p className="text-xs text-muted-foreground">Drag and drop a file here, or</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    data-track="document_upload"
                    onClick={() => inputRefs.current[requirement.id]?.click()}
                  >
                    {status === "rejected" ? "Replace file" : "Choose file"}
                  </Button>
                  <p className="text-xs text-muted-foreground">PDF, JPG or PNG, up to 10 MB</p>
                  <input
                    ref={(node) => {
                      inputRefs.current[requirement.id] = node;
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    className="sr-only"
                    tabIndex={-1}
                    aria-hidden="true"
                    onChange={(event) => {
                      handleFiles(requirement, event.target.files);
                      event.target.value = "";
                    }}
                  />
                </div>
              )}

              {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
            </li>
          );
        })}
      </ul>

      {!submitted && allReady && (
        <Button type="button" className="w-full" data-track="submit_for_review" onClick={onSubmitForReview}>
          Submit for review
        </Button>
      )}
    </div>
  );
}
