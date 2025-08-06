"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserLogin } from "@/lib/types";
import { useAuth } from "@/components/providers/AuthProvider";
import Link from "next/link";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<UserLogin>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, error } = useAuth();
  const router = useRouter();

  // Toggle password visibility
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      router.push("/");
    } catch (error) {
      console.log("Error while login:", error);
    }
    setIsLoading(false);
  };

  // Handle input changes
  const onChangeHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Login to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your todos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Optional alert example */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={onChangeHandle}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                {showPassword ? (
                  <FaRegEyeSlash
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer"
                  />
                ) : (
                  <FaRegEye
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground cursor-pointer"
                  />
                )}
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={onChangeHandle}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded text-sm font-medium hover:bg-primary/90 transition"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        </CardContent>
        <CardFooter className="flex items-center  justify-center text-muted-foreground">
          Don't have an Account?{" "}
          <Link
            href={"/register"}
            className="mx-1 hover:text-primary font-semibold"
          >
            Register
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
