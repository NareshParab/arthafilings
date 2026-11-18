// Arthafilings service catalog (SEED). 9 groups, 116 services.
// Generated from the owner's two requirement documents (18 Nov 2026). Names and form patterns only.
// All page text (intro, features, documents, FAQs, packages) is OUR OWN and is added per service later. Nothing copied from any other site.
// [VERIFY] MCA, Compliance, Consultation and Global forms were not captured in the source. Base fields are assumed.
// [VERIFY] Re-check the exact form fields on each service before launch.

export type ServiceMode = 'live' | 'enquiry' | 'hidden'
export type ExtraField = 'state' | 'stateUt' | 'gstin' | 'pan' | 'brandName' | 'country' | 'productCatalogOptional' | 'askBox'

export interface ServiceGroup { slug: string; name: string; description: string }
export interface ServiceItem {
  slug: string        // our own clean URL, e.g. /proprietorship-registration
  name: string
  group: string       // ServiceGroup.slug
  order: number       // position inside its group
  extra: ExtraField[] // extra lead-form fields on top of Name, Email, Phone
  cta: 'continue' | 'quote' // source button type: fixed-price flow vs custom-quote flow
  mode: ServiceMode   // live = buy online; enquiry = lead form + callback, price 'Get a quote'
  formVerified: boolean // false = fields assumed, check before launch
  notes?: string
}

export const serviceGroups: ServiceGroup[] = [
  {
    "slug": "startup",
    "name": "Startup",
    "description": "Start a business: proprietorship, partnership, LLP and companies"
  },
  {
    "slug": "registrations",
    "name": "Registrations",
    "description": "Licences, certificates and government registrations"
  },
  {
    "slug": "trademark",
    "name": "Trademark",
    "description": "Trademark, design, copyright and patent services"
  },
  {
    "slug": "gst",
    "name": "GST",
    "description": "GST registration, returns and notices"
  },
  {
    "slug": "income-tax",
    "name": "Income Tax",
    "description": "Income tax returns, TAN, TDS and notices"
  },
  {
    "slug": "mca",
    "name": "MCA",
    "description": "ROC filings, company changes and director compliance"
  },
  {
    "slug": "compliance",
    "name": "Compliance",
    "description": "Ongoing compliance, payroll, FSSAI and foreign investment filings"
  },
  {
    "slug": "consultation",
    "name": "Consultation",
    "description": "Talk to a CA or a lawyer"
  },
  {
    "slug": "global",
    "name": "Global",
    "description": "Company and trademark registration abroad"
  }
]

