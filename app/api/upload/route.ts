import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

interface CloudflareEnv {
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

export async function POST(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "sim-ppds";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "File tidak ditemukan" },
        { status: 400 }
      );
    }

    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "Konfigurasi Cloudinary tidak lengkap di Cloudflare" },
        { status: 500 }
      );
    }

    // signature for signed upload
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("api_key", apiKey);
    uploadForm.append("timestamp", timestamp.toString());
    uploadForm.append("signature", signature);
    uploadForm.append("folder", folder);

    // Use 'auto' to allow any file type (images or raw files like PDF/Docs)
    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      { method: "POST", body: uploadForm }
    );

    if (!cloudinaryRes.ok) {
      const err = await cloudinaryRes.json() as { error?: { message?: string } };
      return NextResponse.json(
        { success: false, error: err.error?.message ?? "Upload ke Cloudinary gagal" },
        { status: 500 }
      );
    }

    const result = await cloudinaryRes.json() as any;

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function parseCloudinaryUrl(url: string) {
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
    console.error("Failed to parse Cloudinary URL:", url, error);
    return null;
  }
}

export async function DELETE(request: Request) {
  try {
    const { env } = getRequestContext() as unknown as { env: CloudflareEnv };
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL tidak ditemukan" },
        { status: 400 }
      );
    }

    const cloudName = env.CLOUDINARY_CLOUD_NAME;
    const apiKey = env.CLOUDINARY_API_KEY;
    const apiSecret = env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, error: "Konfigurasi Cloudinary tidak lengkap di Cloudflare" },
        { status: 500 }
      );
    }

    const parsed = parseCloudinaryUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { success: false, error: "URL Cloudinary tidak valid atau tidak didukung" },
        { status: 400 }
      );
    }

    const { publicId, resourceType } = parsed;
    const timestamp = Math.round(Date.now() / 1000);
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;

    const encoder = new TextEncoder();
    const data = encoder.encode(paramsToSign);
    const hashBuffer = await crypto.subtle.digest("SHA-1", data);
    
    const signature = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    const deleteForm = new FormData();
    deleteForm.append("public_id", publicId);
    deleteForm.append("api_key", apiKey);
    deleteForm.append("timestamp", timestamp.toString());
    deleteForm.append("signature", signature);

    const cloudinaryRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`,
      { method: "POST", body: deleteForm }
    );

    if (!cloudinaryRes.ok) {
      const err = await cloudinaryRes.json() as { error?: { message?: string } };
      return NextResponse.json(
        { success: false, error: err.error?.message ?? "Penghapusan Cloudinary gagal" },
        { status: 500 }
      );
    }

    const result = await cloudinaryRes.json() as any;
    if (result.result !== "ok") {
      return NextResponse.json(
        { success: false, error: result.error?.message ?? "Gagal menghapus aset di Cloudinary" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Aset berhasil dihapus dari Cloudinary"
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

