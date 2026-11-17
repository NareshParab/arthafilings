export interface Package {
  id: string;
  name: string;
  price: string;
  govtFeeNote: string;
  features: string[];
  popular?: boolean;
  ctaLabel: string;
}

export interface Lead {
  name: string;
  email: string;
  phone: string;
}
