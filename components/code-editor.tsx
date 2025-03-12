"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Expand } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import {
  vscodeDark,
  materialDark,
  dracula,
  githubDark,
  androidstudio,
  atomone,
  sublime,
  okaidia,
} from "@uiw/codemirror-themes-all";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { mockProblems, Problem } from "@/app/[orgId]/problems/mockProblems";

const themes = {
  "VS Code Dark": vscodeDark,
  "Material Dark": materialDark,
  Dracula: dracula,
  "GitHub Dark": githubDark,
  "Android Studio": androidstudio,
  "Atom One": atomone,
  Sublime: sublime,
  Okaidia: okaidia,
} as const;

const defaultCode = {
  javascript: `function solution(nums, target) {
  // Your code here
  return [];
}`,
  python: `def solution(nums, target):
    # Your code here
    return []`,
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  
}`,
};

const extensions = {
  javascript: [javascript({ jsx: true })],
  python: [python()],
  cpp: [cpp()],
};

export interface CodeEditorProps {
  problem?: Problem | null;
}

interface TestCase {
  input: string;
  output: string;
}

interface TestCaseResult {
  output: string;
  success: boolean;
}

export function CodeEditor({ problem }: CodeEditorProps) {
  if (!problem) {
    return <div className="p-4">Loading problem...</div>;
  }
  // Editor state - manages the current code content
  const [code, setCode] = useState<string>(() => defaultCode["cpp"]);

  // Language state - controls the programming language selection
  const [language, setLanguage] = useState<"javascript" | "python" | "cpp">(
    "cpp",
  );

  // Theme state - manages the editor's visual theme
  const [theme, setTheme] = useState<keyof typeof themes>("VS Code Dark");

  // UI state - controls fullscreen mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Execution state - manages code running status and output
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  // Add this state to track test case results
  const [testCaseResults, setTestCaseResults] = useState<
    Record<number, TestCaseResult>
  >({});

  const languageVersions = {
    javascript: "18.15.0",
    python: "3.10.0",
    cpp: "10.2.0",
  };

  const languageAliases = {
    javascript: "node",
    python: "python",
    cpp: "cpp",
  };

  // Handle language change with state updates
  const handleLanguageChange = (
    newLanguage: "javascript" | "python" | "cpp",
  ) => {
    try {
      console.log(`Changing language to: ${newLanguage}`);
      setLanguage(newLanguage);
      // Reset code to default for new language
      setCode(defaultCode[newLanguage]);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  // Handle theme change with state updates
  const handleThemeChange = (newTheme: keyof typeof themes) => {
    try {
      console.log(`Changing theme to: ${newTheme}`);
      setTheme(newTheme);
    } catch (error) {
      console.error("Error changing theme:", error);
    }
  };

  const runCode = async (
    testCaseInput: string,
  ): Promise<{ success: boolean; output: string }> => {
    console.log("Starting code execution...");
    setIsRunning(true);
    setOutput("");
    setExecutionError(null);

    try {
      const response = await fetch("/api/code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: languageAliases[language],
          version: languageVersions[language],
          files: [
            {
              name:
                language === "javascript"
                  ? "index.js"
                  : language === "python"
                    ? "main.py"
                    : "main.cpp",
              content: code,
            },
          ],
          stdin: testCaseInput + "\n", // Add newline to input
          args: [],
          compile_timeout: 10000,
          run_timeout: 5000,
        }),
      });

      const result = await response.json();
      console.log("Code execution result:", result);

      if (result.run?.output) {
        return { success: true, output: result.run.output };
      } else if (result.compile?.output) {
        return { success: false, output: result.compile.output };
      } else if (result.message) {
        return { success: false, output: result.message };
      } else if (result.error) {
        const errorMsg = `Execution Error: ${result.error}`;
        console.error(errorMsg);
        return { success: false, output: errorMsg };
      }
      return { success: false, output: "Unknown error" };
    } catch (error) {
      const errorMsg = `Runtime Error: ${(error as Error).message}`;
      console.error("Code execution failed:", error);
      return { success: false, output: errorMsg };
    } finally {
      setIsRunning(false);
      console.log("Code execution completed");
    }
  };

  // Add this function to run a specific test case
  const runTestCase = async (testCase: TestCase, index: number) => {
    if (isRunning) return;

    const result = await runCode(testCase.input);

    // Update the results for this specific test case
    setTestCaseResults((prev) => ({
      ...prev,
      [index]: {
        output: result.output,
        success: result.output.trim() === testCase.output.trim(),
      },
    }));

    // Update the overall output summary
    const updatedResults = {
      ...testCaseResults,
      [index]: {
        output: result.output,
        success: result.output.trim() === testCase.output.trim(),
      },
    };

    const totalCases = problem.testCases?.length || 0;
    const passedCases = Object.values(updatedResults).filter(
      (r) => r.success,
    ).length;

    setOutput(`Passed ${passedCases} of ${totalCases} test cases`);
  };

  // Add a function to run all test cases
  const runAllTestCases = async () => {
    if (isRunning || !problem.testCases || problem.testCases.length === 0)
      return;

    setIsRunning(true);
    const newResults: Record<number, TestCaseResult> = {};
    let passedCount = 0;

    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      const result = await runCode(testCase.input);
      const isSuccess = result.output.trim() === testCase.output.trim();

      newResults[i] = {
        output: result.output,
        success: isSuccess,
      };

      if (isSuccess) passedCount++;
    }

    setTestCaseResults(newResults);
    setOutput(
      `Passed ${passedCount} of ${problem.testCases.length} test cases`,
    );
    setIsRunning(false);
  };

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        console.log("Entering fullscreen mode");
        document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        console.log("Exiting fullscreen mode");
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Fullscreen toggle failed:", error);
    }
  };

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal" className="min-h-screen">
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full flex flex-col border-r border-border">
            <div className="border-b border-border px-4 py-3 bg-muted">
              <h2 className="text-lg font-medium text-foreground">
                Description
              </h2>
            </div>
            <div className="p-4 overflow-auto">
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-foreground">
                  {problem?.title}
                </h1>
                <p className="text-sm text-foreground">
                  {problem?.description}
                </p>
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="w-2 bg-muted hover:bg-muted-foreground/20 transition-colors" />
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="border-b border-border p-2 bg-muted">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[180px] bg-background text-foreground border-border">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-[180px] bg-background text-foreground border-border">
                      <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      {Object.keys(themes).map((theme) => (
                        <SelectItem key={theme} value={theme}>
                          {theme}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="w-[100px] h-10 bg-background text-foreground hover:bg-muted-foreground/20 border-border"
                    onClick={runAllTestCases}
                    disabled={isRunning}
                  >
                    {isRunning ? "Running..." : "Run"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-[100px] h-10 bg-background text-foreground hover:bg-muted-foreground/20 border-border"
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-10 bg-background text-foreground hover:bg-muted-foreground/20 border-border"
                    onClick={toggleFullscreen}
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col">
              <ResizablePanelGroup direction="vertical" className="h-full">
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div className="h-full overflow-hidden">
                    <CodeMirror
                      value={code}
                      height="100%"
                      theme={themes[theme]}
                      extensions={extensions[language]}
                      onChange={(value) => setCode(value)}
                      className="h-full"
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle className="h-2 bg-muted hover:bg-muted-foreground/20 transition-colors" />
                <ResizablePanel defaultSize={30} minSize={20}>
                  <ResizablePanelGroup
                    direction="horizontal"
                    className="h-full border-t border-border"
                  >
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full flex flex-col border-r border-border">
                        <div className="flex items-center px-4 py-2 border-b border-border bg-muted">
                          <h2 className="text-sm font-medium text-foreground">
                            Test Cases
                          </h2>
                        </div>
                        <div className="p-2 space-y-2 overflow-auto flex-1">
                          {problem.testCases && problem.testCases.length > 0 ? (
                            problem.testCases.map((testCase, index) => (
                              <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between gap-2 px-2 py-1">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`h-2 w-2 rounded-full ${testCaseResults[index]?.success ? "bg-green-500" : testCaseResults[index] ? "bg-red-500" : "bg-muted"}`}
                                    ></div>
                                    <span className="text-sm text-foreground">
                                      Case {index + 1}
                                    </span>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => runTestCase(testCase, index)}
                                    disabled={isRunning}
                                    className="h-7 text-xs"
                                  >
                                    Run
                                  </Button>
                                </div>
                                <div className="space-y-1">
                                  <div className="bg-muted rounded p-2">
                                    <div className="text-xs text-muted-foreground mb-1">
                                      Input:
                                    </div>
                                    <div className="text-sm font-mono">
                                      <span className="text-foreground">
                                        {testCase.input}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="bg-muted rounded p-2">
                                    <div className="text-xs text-muted-foreground mb-1">
                                      Expected Output:
                                    </div>
                                    <div className="text-sm font-mono">
                                      <span className="text-foreground">
                                        {testCase.output}
                                      </span>
                                    </div>
                                  </div>
                                  {testCaseResults[index] && (
                                    <div className="bg-muted rounded p-2">
                                      <div className="text-xs text-muted-foreground mb-1">
                                        Output:
                                      </div>
                                      <div className="text-sm font-mono">
                                        <span
                                          className={`${testCaseResults[index]?.success ? "text-green-500" : "text-red-500"}`}
                                        >
                                          {testCaseResults[index]?.output}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-sm text-muted-foreground">
                              No test cases available
                            </div>
                          )}
                        </div>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle className="w-2 bg-muted hover:bg-muted-foreground/20 transition-colors" />
                    <ResizablePanel defaultSize={50} minSize={30}>
                      <div className="h-full flex flex-col">
                        <div className="flex items-center px-4 py-2 border-b border-border bg-muted">
                          <h2 className="text-sm font-medium text-foreground">
                            Test Results
                          </h2>
                        </div>
                        <div className="p-4 font-mono text-sm text-foreground overflow-auto flex-1">
                          {executionError ? (
                            <div className="text-red-500">{output}</div>
                          ) : (
                            <div>
                              {output ||
                                "Run your code to see the test results..."}
                            </div>
                          )}
                        </div>
                      </div>
                    </ResizablePanel>
                  </ResizablePanelGroup>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
