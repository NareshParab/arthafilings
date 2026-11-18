// MOCK: placeholder prices in paise, until real pricing is confirmed. [TBD]
// Keyed by service slug, then package id (matching the Package.id values in
// data/service-content.ts). Only 'live' services need an entry here.
export interface MockPackagePrice {
  packageId: string;
  name: string;
  amountPaise: number;
}

export const mockPackagePrices: Record<string, MockPackagePrice[]> = {
  "proprietorship-registration": [
    { packageId: "basic", name: "Basic", amountPaise: 99900 }, // MOCK price [TBD]
    { packageId: "standard", name: "Standard", amountPaise: 199900 }, // MOCK price [TBD]
    { packageId: "premium", name: "Premium", amountPaise: 349900 }, // MOCK price [TBD]
  ],
};

export function getMockPackagePrice(serviceSlug: string, packageId?: string | null) {
  const packages = mockPackagePrices[serviceSlug];
  if (!packages || packages.length === 0) return null;
  return packages.find((item) => item.packageId === packageId) ?? packages[0];
}
