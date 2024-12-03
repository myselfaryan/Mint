"use client";
import { RegisterInput } from "@/lib/validations";
import { registerSchema } from "@/lib/validations";
import { LoginInput } from "@/lib/validations";
import { loginSchema } from "@/lib/validations";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// const loginSchema = z.object({
//   email: z.string().email({ message: "Invalid email address" }),
//   password: z
//     .string()
//     .min(8, { message: "Password must be at least 8 characters long" }),
// });

// const registerSchema = loginSchema
//   .extend({
//     name: z
//       .string()
//       .min(2, { message: "Name must be at least 2 characters long" }),
//     confirmPassword: z
//       .string()
//       .min(8, { message: "Password must be at least 8 characters long" }),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// type LoginFormValues = z.infer<typeof loginSchema>;
// type RegisterFormValues = z.infer<typeof registerSchema>;

export function AuthComponent({
  initialMode = "login",
}: {
  initialMode?: "login" | "register";
}) {
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const router = useRouter();

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onLoginSubmit(values: LoginInput) {
    console.log(values);
  }

  function onRegisterSubmit(values: RegisterInput) {
    console.log(values);
  }

  return (
    <Card className="w-[400px]">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl font-bold">{isLogin ? "Login" : "Register"}</CardTitle>
        <CardDescription>
          {isLogin ? "Enter your credentials to login" : "Create a new account"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {isLogin ? (
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              className="space-y-4"
            >
              <FormField
                control={loginForm.control}
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
                control={loginForm.control}
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
        ) : (
          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              className="space-y-4"
            >
              <FormField
                control={registerForm.control}
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
                control={registerForm.control}
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
                control={registerForm.control}
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
                control={registerForm.control}
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
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-4">
        <Button
          variant="link"
          className="w-full"
          onClick={() => {
            const newMode = isLogin ? "register" : "login";
            setIsLogin(!isLogin);
            router.push(`/auth?mode=${newMode}`, { scroll: false });
          }}
        >
          {isLogin
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </Button>
      </CardFooter>
    </Card>
  );
}
