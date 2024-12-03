"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Define Zod Schema for Validation
const userSchema = z.object({
  userName: z
    .string()
    .min(2, { message: "User name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  nameId: z.string().min(1, { message: "Name ID is required" }),
});

// Define TypeScript Type from Schema
type UserFormData = z.infer<typeof userSchema>;

export default function CreateUserPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  const onSubmit = async (data: UserFormData) => {
    // Simulate an API request (replace with your actual API endpoint)
    console.log("Creating user:", data);

    // Redirect to user listing page after submission
    router.push("/users");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-900 text-gray-300 p-6">
      <div className="bg-gray-800 shadow-lg rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-semibold text-gray-100 mb-6">
          Create New User
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* User Name */}
          <div>
            <Label htmlFor="userName" className="text-gray-300">
              User Name
            </Label>
            <Input
              id="userName"
              type="text"
              {...register("userName")}
              placeholder="Enter user name"
              className="mt-1 bg-gray-700 border-gray-600 text-gray-300 w-full"
            />
            {errors.userName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.userName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email" className="text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="Enter email"
              className="mt-1 bg-gray-700 border-gray-600 text-gray-300 w-full"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Name ID */}
          <div>
            <Label htmlFor="nameId" className="text-gray-300">
              Name ID
            </Label>
            <Input
              id="nameId"
              type="text"
              {...register("nameId")}
              placeholder="Enter name ID"
              className="mt-1 bg-gray-700 border-gray-600 text-gray-300 w-full"
            />
            {errors.nameId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.nameId.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            Create User
          </Button>
        </form>
      </div>
    </div>
  );
}
