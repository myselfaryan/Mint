"use client";

import { RegisterFormInput, registerFormSchema } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/contexts/auth-context";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthCard } from "./auth-card";

// Helper function to generate nameId from name
function generateNameId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-") // Replace non-alphanumeric chars with dash
    .replace(/-+/g, "-") // Replace multiple dashes with single dash
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}

export function RegisterComponent() {
  const { toast } = useToast();
  const { signup } = useContext(AuthContext);
  const router = useRouter();

  const form = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: RegisterFormInput) {
    try {
      // Generate nameId from name and include it in the API request
      const nameId = generateNameId(values.name);
      await signup(values.email, values.password, values.name, nameId);
      router.push("/onboarding");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }

  return (
    <AuthCard
      title="Register"
      description="Create a new account"
      footerLinkText="Already have an account? Login"
      footerLink="/login"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
