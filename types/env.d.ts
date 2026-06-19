// Cloudflare D1 & Cloudinary environment bindings
interface CloudflareEnv {
  DB: D1Database;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

declare global {
  // Make env available via process.env-like
  namespace NodeJS {
    interface ProcessEnv {
      CLOUDINARY_CLOUD_NAME?: string;
      CLOUDINARY_API_KEY?: string;
      CLOUDINARY_API_SECRET?: string;
    }
  }
}

export type { CloudflareEnv };
