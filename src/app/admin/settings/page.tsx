"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Save,
  RefreshCw,
  Shield,
  Database,
  Globe,
  Users,
  Bell,
  Palette,
  Download,
  Upload,
  Trash2
} from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "Tech@IITGN",
    siteDescription: "Technical Council - IIT Gandhinagar",
    adminEmails: ["mukul.meena@iitgn.ac.in", "technical.secretary@iitgn.ac.in"],
    enableNotifications: true,
    autoBackup: true,
    maintenanceMode: false,
    maxFileSize: "10MB",
    allowedFileTypes: ["jpg", "jpeg", "png", "gif", "webp"]
  });

  const [siteSettings, setSiteSettings] = useState({
    hackathonsVisible: true,
    lastModified: "",
    modifiedBy: ""
  });

  const [blobSettings, setBlobSettings] = useState({
    color: "#06b6d4",
    lastUpdated: ""
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user?.isAdmin) {
      router.push("/admin/login");
      return;
    }

    // Fetch site settings
    fetchSiteSettings();
    fetchBlobSettings();
  }, [session, status, router]);

  const fetchSiteSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        setSiteSettings(data);
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
    }
  };

  const fetchBlobSettings = async () => {
    try {
      const response = await fetch("/api/admin/blob-settings");
      if (response.ok) {
        const data = await response.json();
        setBlobSettings(data);
      }
    } catch (error) {
      console.error("Error fetching blob settings:", error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Simulate save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    alert("Settings saved successfully!");
  };

  const handleHackathonsVisibilityToggle = async (visible: boolean) => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          setting: "hackathonsVisible",
          value: visible
        }),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setSiteSettings(updatedSettings);
        alert(`Hackathons section ${visible ? 'enabled' : 'disabled'} successfully!`);
      } else {
        throw new Error("Failed to update setting");
      }
    } catch (error) {
      console.error("Error updating hackathons visibility:", error);
      alert("Failed to update setting. Please try again.");
    }
  };

  const handleBlobColorUpdate = async (color: string) => {
    try {
      // Validate hex color format
      if (!/^#[0-9A-Fa-f]{6}$/.test(color)) {
        alert("Please enter a valid hex color (e.g., #06b6d4)");
        return;
      }

      const response = await fetch("/api/admin/blob-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ color }),
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setBlobSettings(updatedSettings.settings);
        alert("Blob color updated successfully!");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update blob color");
      }
    } catch (error) {
      console.error("Error updating blob color:", error);
      alert("Failed to update blob color. Please try again.");
    }
  };

  const handleBlobColorReset = async () => {
    try {
      const response = await fetch("/api/admin/blob-settings", {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedSettings = await response.json();
        setBlobSettings(updatedSettings.settings);
        alert("Blob color reset to default successfully!");
      } else {
        throw new Error("Failed to reset blob color");
      }
    } catch (error) {
      console.error("Error resetting blob color:", error);
      alert("Failed to reset blob color. Please try again.");
    }
  };

  const handleBackup = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/backup", {
        method: "POST"
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      alert("Backup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append('backup', file);
        
        try {
          const response = await fetch("/api/admin/restore", {
            method: "POST",
            body: formData
          });
          if (response.ok) {
            alert("Data restored successfully!");
            window.location.reload();
          }
        } catch (err) {
          alert("Restore failed");
        }
      }
    };
    input.click();
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-space-grotesk">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Configure your admin dashboard and website settings
            </p>
          </div>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* General Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Input
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable public access
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Hackathons & Competitions Section</Label>
                  <p className="text-sm text-muted-foreground">
                    Show/hide hackathons section on public site
                  </p>
                  {siteSettings.lastModified && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Last modified by {siteSettings.modifiedBy} on {new Date(siteSettings.lastModified).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Switch
                  checked={siteSettings.hackathonsVisible}
                  onCheckedChange={handleHackathonsVisibilityToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin Access */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Admin Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Authorized Admin Emails</Label>
                <div className="space-y-2 mt-2">
                  {settings.adminEmails.map((email, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="flex-1 justify-start">
                        {email}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newEmails = settings.adminEmails.filter((_, i) => i !== index);
                          setSettings(prev => ({ ...prev, adminEmails: newEmails }));
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    const email = prompt("Enter admin email:");
                    if (email && email.includes("@")) {
                      setSettings(prev => ({ 
                        ...prev, 
                        adminEmails: [...prev.adminEmails, email] 
                      }));
                    }
                  }}
                >
                  Add Email
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for new events
                  </p>
                </div>
                <Switch
                  checked={settings.enableNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enableNotifications: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* File Upload Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Upload Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="maxFileSize">Maximum File Size</Label>
                <Input
                  id="maxFileSize"
                  value={settings.maxFileSize}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxFileSize: e.target.value }))}
                />
              </div>

              <div>
                <Label>Allowed File Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {settings.allowedFileTypes.map((type, index) => (
                    <Badge key={index} variant="secondary">
                      .{type}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blob Color Settings */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                3D Blob Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="blobColor">Blob Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="blobColor"
                    type="color"
                    value={blobSettings.color}
                    onChange={(e) => setBlobSettings(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    type="text"
                    value={blobSettings.color}
                    onChange={(e) => setBlobSettings(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#06b6d4"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the color for the 3D blob on the about page
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleBlobColorUpdate(blobSettings.color)}
                  className="flex-1"
                >
                  Update Color
                </Button>
                <Button
                  variant="outline"
                  onClick={handleBlobColorReset}
                >
                  Reset to Default
                </Button>
              </div>

              {blobSettings.lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Last updated: {new Date(blobSettings.lastUpdated).toLocaleString()}
                </p>
              )}

              <div className="p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Color Theory Recommendations:</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
                    <span>#06b6d4 (Default)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span>#3b82f6 (Brand Blue)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                    <span>#8b5cf6 (Brand Purple)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically backup data daily
                  </p>
                </div>
                <Switch
                  checked={settings.autoBackup}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoBackup: checked }))}
                />
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleBackup}
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Backup
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleRestore}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Restore from Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Information */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">Version</h4>
                <p className="text-2xl font-bold text-blue-600">1.0.0</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">Environment</h4>
                <p className="text-2xl font-bold text-green-600">Development</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">Last Backup</h4>
                <p className="text-sm text-muted-foreground">Never</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <h4 className="font-semibold">Storage Used</h4>
                <p className="text-sm text-muted-foreground">~2.5 MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="glass border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-300">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg">
              <div>
                <h4 className="font-medium">Reset All Data</h4>
                <p className="text-sm text-muted-foreground">
                  This will permanently delete all events and photos
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm("Are you sure? This action cannot be undone.")) {
                    alert("Reset functionality would be implemented here");
                  }
                }}
              >
                Reset Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