export const services: ServiceItem[] = [
  { cta: "continue", slug: 'proprietorship-registration', name: 'Proprietorship', group: 'startup', order: 1, extra: [], mode: 'live', formVerified: true },
  { cta: "continue", slug: 'partnership', name: 'Partnership', group: 'startup', order: 2, extra: ["state"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'one-person-company', name: 'One Person Company', group: 'startup', order: 3, extra: ["state"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'llp-registration', name: 'Limited Liability Partnership', group: 'startup', order: 4, extra: ["state"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'private-limited-company-registration', name: 'Private Limited Company', group: 'startup', order: 5, extra: ["state"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'section-8-company', name: 'Section 8 Company', group: 'startup', order: 6, extra: ["state"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trust-registration', name: 'Trust Registration', group: 'startup', order: 7, extra: ["state"], mode: 'enquiry', formVerified: true, notes: "Source page had no Required Documents link." },
  { cta: "continue", slug: 'public-limited-company', name: 'Public Limited Company', group: 'startup', order: 8, extra: ["state"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'producer-company', name: 'Producer Company', group: 'startup', order: 9, extra: ["state"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'indian-subsidiary', name: 'Indian Subsidiary', group: 'startup', order: 10, extra: ["state"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'startup-india', name: 'Startup India', group: 'registrations', order: 1, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trade-license', name: 'Trade License', group: 'registrations', order: 2, extra: [], mode: 'enquiry', formVerified: true, notes: "Source page also has a state-wise package selector lower on the page (Tamil Nadu, Telangana, Karnataka seen). Handle in packages, not the lead form." },
  { cta: "continue", slug: 'fssai-registration', name: 'FSSAI Registration', group: 'registrations', order: 3, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'fssai-license', name: 'FSSAI License', group: 'registrations', order: 4, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'halal-license-and-certification', name: 'Halal License & Certification', group: 'registrations', order: 5, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'icegate-registration', name: 'ICEGATE Registration', group: 'registrations', order: 6, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'import-export-code', name: 'Import Export Code', group: 'registrations', order: 7, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'legal-entity-identifier-code', name: 'Legal Entity Identifier Code', group: 'registrations', order: 8, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'iso-registration', name: 'ISO Registration', group: 'registrations', order: 9, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'pf-registration', name: 'PF Registration', group: 'registrations', order: 10, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'esi-registration', name: 'ESI Registration', group: 'registrations', order: 11, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'professional-tax-registration', name: 'Professional Tax Registration', group: 'registrations', order: 12, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'rcmc-registration', name: 'RCMC Registration', group: 'registrations', order: 13, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'tn-rera-registration-for-agents', name: 'TN RERA Registration for Agents', group: 'registrations', order: 14, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: '12a-and-80g-registration', name: '12A and 80G Registration', group: 'registrations', order: 15, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: '12a-registration', name: '12A Registration', group: 'registrations', order: 16, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: '80g-registration', name: '80G Registration', group: 'registrations', order: 17, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'barcode-registration', name: 'Barcode Registration', group: 'registrations', order: 18, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'bis-registration', name: 'BIS Registration', group: 'registrations', order: 19, extra: ["productCatalogOptional"], mode: 'enquiry', formVerified: true, notes: "Optional product catalog box; unclear if file upload." },
  { cta: "continue", slug: 'certificate-of-incumbency', name: 'Certificate of Incumbency', group: 'registrations', order: 20, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'darpan-registration', name: 'Darpan Registration', group: 'registrations', order: 21, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'digital-signature', name: 'Digital Signature', group: 'registrations', order: 22, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'shop-act-registration', name: 'Shop Act Registration', group: 'registrations', order: 23, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'udyam-registration', name: 'Udyam Registration', group: 'registrations', order: 24, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'fire-license', name: 'Fire License', group: 'registrations', order: 25, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'legal-name-change', name: 'Legal Name Change', group: 'registrations', order: 26, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'water-testing', name: 'Water Testing', group: 'registrations', order: 27, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'food-testing', name: 'Food Testing', group: 'registrations', order: 28, extra: ["askBox"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trademark-registration', name: 'Trademark Registration', group: 'trademark', order: 1, extra: ["brandName"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trademark-objection', name: 'Trademark Objection', group: 'trademark', order: 2, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trademark-certificate', name: 'Trademark Certificate', group: 'trademark', order: 3, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trademark-opposition', name: 'Trademark Opposition', group: 'trademark', order: 4, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trademark-hearing', name: 'Trademark Hearing', group: 'trademark', order: 5, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trademark-rectification', name: 'Trademark Rectification', group: 'trademark', order: 6, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'tm-infringement-notice', name: 'TM Infringement Notice', group: 'trademark', order: 7, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trademark-renewal', name: 'Trademark Renewal', group: 'trademark', order: 8, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trademark-transfer', name: 'Trademark Transfer', group: 'trademark', order: 9, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'expedited-tm-registration', name: 'Expedited TM Registration', group: 'trademark', order: 10, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'logo-designing', name: 'Logo Designing', group: 'trademark', order: 11, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'design-registration', name: 'Design Registration', group: 'trademark', order: 12, extra: ["askBox"], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'design-objection', name: 'Design Objection', group: 'trademark', order: 13, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'copyright-registration', name: 'Copyright Registration', group: 'trademark', order: 14, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'copyright-objection', name: 'Copyright Objection', group: 'trademark', order: 15, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'patent-registration', name: 'Patent Registration', group: 'trademark', order: 16, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'trademark-protection', name: 'Trademark Protection', group: 'trademark', order: 17, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'gst-registration', name: 'GST Registration', group: 'gst', order: 1, extra: ["pan"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'gst-return-filing-by-accountant', name: 'GST Return Filing by Accountant', group: 'gst', order: 2, extra: ["gstin"], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'gst-lut-form', name: 'GST LUT Form', group: 'gst', order: 3, extra: ["gstin"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'gst-notice', name: 'GST Notice', group: 'gst', order: 4, extra: [], mode: 'enquiry', formVerified: true, notes: "Source form text mentions Income Tax notices; write our own GST notice form text." },
  { cta: "quote", slug: 'gst-annual-return-filing-gstr-9', name: 'GST Annual Return Filing (GSTR-9)', group: 'gst', order: 5, extra: ["gstin"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'gst-registration-for-foreigners', name: 'GST Registration for Foreigners', group: 'gst', order: 6, extra: ["country"], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'gst-amendment', name: 'GST Amendment', group: 'gst', order: 7, extra: ["gstin"], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'gst-revocation', name: 'GST Revocation', group: 'gst', order: 8, extra: ["gstin"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'gstr-10', name: 'GSTR-10', group: 'gst', order: 9, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'virtual-office-gstin', name: 'Virtual Office + GSTIN', group: 'gst', order: 10, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'income-tax-e-filing', name: 'Income Tax E-Filing', group: 'income-tax', order: 1, extra: ["stateUt", "pan"], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'business-itr-filing', name: 'Business ITR Filing', group: 'income-tax', order: 2, extra: ["stateUt", "pan"], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'partnership-firm-llp-itr', name: 'Partnership Firm / LLP ITR', group: 'income-tax', order: 3, extra: ["stateUt", "pan"], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'company-itr-filing', name: 'Company ITR Filing', group: 'income-tax', order: 4, extra: ["stateUt", "pan"], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'trust-ngo-tax-filing', name: 'Trust / NGO Tax Filing', group: 'income-tax', order: 5, extra: ["stateUt", "pan"], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: '15ca-15cb-filing', name: '15CA - 15CB Filing', group: 'income-tax', order: 6, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "quote", slug: 'tan-registration', name: 'TAN Registration', group: 'income-tax', order: 7, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'tds-return-filing', name: 'TDS Return Filing', group: 'income-tax', order: 8, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'income-tax-notice', name: 'Income Tax Notice', group: 'income-tax', order: 9, extra: [], mode: 'enquiry', formVerified: true },
  { cta: "continue", slug: 'revised-itr-return-itr-u', name: 'Revised ITR Return (ITR-U)', group: 'income-tax', order: 10, extra: ["pan"], mode: 'enquiry', formVerified: true, notes: "Phone required status not confirmed in source." },
  { cta: "continue", slug: 'company-compliance', name: 'Company Compliance', group: 'mca', order: 1, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'llp-compliance', name: 'LLP Compliance', group: 'mca', order: 2, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'opc-compliance', name: 'OPC Compliance', group: 'mca', order: 3, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'name-change-company', name: 'Name Change – Company', group: 'mca', order: 4, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'registered-office-change', name: 'Registered Office Change', group: 'mca', order: 5, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'din-ekyc-filing', name: 'DIN eKYC Filing', group: 'mca', order: 6, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'din-reactivation', name: 'DIN Reactivation', group: 'mca', order: 7, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'director-change', name: 'Director Change', group: 'mca', order: 8, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'remove-director', name: 'Remove Director', group: 'mca', order: 9, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'adt-1-filing', name: 'ADT-1 Filing', group: 'mca', order: 10, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'dpt-3-filing', name: 'DPT-3 Filing', group: 'mca', order: 11, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'llp-form-11-filing', name: 'LLP Form 11 Filing', group: 'mca', order: 12, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'dormant-status-filing', name: 'Dormant Status Filing', group: 'mca', order: 13, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'moa-amendment', name: 'MOA Amendment', group: 'mca', order: 14, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'aoa-amendment', name: 'AOA Amendment', group: 'mca', order: 15, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'authorized-capital-increase', name: 'Authorized Capital Increase', group: 'mca', order: 16, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'share-transfer', name: 'Share Transfer', group: 'mca', order: 17, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'demat-of-shares', name: 'Demat of Shares', group: 'mca', order: 18, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'winding-up-llp', name: 'Winding Up – LLP', group: 'mca', order: 19, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'winding-up-company', name: 'Winding Up – Company', group: 'mca', order: 20, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'commencement-of-business-inc-20a', name: 'Commencement of Business (INC-20A)', group: 'mca', order: 21, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'fdi-filing', name: 'FDI Filing', group: 'compliance', order: 1, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'odi-filing', name: 'ODI Filing', group: 'compliance', order: 2, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'fla-return-filing', name: 'FLA Return Filing', group: 'compliance', order: 3, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'fssai-renewal', name: 'FSSAI Renewal', group: 'compliance', order: 4, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'fssai-return-filing', name: 'FSSAI Return Filing', group: 'compliance', order: 5, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'business-plan', name: 'Business Plan', group: 'compliance', order: 6, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'hr-and-payroll', name: 'HR & Payroll', group: 'compliance', order: 7, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'pf-return-filing', name: 'PF Return Filing', group: 'compliance', order: 8, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'esi-return-filing', name: 'ESI Return Filing', group: 'compliance', order: 9, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'professional-tax-return-filing', name: 'Professional Tax Return Filing', group: 'compliance', order: 10, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'partnership-compliance', name: 'Partnership Compliance', group: 'compliance', order: 11, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'proprietorship-compliance', name: 'Proprietorship Compliance', group: 'compliance', order: 12, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'bookkeeping', name: 'Bookkeeping', group: 'compliance', order: 13, extra: [], mode: 'enquiry', formVerified: false, notes: "Source URL was the home page and had no feature bullets. [VERIFY] Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'ca-consultation', name: 'CA Consultation', group: 'consultation', order: 1, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'legal-consultation', name: 'Legal Consultation', group: 'consultation', order: 2, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'uae-company-registration', name: 'UAE Company Registration', group: 'global', order: 1, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'usa-company-registration', name: 'USA Company Registration', group: 'global', order: 2, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'singapore-business-setup', name: 'Singapore Business Setup', group: 'global', order: 3, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'uk-company-registration', name: 'UK Company Registration', group: 'global', order: 4, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
  { cta: "continue", slug: 'usa-trademark-registration', name: 'USA Trademark Registration', group: 'global', order: 5, extra: [], mode: 'enquiry', formVerified: false, notes: "Form fields not captured in source. Base fields assumed. [VERIFY]" },
]

export const getService = (slug: string) => services.find((s) => s.slug === slug)
export const getGroupServices = (group: string) => services.filter((s) => s.group === group).sort((a, b) => a.order - b.order)
