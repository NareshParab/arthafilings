import { z } from "zod";
import type { ExtraField } from "@/data/service-catalog";

export type ExtraFieldType = "select" | "text" | "textarea";

export interface ExtraFieldConfig {
  name: ExtraField;
  label: string;
  type: ExtraFieldType;
  required: boolean;
  placeholder?: string;
}

// Maps each catalog ExtraField to how it renders in ServiceLeadForm.
export const extraFieldConfigs: Record<ExtraField, ExtraFieldConfig> = {
  state: {
    name: "state",
    label: "State",
    type: "select",
    required: true,
    placeholder: "Select your state",
  },
  stateUt: {
    name: "stateUt",
    label: "State / UT",
    type: "select",
    required: true,
    placeholder: "Select your state or UT",
  },
  gstin: {
    name: "gstin",
    label: "GSTIN",
    type: "text",
    required: true,
    placeholder: "22AAAAA0000A1Z5",
  },
  pan: {
    name: "pan",
    label: "PAN",
    type: "text",
    required: true,
    placeholder: "AAAAA9999A",
  },
  brandName: {
    name: "brandName",
    label: "Brand name",
    type: "text",
    required: true,
    placeholder: "Your brand name",
  },
  country: {
    name: "country",
    label: "Country",
    type: "select",
    required: true,
    placeholder: "Select a country",
  },
  productCatalogOptional: {
    name: "productCatalogOptional",
    label: "Product catalog (optional)",
    type: "text",
    required: false,
    placeholder: "Link to your product catalog, if you have one",
  },
  askBox: {
    name: "askBox",
    label: "Ask about this service",
    type: "textarea",
    required: false,
    placeholder: "Tell us a bit more about what you need",
  },
};

// 2 state digits + 10-char PAN + 1 entity code + fixed "Z" + 1 checksum = 15 chars.
export const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const PAN_REGEX = /^[A-Z]{5}\d{4}[A-Z]$/;

function zodForField(field: ExtraField): z.ZodTypeAny {
  const config = extraFieldConfigs[field];

  switch (field) {
    case "gstin":
      return z
        .string()
        .trim()
        .min(1, "GSTIN is required")
        .transform((value) => value.toUpperCase())
        .refine((value) => GSTIN_REGEX.test(value), "Enter a valid 15-character GSTIN");
    case "pan":
      return z
        .string()
        .trim()
        .min(1, "PAN is required")
        .transform((value) => value.toUpperCase())
        .refine((value) => PAN_REGEX.test(value), "Enter a valid PAN (format AAAAA9999A)");
    case "state":
    case "stateUt":
    case "country":
      return z.string().trim().min(1, `Please select ${config.label.toLowerCase()}`);
    case "brandName":
      return z.string().trim().min(1, "Brand name is required");
    case "productCatalogOptional":
    case "askBox":
      return z.string().trim().optional();
  }
}

// Builds the zod shape for a service's extra fields, to be merged into the base lead schema.
export function extraFieldsZodShape(fields: ExtraField[]): Record<string, z.ZodTypeAny> {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const field of fields) {
    shape[field] = zodForField(field);
  }
  return shape;
}

export function defaultValuesForExtraFields(fields: ExtraField[]): Record<string, string> {
  const defaults: Record<string, string> = {};
  for (const field of fields) {
    defaults[field] = "";
  }
  return defaults;
}
