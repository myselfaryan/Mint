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

interface TestCase {
  input: string;
  output: string;
  kind: "example" | "test";
}

interface Problem {
  nameId?: string;
  code: string; // problem code (required)
  name: string; // problem title (required)
  statement: string; // problem description (required)
  allowedLanguages: string[];
  testCases: TestCase[];
}

export function ProblemEditor() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;
  const problemId = params.id as string;
  const isEdit = !!problemId;

  const [currentProblem, setCurrentProblem] = useState<Problem>({
    code: "",
    name: "",
    statement: "",
    allowedLanguages: ["python", "javascript", "typescript"],
    testCases: [{ input: "", output: "", kind: "example" }],
  });

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
          setCurrentProblem(data);
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
      console.log("From useEffect in problem editor", orgId, problemId);
    }
  }, [isEdit, orgId, problemId, router, toast]);

  const updateProblemField = <K extends keyof Problem>(
    field: K,
    value: Problem[K],
  ) => {
    setCurrentProblem((prev) => ({ ...prev, [field]: value }));
  };

  const addTestCase = (kind: "example" | "test") => {
    setCurrentProblem((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "", kind }],
    }));
  };

  const removeTestCase = (index: number) => {
    setCurrentProblem((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const updateTestCase = (
    index: number,
    field: keyof TestCase,
    value: string,
  ) => {
    setCurrentProblem((prev) => ({
      ...prev,
      testCases: prev.testCases.map((tc, i) =>
        i === index ? { ...tc, [field]: value } : tc,
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      const url = isEdit
        ? `/api/orgs/${orgId}/problems/${problemId}`
        : `/api/orgs/${orgId}/problems`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...currentProblem,
          orgId: parseInt(orgId),
        }),
      });

      if (!response.ok) {
        console.log("NOT RESPONSE OK in problems");
        const errorData = await response.json().catch(() => ({}));
        console.log(errorData);
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
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Problem Code</label>
          <Input
            value={currentProblem.code}
            onChange={(e) => updateProblemField("code", e.target.value)}
            placeholder="Enter problem code"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Problem Name</label>
          <Input
            value={currentProblem.name}
            onChange={(e) => updateProblemField("name", e.target.value)}
            placeholder="Enter problem name"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Problem Statement</label>
          <Textarea
            value={currentProblem.statement}
            onChange={(e) => updateProblemField("statement", e.target.value)}
            placeholder="Enter problem statement"
            className="h-32"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Allowed Languages</label>
          <Input
            value={currentProblem.allowedLanguages.join(", ")}
            onChange={(e) =>
              updateProblemField(
                "allowedLanguages",
                e.target.value.split(",").map((s) => s.trim()),
              )
            }
            placeholder="Enter comma-separated languages"
          />
        </div>

        <Tabs defaultValue="example" className="w-full">
          <TabsList>
            <TabsTrigger value="example">Example Test Cases</TabsTrigger>
            <TabsTrigger value="test">Hidden Test Cases</TabsTrigger>
          </TabsList>

          <TabsContent value="example" className="space-y-4">
            {currentProblem.testCases
              .filter((tc) => tc.kind === "example")
              .map((testCase, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Input</label>
                    <Textarea
                      value={testCase.input}
                      onChange={(e) =>
                        updateTestCase(index, "input", e.target.value)
                      }
                      placeholder="Test case input"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Output</label>
                    <Textarea
                      value={testCase.output}
                      onChange={(e) =>
                        updateTestCase(index, "output", e.target.value)
                      }
                      placeholder="Expected output"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTestCase(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              onClick={() => addTestCase("example")}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Example Test Case
            </Button>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            {currentProblem.testCases
              .filter((tc) => tc.kind === "test")
              .map((testCase, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium">Input</label>
                    <Textarea
                      value={testCase.input}
                      onChange={(e) =>
                        updateTestCase(index, "input", e.target.value)
                      }
                      placeholder="Test case input"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Output</label>
                    <Textarea
                      value={testCase.output}
                      onChange={(e) =>
                        updateTestCase(index, "output", e.target.value)
                      }
                      placeholder="Expected output"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTestCase(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            <Button
              variant="outline"
              onClick={() => addTestCase("test")}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Hidden Test Case
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
