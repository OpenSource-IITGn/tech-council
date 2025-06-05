"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Save,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Image as ImageIcon
} from "lucide-react";

export default function NewEvent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    category: "",
    organizingBody: "",
    location: "",
    draft: true,
    gallery: [] as string[]
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }
  }, [session, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Form submitted with data:", formData);

    try {
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error("Failed to create event");
      }

      const result = await response.json();
      console.log("Success result:", result);
      alert("Event created successfully!");
      router.push("/admin/events");
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addGalleryImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, url]
      }));
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const testCreateEvent = () => {
    setFormData({
      title: "Test Event",
      description: "This is a test event created from the admin panel",
      date: "2024-01-15",
      category: "Workshop",
      organizingBody: "Technical Council",
      location: "IITGN Campus",
      draft: false,
      gallery: []
    });
  };

  const testDirectAPI = async () => {
    try {
      const testData = {
        title: "Direct API Test Event",
        description: "This is a test event created directly via API",
        date: "2024-01-15",
        category: "Workshop",
        organizingBody: "Technical Council",
        location: "IITGN Campus",
        draft: false,
        gallery: []
      };

      console.log("Making direct API call with data:", testData);

      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testData),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        alert(`Failed to create event: ${JSON.stringify(errorData)}`);
      } else {
        const result = await response.json();
        console.log("Success result:", result);
        alert("Event created successfully via direct API!");
      }
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session?.user?.isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="secondary"
            onClick={testCreateEvent}
          >
            Fill Test Data
          </Button>
          <Button
            variant="outline"
            onClick={testDirectAPI}
          >
            Test Direct API
          </Button>
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Create New Event
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add a new event to your gallery
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter event title"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe the event"
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="date">Event Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={formData.date}
                        onChange={(e) => handleInputChange("date", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange("category", e.target.value)}
                        placeholder="e.g., Workshop, Competition, Seminar"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="organizingBody">Organizing Body</Label>
                      <Input
                        id="organizingBody"
                        value={formData.organizingBody}
                        onChange={(e) => handleInputChange("organizingBody", e.target.value)}
                        placeholder="e.g., Technical Council"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        placeholder="Event location"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gallery */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Photo Gallery
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addGalleryImage}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Photo URL
                    </Button>

                    {formData.gallery.length > 0 && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {formData.gallery.map((url, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={url}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder-image.jpg";
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeGalleryImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.gallery.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No photos added yet</p>
                        <p className="text-sm">Add photo URLs to create a gallery</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Publish Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="draft">Save as Draft</Label>
                      <p className="text-sm text-muted-foreground">
                        Keep this event private until ready to publish
                      </p>
                    </div>
                    <Switch
                      id="draft"
                      checked={formData.draft}
                      onCheckedChange={(checked) => handleInputChange("draft", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading || !formData.title || !formData.description}
                  >
                    {isLoading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {formData.draft ? "Save Draft" : "Publish Event"}
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>

              {/* Preview */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Title:</strong> {formData.title || "Untitled Event"}</p>
                    <p><strong>Category:</strong> {formData.category || "Uncategorized"}</p>
                    <p><strong>Date:</strong> {formData.date ? new Date(formData.date).toLocaleDateString() : "No date set"}</p>
                    <p><strong>Photos:</strong> {formData.gallery.length} images</p>
                    <p><strong>Status:</strong> {formData.draft ? "Draft" : "Published"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
