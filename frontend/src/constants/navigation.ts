import { LayoutGrid, PenLine, Quote } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Public routes render outside the dashboard shell. */
  external?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Write Review', href: '/write-review', icon: PenLine },
  { label: 'Review Management', href: '/reviews', icon: LayoutGrid },
  { label: 'Public Testimonials', href: '/testimonials', icon: Quote, external: true },
];

export const PRODUCT_NAME = 'Testify';
export const PRODUCT_TAGLINE = 'Testimonial Platform';
