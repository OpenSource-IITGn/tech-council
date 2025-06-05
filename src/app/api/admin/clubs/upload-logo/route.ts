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
async function ensureLogoDir(type: 'clubs' | 'hobby-groups') {
  const uploadDir = path.join(process.cwd(), 'public', 'logos', type);
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
  }
  return uploadDir;
}

// Generate logo filename
function generateLogoFileName(clubId: string, originalName: string): string {
  const ext = path.extname(originalName).toLowerCase();
  // Use club ID as filename for consistency
  return `${clubId}${ext}`;
}

// POST /api/admin/clubs/upload-logo - Upload club/hobby group logo
export async function POST(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const clubId = formData.get("clubId") as string;
    const clubType = formData.get("clubType") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!clubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 });
    }

    if (!clubType || !['club', 'hobby-group'].includes(clubType)) {
      return NextResponse.json({ error: "Valid club type is required" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, WebP, and SVG are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 }
      );
    }

    // Determine upload directory based on club type
    const logoType = clubType === 'club' ? 'clubs' : 'hobby-groups';
    const uploadDir = await ensureLogoDir(logoType);

    // Generate filename
    const fileName = generateLogoFileName(clubId, file.name);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let finalBuffer: Buffer = buffer;
    let finalFileName = fileName;

    // Process image if it's not SVG
    if (file.type !== "image/svg+xml") {
      // Optimize image using Sharp
      finalBuffer = await sharp(buffer)
        .resize(400, 400, {
          fit: 'inside',
          withoutEnlargement: true,
          background: { r: 255, g: 255, b: 255, alpha: 0 } // Transparent background
        })
        .png({
          quality: 90,
          compressionLevel: 6
        })
        .toBuffer();

      // Change extension to .png for processed images
      finalFileName = fileName.replace(path.extname(fileName), '.png');
    }

    // Remove existing logo files for this club (in case of different extensions)
    const existingFiles = await fs.readdir(uploadDir);
    const clubFiles = existingFiles.filter(f => f.startsWith(`${clubId}.`));
    for (const existingFile of clubFiles) {
      try {
        await fs.unlink(path.join(uploadDir, existingFile));
      } catch {
        // File might not exist, ignore error
      }
    }

    // Save the new logo
    const finalFilePath = path.join(uploadDir, finalFileName);
    await fs.writeFile(finalFilePath, finalBuffer);

    // Return the public URL
    const publicUrl = `/logos/${logoType}/${finalFileName}`;

    return NextResponse.json({
      url: publicUrl,
      filename: finalFileName,
      size: finalBuffer.length,
      clubId,
      clubType
    });

  } catch (error) {
    console.error("Error uploading logo:", error);
    return NextResponse.json(
      { error: "Failed to upload logo" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/clubs/upload-logo - Delete club logo
export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get("clubId");
    const clubType = searchParams.get("clubType");

    if (!clubId || !clubType) {
      return NextResponse.json({ error: "Club ID and type are required" }, { status: 400 });
    }

    const logoType = clubType === 'club' ? 'clubs' : 'hobby-groups';
    const uploadDir = path.join(process.cwd(), 'public', 'logos', logoType);

    // Find and delete existing logo files for this club
    try {
      const existingFiles = await fs.readdir(uploadDir);
      const clubFiles = existingFiles.filter(f => f.startsWith(`${clubId}.`));

      for (const file of clubFiles) {
        await fs.unlink(path.join(uploadDir, file));
      }

      return NextResponse.json({ message: "Logo deleted successfully" });
    } catch {
      return NextResponse.json({ error: "Logo not found" }, { status: 404 });
    }

  } catch (error) {
    console.error("Error deleting logo:", error);
    return NextResponse.json(
      { error: "Failed to delete logo" },
      { status: 500 }
    );
  }
}
