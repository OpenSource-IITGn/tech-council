import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";

// Check if user is admin
async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

// Ensure upload directory exists
async function ensureUploadDir(subDir: string = 'events/uploads') {
  const uploadDir = path.join(process.cwd(), 'public', subDir);
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Generate unique filename
function generateFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalName);
  return `${timestamp}-${randomString}${extension}`;
}

// POST /api/admin/upload - Upload image
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir();

    // Generate unique filename
    const fileName = generateFileName(file.name);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Optimize image using Sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toBuffer();

    // Save optimized image
    const optimizedFileName = fileName.replace(path.extname(fileName), '.jpg');
    const optimizedFilePath = path.join(uploadDir, optimizedFileName);
    await fs.writeFile(optimizedFilePath, optimizedBuffer);

    // Return the public URL
    const publicUrl = `/events/uploads/${optimizedFileName}`;

    return NextResponse.json({
      url: publicUrl,
      filename: optimizedFileName,
      size: optimizedBuffer.length
    });

  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/upload - Delete image
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return NextResponse.json({ error: "No filename provided" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'events', 'uploads', filename);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ message: "File deleted successfully" });
    } catch {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
