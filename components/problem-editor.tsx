"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TestCase {
  input: string;
  output: string;
  kind: "example" | "test";
}

interface Problem {
  id?: string;
  code: string;
  title: string;
  description: string;
  allowedLanguages: string[];
  testCases: TestCase[];
}

interface ProblemEditorProps {
  problem?: Problem | null;
  onSave?: (problem: Problem) => void;
}

export function ProblemEditor({ problem, onSave }: ProblemEditorProps) {
  const { toast } = useToast();

  const [currentProblem, setCurrentProblem] = useState<Problem>({
    id: problem?.id?.toString() || "1",
    code: problem?.code || "",
    title: problem?.title || "",
    description: problem?.description || "",
    allowedLanguages: problem?.allowedLanguages || [
      "python",
      "javascript",
      "typescript",
    ],
    testCases: problem?.testCases || [
      { input: "", output: "", kind: "example" },
    ],
  });

  const updateProblemField = <K extends keyof Problem>(
    field: K,
    value: Problem[K],
  ) => {
    setCurrentProblem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTestCase = () => {
    setCurrentProblem((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { input: "", output: "", kind: "example" },
      ],
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

  const removeTestCase = (index: number) => {
    if (currentProblem.testCases.length === 1) return;
    setCurrentProblem((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProblem = async () => {
    try {
      if (onSave) await onSave(currentProblem);
      toast({
        title: "Success",
        description: "Problem saved successfully",
      });
    } catch (error) {
      console.error("Error saving problem:", error);
      toast({
        title: "Error",
        description: "Failed to save problem",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 px-6 py-2">
        <Tabs defaultValue="problem" className="w-full">
          <TabsList className="w-full bg-muted p-1 mb-6">
            <TabsTrigger
              value="problem"
              className="flex-1 data-[state=active]:bg-background"
            >
              Problem
            </TabsTrigger>
            <TabsTrigger
              value="testcases"
              className="flex-1 data-[state=active]:bg-background"
            >
              Test Cases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problem">
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="code"
                  className="block text-sm font-medium mb-1"
                >
                  Problem Code
                </label>
                <Input
                  id="code"
                  value={currentProblem.code}
                  onChange={(e) => updateProblemField("code", e.target.value)}
                  placeholder="Enter problem code (unique identifier for this problem)"
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
                  Title
                </label>
                <Input
                  id="title"
                  value={currentProblem.title}
                  onChange={(e) => updateProblemField("title", e.target.value)}
                  placeholder="Enter problem title"
                  className="bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  value={currentProblem.description}
                  onChange={(e) =>
                    updateProblemField("description", e.target.value)
                  }
                  placeholder="Enter problem description"
                  className="min-h-[200px] bg-muted border-border"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="allowedLanguages"
                  className="block text-sm font-medium mb-1"
                >
                  Allowed Languages
                </label>
                <Input
                  id="allowedLanguages"
                  value={currentProblem.allowedLanguages.join(", ")}
                  onChange={(e) =>
                    updateProblemField(
                      "allowedLanguages",
                      e.target.value.split(", "),
                    )
                  }
                  placeholder="Enter allowed languages separated by comma"
                  className="bg-muted border-border"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testcases">
            <div className="space-y-4">
              {currentProblem.testCases.map((testCase, index) => (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">
                      Test Case {index + 1}
                    </h3>
                    {currentProblem.testCases.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTestCase(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor={`input-${index}`}
                        className="block text-sm font-medium mb-1"
                      >
                        Input
                      </label>
                      <Textarea
                        id={`input-${index}`}
                        value={testCase.input}
                        onChange={(e) =>
                          updateTestCase(index, "input", e.target.value)
                        }
                        placeholder="Enter test case input"
                        className="bg-muted border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`output-${index}`}
                        className="block text-sm font-medium mb-1"
                      >
                        Output
                      </label>
                      <Textarea
                        id={`output-${index}`}
                        value={testCase.output}
                        onChange={(e) =>
                          updateTestCase(index, "output", e.target.value)
                        }
                        placeholder="Enter expected output"
                        className="bg-muted border-border"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button onClick={addTestCase} className="mx-1">
                <Plus className="h-4 w-4 mr-2" /> Add Test Case
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end mt-4">
          <Button
            onClick={handleSaveProblem}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Problem
          </Button>
        </div>
      </div>
    </div>
  );
}
