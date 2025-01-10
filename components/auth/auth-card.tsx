"use client";

import { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footerLinkText: string;
  footerLink: string;
}

export function AuthCard({
  title,
  description,
  children,
  footerLinkText,
  footerLink,
}: AuthCardProps) {
  const router = useRouter();

  return (
    <Card className="w-[400px]">
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
      <CardFooter className="flex flex-col space-y-4 pt-4">
        <Button
          variant="link"
          className="w-full"
          onClick={() => {
            router.push(footerLink, { scroll: false });
          }}
        >
          {footerLinkText}
        </Button>
      </CardFooter>
    </Card>
  );
}
