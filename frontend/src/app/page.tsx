import { redirect } from 'next/navigation';

/** The collection form is the entry point of the product's core loop. */
export default function HomePage() {
  redirect('/write-review');
}
