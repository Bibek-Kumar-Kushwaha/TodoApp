"use client";

import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  Save,
  Edit,
  CheckCircle,
  Clock,
  Target,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    todo: number;
  };
}

interface ProfileStats {
  totalTodos: number;
  completedTodos: number;
  pendingTodos: number;
  completionRate: number;
}

const Profile: React.FC = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats>({
    totalTodos: 0,
    completedTodos: 0,
    pendingTodos: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, []);

  const fetchProfile = async () => {
    try {
      // Get token from localStorage as fallback
      const token = localStorage.getItem('auth-token');
      
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      const userData = {
        ...response.data.user,
        createdAt: new Date(response.data.user.createdAt),
        updatedAt: new Date(response.data.user.updatedAt),
      };

      setProfile(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email,
      });
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get token from localStorage as fallback
      const token = localStorage.getItem('auth-token');
      
      const response = await axios.get("/api/todos?limit=1000", {
        withCredentials: true,
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      const todos = response.data?.data || [];
      const totalTodos = todos.length;
      const completedTodos = todos.filter((todo: any) => todo.completed).length;
      const pendingTodos = totalTodos - completedTodos;
      const completionRate =
        totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0;

      setStats({
        totalTodos,
        completedTodos,
        pendingTodos,
        completionRate,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get token from localStorage as fallback
      const token = localStorage.getItem('auth-token');
      
      const response = await axios.put("/api/auth/me", formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
      });

      setProfile((prev) => (prev ? { ...prev, ...response.data } : null));
      setEditing(false);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.response?.status === 401) {
        router.push("/login");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email,
      });
    }
    setEditing(false);
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!profile) {
    return (
      <ProtectedRoute>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-red-500">Failed to load profile</p>
            <Button onClick={fetchProfile} className="mt-4">
              Retry
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and view your statistics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your account details and preferences
                    </CardDescription>
                  </div>
                  {!editing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Avatar Section */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarFallback className="text-lg">
                        {getInitials(profile.name, profile.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-medium">
                        {profile.name || "Anonymous User"}
                      </h3>
                      <p className="text-muted-foreground">{profile.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Member since{" "}
                        {formatDistanceToNow(profile.createdAt, {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        {editing ? (
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                name: e.target.value,
                              }))
                            }
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 py-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{profile.name || "Not set"}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        {editing ? (
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                            placeholder="Enter your email"
                          />
                        ) : (
                          <div className="flex items-center space-x-2 py-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{profile.email}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {editing && (
                      <div className="flex space-x-2 pt-4">
                        <Button onClick={handleSave} disabled={saving}>
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button variant="outline" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Account Details */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Account Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Created:</span>
                        <span>
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          Last updated:
                        </span>
                        <span>
                          {formatDistanceToNow(profile.updatedAt, {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Your Statistics</CardTitle>
                <CardDescription>Overview of your productivity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Total Tasks</p>
                        <p className="text-2xl font-bold">{stats.totalTodos}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.completedTodos}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm font-medium">Pending</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {stats.pendingTodos}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Completion Rate
                      </span>
                      <Badge
                        variant={
                          stats.completionRate >= 70 ? "default" : "secondary"
                        }
                      >
                        {stats.completionRate.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stats.completionRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
