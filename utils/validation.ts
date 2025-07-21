import { z } from "zod";

export const InstagramUrlSchema = z
  .string()
  .url()
  .refine(
    (url) => url.includes("instagram.com/reel/"),
    "Must be a valid Instagram Reel URL"
  );

export const UsernameSchema = z
  .string()
  .min(1, "Username is required")
  .max(30, "Username too long")
  .regex(/^[a-zA-Z0-9._]+$/, "Invalid username format");

export function validateInstagramUrl(url: string): boolean {
  try {
    InstagramUrlSchema.parse(url);
    return true;
  } catch {
    return false;
  }
}

export function extractUsernameFromUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/([^\/\?]+)/);
  return match ? match[1] : null;
}
