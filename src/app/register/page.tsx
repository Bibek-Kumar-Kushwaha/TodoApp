"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserCreate } from "@/lib/types";
import { Lock, Mail, UserRound } from "lucide-react";
import React, { useState } from "react";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useAuth } from "@/components/providers/AuthProvider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Register: React.FC = () => {
  const [formData, setFormData] = useState<UserCreate>({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, error } = useAuth();
  const router = useRouter();
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      router.push("/login");
    } catch (error) {
      console.error("Error while registering:", error);
    }

    setIsLoading(false);
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const onChangeHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen flex justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Register New Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your todos
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <div className="relative">
                <UserRound className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={onChangeHandle}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
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
              {isLoading ? "Registering..." : "Register"}
            </button>
          </form>
        </CardContent>
        <CardFooter className="flex items-center  justify-center text-muted-foreground">
          Already have an accoun?{" "}
          <Link
            href={"/login"}
            className="mx-1 hover:text-primary font-semibold"
          >
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
