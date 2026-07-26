import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

/** Server-side helpers that keep every route handler on the same envelope. */

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true as const, data }, { status });
}

export function fail(
  message: string,
  status = 400,
  fields?: Record<string, string>,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false as const, error: { message, fields } }, { status });
}
