"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { maxFileSize } from "@/lib/torque-data";

export default function NewMagazinePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    title: "",
    description: "",
    pages: "",
    articles: "",
    featured: "",
    isLatest: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file.');
        return;
      }
      
      // Validate file size
      if (file.size > maxFileSize) {
        alert(`File size too large. Maximum size is ${maxFileSize / (1024 * 1024)}MB.`);
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File, year: string) => {
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('year', year);

    const response = await fetch('/api/admin/torque/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file');
    }

    return response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select a PDF file to upload.');
      return;
    }

    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Upload file first
      setUploadProgress(30);
      const uploadResult = await uploadFile(selectedFile, formData.year);
      
      setUploadProgress(60);
      
      // Create magazine record
      const magazineData = {
        year: formData.year,
        title: formData.title,
        description: formData.description,
        pages: parseInt(formData.pages) || 0,
        articles: parseInt(formData.articles) || 0,
        featured: formData.featured,
        filePath: uploadResult.filePath,
        fileName: uploadResult.fileName,
        fileSize: uploadResult.fileSize,
        isLatest: formData.isLatest
      };

      const response = await fetch("/api/admin/torque", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(magazineData),
      });

      if (!response.ok) {
        throw new Error("Failed to create magazine record");
      }

      setUploadProgress(100);
      router.push("/admin/torque");
    } catch (error) {
      console.error("Error creating magazine:", error);
      alert(error instanceof Error ? error.message : "Failed to create magazine");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Upload New Magazine
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Upload a new Torque magazine issue
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="file">PDF File *</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: {formatFileSize(maxFileSize)}. Only PDF files are allowed.
                </p>
              </div>
              
              {selectedFile && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Size: {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              )}

              {uploadProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upload Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Magazine Information */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Magazine Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    value={formData.year}
                    onChange={(e) => handleInputChange("year", e.target.value)}
                    required
                    placeholder="2024"
                  />
                </div>
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    placeholder="Innovation Unleashed"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                  rows={3}
                  placeholder="Brief description of the magazine content"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="pages">Number of Pages *</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={formData.pages}
                    onChange={(e) => handleInputChange("pages", e.target.value)}
                    required
                    min="1"
                    placeholder="120"
                  />
                </div>
                <div>
                  <Label htmlFor="articles">Number of Articles *</Label>
                  <Input
                    id="articles"
                    type="number"
                    value={formData.articles}
                    onChange={(e) => handleInputChange("articles", e.target.value)}
                    required
                    min="1"
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="featured">Featured Article *</Label>
                  <Input
                    id="featured"
                    value={formData.featured}
                    onChange={(e) => handleInputChange("featured", e.target.value)}
                    required
                    placeholder="AI in Healthcare"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isLatest"
                  checked={formData.isLatest}
                  onCheckedChange={(checked) => handleInputChange("isLatest", checked as boolean)}
                />
                <Label htmlFor="isLatest">
                  Set as latest magazine (will unset current latest)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !selectedFile}>
              {isLoading ? "Uploading..." : "Upload Magazine"}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
