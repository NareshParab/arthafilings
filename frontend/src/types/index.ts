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

export interface Review {
  name: string;
  city: string;
  rating: number;
  text: string;
  date: string;
}
