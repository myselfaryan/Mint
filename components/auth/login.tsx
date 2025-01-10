"use client";

import { LoginFormInput, loginFormSchema } from "@/lib/validations";
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

export function LoginComponent() {
  const { toast } = useToast();
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const form = useForm<LoginFormInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormInput) {
    try {
      const userData = await login(values.email, values.password);
      if (userData.orgs && userData.orgs.length > 0) {
        router.push(`/${userData.orgs[0].nameId}`);
      } else {
        router.push("/onboarding");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }

  return (
    <AuthCard
      title="Login"
      description="Enter your credentials to login"
      footerLinkText="Don't have an account? Register"
      footerLink="/auth/register"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </Form>
    </AuthCard>
  );
}
