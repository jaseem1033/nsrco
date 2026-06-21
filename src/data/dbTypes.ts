export interface Category {
  id: string;
  name: string;
  image?: string;
  description?: string;
  show_on_homepage?: boolean;
  priority?: number;
}

export interface FeaturedProduct {
  id: number;
  created_at?: string;
  title: string;
  description: string;
  image: string;
  features: string[];
  product_id: string;
  priority: number;
}

export interface HomepageSetting {
  key: string;
  value: string;
}

