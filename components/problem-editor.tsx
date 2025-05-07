"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import { formatValidationErrors } from "@/utils/error";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const testCaseSchema = z.object({
  input: z.string().min(1, "Input is required"),
  output: z.string().min(1, "Output is required"),
  kind: z.enum(["example", "test"]),
});

const problemSchema = z.object({
  code: z
    .string()
    .min(2, "Problem code must be at least 2 characters")
    .max(50, "Problem code must be at most 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Problem code must contain only lowercase letters, numbers, and hyphens",
    ),
  name: z
    .string()
    .min(1, "Problem name is required")
    .max(100, "Problem name must be at most 100 characters"),
  statement: z
    .string()
    .min(1, "Problem statement is required")
    .max(10000, "Problem statement must be at most 10000 characters"),
  allowedLanguages: z
    .array(z.string())
    .min(1, "At least one language must be allowed")
    .max(10, "Too many languages specified"),
  testCases: z
    .array(testCaseSchema)
    .min(1, "At least one test case is required")
    .refine(
      (testCases) => testCases.some((tc) => tc.kind === "example"),
      "At least one example test case is required",
    )
    .refine(
      (testCases) => testCases.some((tc) => tc.kind === "test"),
      "At least one hidden test case is required",
    ),
});

type Problem = z.infer<typeof problemSchema>;

interface TestCase {
  input: string;
  output: string;
  kind: "example" | "test";
}

