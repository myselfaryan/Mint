"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { marked } from "marked";

interface MockAlertProps {
  show: boolean;
}

export function MockAlert({ show }: MockAlertProps) {
  if (!show) return null;

  return (
    <div className="mt-6 my-4 mx-8">
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          <div
            dangerouslySetInnerHTML={{
              __html: marked.parse(
                "You are viewing **dummy data** in this page, because fetching from backend failed. This is because `ENABLE_MOCKING` is set to _true_ in the `.env` file.",
              ),
            }}
          />
        </AlertDescription>
      </Alert>
    </div>
  );
}
