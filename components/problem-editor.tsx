"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  mockProblems,
  Problem as ListProblem,
} from "@/app/[orgId]/problems/mockProblems";

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
  problem?: ListProblem | null;
  onClose?: () => void;
  onSave?: (problem: ListProblem) => void;
}

export function ProblemEditor({
  problem,
  onClose,
  onSave,
}: ProblemEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [problems, setProblems] = useState<Problem[]>([
    {
      id: problem?.id?.toString() || "1",
      code: problem?.nameId || "",
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
    },
  ]);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);

  const currentProblem = problems[currentProblemIndex];

  const addTestCase = () => {
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex] = {
      ...currentProblem,
      testCases: [
        ...currentProblem.testCases,
        { input: "", output: "", kind: "example" },
      ],
    };
    setProblems(updatedProblems);
  };

  const removeTestCase = (index: number) => {
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex] = {
      ...currentProblem,
      testCases: currentProblem.testCases.filter((_, i) => i !== index),
    };
    setProblems(updatedProblems);
  };

  const updateTestCase = (
    index: number,
    field: "input" | "output" | "kind",
    value: string,
  ) => {
    const updatedProblems = [...problems];
    const updatedTestCases = currentProblem.testCases.map((testCase, i) =>
      i === index ? { ...testCase, [field]: value } : testCase,
    );
    updatedProblems[currentProblemIndex] = {
      ...currentProblem,
      testCases: updatedTestCases,
    };
    setProblems(updatedProblems);
  };

  const updateProblemField = (
    field: "code" | "title" | "description" | "allowedLanguages",
    value: string | string[],
  ) => {
    const updatedProblems = [...problems];
    updatedProblems[currentProblemIndex] = {
      ...currentProblem,
      [field]: value,
    };
    setProblems(updatedProblems);
  };

  const addNewProblem = () => {
    const newProblem: Problem = {
      id: (problems.length + 1).toString(),
      code: "",
      title: "",
      description: "",
      allowedLanguages: ["python", "javascript", "typescript"],
      testCases: [{ input: "", output: "", kind: "example" }],
    };
    setProblems([...problems, newProblem]);
    setCurrentProblemIndex(problems.length);
  };

  const removeProblem = (index: number) => {
    if (problems.length === 1) return;
    const updatedProblems = problems.filter((_, i) => i !== index);
    setProblems(updatedProblems);
    setCurrentProblemIndex(
      Math.min(currentProblemIndex, updatedProblems.length - 1),
    );
  };

  const handleCreateContest = () => {
    // TODO: Add API call to create contest with problems
    console.log("Creating contest with problems:", problems);
    toast({
      title: "Success!",
      description: "Contest created successfully",
      duration: 3000,
    });
    router.push("/contests");
  };

  const handleSaveProblem = async () => {
    try {
      // Validate required fields
      if (!currentProblem.title || !currentProblem.description) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      // Validate test cases
      if (currentProblem.testCases.some((tc) => !tc.input || !tc.output)) {
        toast({
          title: "Error",
          description: "Please fill in all test cases",
          variant: "destructive",
        });
        return;
      }

      // If editing an existing problem
      if (problem) {
        const updatedProblem: ListProblem = {
          ...problem,
          title: currentProblem.title,
          allowedLanguages: currentProblem.allowedLanguages,
        };
        onSave?.(updatedProblem);
        onClose?.();
        return;
      }

      // Creating a new problem
      const nameId = Math.random().toString(36).substring(2, 7).toUpperCase();
      const newProblem: ListProblem = {
        id: mockProblems.length + 1,
        nameId,
        title: currentProblem.title,
        allowedLanguages: currentProblem.allowedLanguages,
        createdAt: new Date().toISOString().split("T")[0],
        orgId: 1,
      };

      mockProblems.push(newProblem);

      toast({
        title: "Success!",
        description: "Problem saved successfully",
      });

      // Get orgId from URL
      const pathSegments = window.location.pathname.split("/");
      const orgId = pathSegments[1];

      // Redirect to problems page
      router.push(`/${orgId}/problems`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save problem",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex-1 p-6">
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleSaveProblem}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Save Problem
          </Button>
        </div>
        {/* <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            {problems.map((problem, index) => (
              <Button
                key={problem.id}
                variant={currentProblemIndex === index ? "default" : "outline"}
                onClick={() => setCurrentProblemIndex(index)}
                className="relative"
              >
                Problem {index + 1}
                {problems.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProblem(index);
                    }}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </Button>
            ))}
            <Button variant="outline" onClick={addNewProblem}>
              <Plus className="h-4 w-4 mr-2" /> Add Problem
            </Button>
          </div>

          <Button
            onClick={handleCreateContest}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Create Contest
          </Button>
        </div> */}

        <Tabs defaultValue="problem" className="w-full">
          <TabsList className="w-full bg-muted p-0 mb-6">
            <TabsTrigger
              value="problem"
              className="flex-1 bg-muted data-[state=active]:bg-muted-foreground/20"
            >
              Problem Statement
            </TabsTrigger>
            <TabsTrigger
              value="testcases"
              className="flex-1 bg-muted data-[state=active]:bg-muted-foreground/20"
            >
              Test Cases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="problem">
            <div className="space-y-4">
              <div>
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
                  placeholder="Enter problem code"
                  className="bg-muted border-border"
                />
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
                  Problem Title
                </label>
                <Input
                  id="title"
                  value={currentProblem.title}
                  onChange={(e) => updateProblemField("title", e.target.value)}
                  placeholder="Enter problem title"
                  className="bg-muted border-border"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium mb-1"
                >
                  Problem Description
                </label>
                <Textarea
                  id="description"
                  value={currentProblem.description}
                  onChange={(e) =>
                    updateProblemField("description", e.target.value)
                  }
                  placeholder="Enter problem description"
                  className="bg-muted border-border min-h-[200px]"
                />
              </div>

              <div>
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
                  placeholder="Enter allowed languages"
                  className="bg-muted border-border"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="testcases">
            <div className="space-y-4">
              {currentProblem.testCases.map((testCase, index) => (
                <div key={index} className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Test Case {index + 1}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestCase(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
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
                      className="bg-muted-foreground/20 border-border"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`output-${index}`}
                      className="block text-sm font-medium mb-1"
                    >
                      Expected Output
                    </label>
                    <Textarea
                      id={`output-${index}`}
                      value={testCase.output}
                      onChange={(e) =>
                        updateTestCase(index, "output", e.target.value)
                      }
                      placeholder="Enter expected output"
                      className="bg-muted-foreground/20 border-border"
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addTestCase} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Test Case
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
