import { Context } from 'hono'

export function parseCloudinaryUrl(url: string) {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const parts = url.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    
    const resourceType = parts[uploadIndex - 1]; // "image", "raw", "video"
    let versionIndex = uploadIndex + 1;
    if (parts[versionIndex].startsWith("v") && /^\d+$/.test(parts[versionIndex].substring(1))) {
      versionIndex++;
    }
    
    const publicIdWithExt = parts.slice(versionIndex).join("/");
    let publicId = publicIdWithExt;
    if (resourceType === "image") {
      const lastDot = publicIdWithExt.lastIndexOf(".");
      if (lastDot !== -1) {
        publicId = publicIdWithExt.substring(0, lastDot);
      }
    }
    
    return {
      publicId: decodeURIComponent(publicId),
      resourceType
    };
  } catch (error) {
    console.error("Failed to parse Cloudinary URL in worker:", url, error);
    return null;
  }
}

export async function deleteFromCloudinary(url: string, env: any) {
  const parsed = parseCloudinaryUrl(url);
  if (!parsed) return false;
  
  const { publicId, resourceType } = parsed;
  const cloudName = env.CLOUDINARY_CLOUD_NAME;
  const apiKey = env.CLOUDINARY_API_KEY;
  const apiSecret = env.CLOUDINARY_API_SECRET;
  
  if (!cloudName || !apiKey || !apiSecret) {
    console.warn("Cloudinary configuration missing in worker environment");
    return false;
  }
  
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(paramsToSign);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);
  const signature = Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
    
  const body = new FormData();
  body.append("public_id", publicId);
  body.append("api_key", apiKey);
  body.append("timestamp", timestamp.toString());
  body.append("signature", signature);
  
  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: "POST", body }
    );
    const json = await res.json() as any;
    console.log(`Cloudinary destroy response for ${publicId}:`, json);
    return json.result === "ok";
  } catch (error) {
    console.error("Failed to destroy asset directly from worker:", error);
    return false;
  }
}

export async function triggerCloudinaryDelete(c: Context, url: string) {
  if (!url) return;
  
  // 1. Try local worker deletion if env vars are present
  if (c.env.CLOUDINARY_CLOUD_NAME && c.env.CLOUDINARY_API_KEY && c.env.CLOUDINARY_API_SECRET) {
    const success = await deleteFromCloudinary(url, c.env);
    if (success) {
      console.log(`Directly deleted Cloudinary asset: ${url}`);
      return;
    }
  }
  
  // 2. Fallback: Delegate to Next.js DELETE route
  try {
    const origin = c.req.header("origin") || c.req.header("referer") || "https://sim-ppds.pages.dev";
    const baseUrl = origin.endsWith("/") ? origin.slice(0, -1) : origin;
    const deleteUrl = `${baseUrl}/api/upload?url=${encodeURIComponent(url)}`;
    
    console.log(`Delegating deletion of ${url} to Next.js: ${deleteUrl}`);
    const res = await fetch(deleteUrl, { method: "DELETE" });
    const json = await res.json() as any;
    console.log("Delegated deletion response:", json);
  } catch (error) {
    console.error("Failed to delegate Cloudinary delete:", error);
  }
}
