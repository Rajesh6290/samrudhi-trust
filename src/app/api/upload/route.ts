import { verifyToken } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";
import { parse } from "cookie";
import { NextRequest, NextResponse } from "next/server";

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dxm4zavaw",
  api_key: "899277567897154",
  api_secret: "MamrpcS2Ad8dryANiAcmH19LC7g",
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const cookies = parse(request.headers.get("cookie") || "");
    const token = cookies.token;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Get the form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Validate file type (images and videos)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only JPEG, PNG, WebP images and MP4, WebM, MOV videos are allowed",
        },
        { status: 400 }
      );
    }

    // Determine resource type
    const resourceType = file.type.startsWith("video/") ? "video" : "image";

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        const uploadOptions = {
          folder: "samrudhi-trust",
          resource_type: resourceType as "image" | "video",
          transformation:
            resourceType === "image"
              ? [
                  { width: 1200, height: 1200, crop: "limit" },
                  { quality: "auto" },
                  { fetch_format: "auto" },
                ]
              : undefined,
        };

        cloudinary.uploader
          .upload_stream(
            uploadOptions,
            (
              error: Error | undefined,
              result: { secure_url: string; public_id: string } | undefined
            ) => {
              if (error) reject(error);
              else if (result) resolve(result);
              else reject(new Error("Upload failed"));
            }
          )
          .end(buffer);
      }
    );

    return NextResponse.json(
      {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