export function ProblemEditor() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const problemId = params.id as string;
  const isEdit = !!problemId;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
    trigger,
  } = useForm<Problem>({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      code: "",
      name: "",
      statement: "",
      allowedLanguages: ["python", "javascript", "typescript"],
      testCases: [{ input: "", output: "", kind: "example" }],
    },
  });

  const allowedLanguages = watch("allowedLanguages") || [];
  const testCases = watch("testCases") || [];

  useEffect(() => {
    if (isEdit) {
      const fetchProblem = async () => {
        try {
          const response = await fetch(
            `/api/orgs/${orgId}/problems/${problemId}`,
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(formatValidationErrors(errorData));
          }
          const data = await response.json();
          // Update form with fetched data
          Object.entries(data).forEach(([key, value]) => {
            if (key === "allowedLanguages" && Array.isArray(value)) {
              setValue("allowedLanguages", value as string[]);
            } else if (key === "testCases" && Array.isArray(value)) {
              setValue("testCases", value as TestCase[]);
            } else if (
              ["code", "name", "statement"].includes(key) &&
              typeof value === "string"
            ) {
              setValue(key as "code" | "name" | "statement", value);
            }
          });
        } catch (error) {
          console.error("Error fetching problem:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to fetch problem",
          });
          router.push(`/${orgId}/problems`);
        }
      };
      fetchProblem();
    }
  }, [isEdit, orgId, problemId, router, toast, setValue]);

  const addTestCase = async (kind: "example" | "test") => {
    const currentTestCases = getValues("testCases");
    setValue("testCases", [
      ...currentTestCases,
      { input: "", output: "", kind },
    ]);
    await trigger("testCases");
  };

  const removeTestCase = async (index: number) => {
    const currentTestCases = getValues("testCases");
    setValue(
      "testCases",
      currentTestCases.filter((_, i) => i !== index),
    );
    await trigger("testCases");
  };

  const updateTestCase = async (
    index: number,
    field: keyof TestCase,
    value: string,
    kind: "example" | "test",
  ) => {
    const currentTestCases = [...testCases];
    // Find the actual index in the full array
    const fullIndex = currentTestCases.findIndex(
      (tc, i) =>
        tc.kind === kind &&
        currentTestCases.filter((t) => t.kind === kind).indexOf(tc) === index,
    );

    if (fullIndex !== -1) {
      currentTestCases[fullIndex] = {
        ...currentTestCases[fullIndex],
        [field]: value,
      };
      setValue("testCases", currentTestCases);
      await trigger("testCases");
    }
  };

  const onSubmit = async (data: Problem) => {
    try {
      const url = isEdit
        ? `/api/orgs/${orgId}/problems/${problemId}`
        : `/api/orgs/${orgId}/problems`;

      console.log("data.testCases", data.testCases);
      console.log("isEdit", isEdit);

      // Transform the data to match the API's expected format
      const apiData = {
        code: data.code,
        title: data.name, // Map 'name' to 'title'
        description: data.statement, // Map 'statement' to 'description'
        allowedLanguages: Array.isArray(data.allowedLanguages)
          ? data.allowedLanguages
          : typeof data.allowedLanguages === "string"
            ? data.allowedLanguages
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        testCases: data.testCases,
        orgId: parseInt(orgId),
      };

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || formatValidationErrors(errorData);
        throw new Error(errorMessage);
      }

      toast({
        title: "Success",
        description: `Problem ${isEdit ? "updated" : "created"} successfully`,
      });
      router.push(`/${orgId}/problems`);
    } catch (error) {
      console.error("Error saving problem:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save problem",
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Problem" : "Create New Problem"}
        </h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/${orgId}/problems`)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)}>Save</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Problem Code</label>
          <Input
            {...register("code")}
            placeholder="Enter problem code (lowercase letters, numbers, and hyphens only)"
          />
          {errors.code && (
            <p className="text-sm text-destructive mt-1">
              {errors.code.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Problem Name</label>
          <Input {...register("name")} placeholder="Enter problem name" />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Problem Statement</label>
          <Textarea
            {...register("statement")}
            placeholder="Enter problem statement"
            className="h-32"
          />
          {errors.statement && (
            <p className="text-sm text-destructive mt-1">
              {errors.statement.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium">Allowed Languages</label>
          <Input
            {...register("allowedLanguages", {
              setValueAs: (value) =>
                typeof value === "string"
                  ? value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : value,
            })}
            defaultValue={
              Array.isArray(allowedLanguages) ? allowedLanguages.join(", ") : ""
            }
            onChange={(e) => {
              setValue("allowedLanguages", e.target.value);
            }}
            onBlur={(e) => {
              const languages = e.target.value
                ? e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];
              setValue("allowedLanguages", languages);
              trigger("allowedLanguages");
            }}
            placeholder="Enter comma-separated languages (e.g. python, javascript, typescript)"
          />
          {errors.allowedLanguages && (
            <p className="text-sm text-destructive mt-1">
              {errors.allowedLanguages.message}
            </p>
          )}
        </div>

        <Tabs defaultValue="example" className="w-full">
          <TabsList>
            <TabsTrigger value="example">Example Test Cases</TabsTrigger>
            <TabsTrigger value="test">Hidden Test Cases</TabsTrigger>
          </TabsList>

          {errors.testCases && (
            <p className="text-sm text-destructive mt-1">
              {errors.testCases.message}
            </p>
          )}

          <TabsContent value="example" className="space-y-4">
            {testCases
              .filter((tc) => tc.kind === "example")
              .map((testCase, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Input</label>
                    <Textarea
                      value={testCase.input}
                      onChange={(e) =>
                        updateTestCase(
                          index,
                          "input",
                          e.target.value,
                          "example",
                        )
                      }
                      placeholder="Test case input"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Output</label>
                    <Textarea
                      value={testCase.output}
                      onChange={(e) =>
                        updateTestCase(
                          index,
                          "output",
                          e.target.value,
                          "example",
                        )
                      }
                      placeholder="Expected output"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTestCase(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addTestCase("example")}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Example Test Case
            </Button>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            {testCases
              .filter((tc) => tc.kind === "test")
              .map((testCase, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Input</label>
                    <Textarea
                      value={testCase.input}
                      onChange={(e) =>
                        updateTestCase(index, "input", e.target.value, "test")
                      }
                      placeholder="Test case input"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Output</label>
                    <Textarea
                      value={testCase.output}
                      onChange={(e) =>
                        updateTestCase(index, "output", e.target.value, "test")
                      }
                      placeholder="Expected output"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTestCase(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => addTestCase("test")}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Hidden Test Case
            </Button>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
