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
async function ensureTeamPhotoDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'team');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Generate filename for team photo
function generatePhotoFileName(originalName: string, memberId: string): string {
  const ext = path.extname(originalName).toLowerCase();
  const timestamp = Date.now();
  return `${memberId}-${timestamp}${ext}`;
}

// POST /api/admin/team/upload-photo - Upload team member photo
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const memberId = formData.get("memberId") as string;
    const isSecretary = formData.get("isSecretary") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!memberId) {
      return NextResponse.json({ error: "Member ID is required" }, { status: 400 });
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
    const uploadDir = await ensureTeamPhotoDir();

    // Generate filename
    const fileName = generatePhotoFileName(file.name, memberId);

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Determine target size based on role
    const targetSize = isSecretary ? 300 : 200;

    // Process image using Sharp - create square image with proper sizing
    const processedBuffer = await sharp(buffer)
      .resize(targetSize, targetSize, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 90,
        progressive: true
      })
      .toBuffer();

    // Remove existing photos for this member (in case of different extensions)
    const existingFiles = await fs.readdir(uploadDir);
    const memberFiles = existingFiles.filter(f => f.startsWith(`${memberId}-`));
    for (const existingFile of memberFiles) {
      try {
        await fs.unlink(path.join(uploadDir, existingFile));
      } catch {
        // File might not exist, ignore error
      }
    }

    // Save the processed image
    const finalFileName = fileName.replace(path.extname(fileName), '.jpg');
    const finalFilePath = path.join(uploadDir, finalFileName);
    await fs.writeFile(finalFilePath, processedBuffer);

    // Return the public URL
    const publicUrl = `/team/${finalFileName}`;

    return NextResponse.json({
      url: publicUrl,
      filename: finalFileName,
      size: processedBuffer.length,
      memberId,
      dimensions: `${targetSize}x${targetSize}`
    });

  } catch (error) {
    console.error("Error uploading team photo:", error);
    return NextResponse.json(
      { error: "Failed to upload photo" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/team/upload-photo - Delete team member photo
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

    const filePath = path.join(process.cwd(), 'public', 'team', filename);

    try {
      await fs.unlink(filePath);
      return NextResponse.json({ message: "Photo deleted successfully" });
    } catch {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("Error deleting team photo:", error);
    return NextResponse.json(
      { error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}
