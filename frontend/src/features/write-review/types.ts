import type { ProcessedImage } from '@/lib/image';

export interface ReviewFormValues {
  name: string;
  email: string;
  company: string;
  rating: number;
  message: string;
  images: ProcessedImage[];
}

export const EMPTY_REVIEW_FORM: ReviewFormValues = {
  name: '',
  email: '',
  company: '',
  rating: 0,
  message: '',
  images: [],
};
