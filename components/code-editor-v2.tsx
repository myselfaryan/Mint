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
import {
  Expand,
  Play,
  Send,
  Loader2,
  Minimize2,
  CheckCircle,
  XCircle,
  Circle,
} from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
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
import { Problem } from "@/app/[orgId]/problems/mockProblems";
import Markdown from "react-markdown";
import { SubmissionStatusDisplay } from "@/components/submission-status";
import { useCodeSubmission } from "@/hooks/useSubmissionStream";
import {
  LANGUAGE_CONFIGS,
  SupportedLanguage,
} from "@/lib/code-execution/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

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

// Language extensions for CodeMirror
const extensions = {
  javascript: [javascript({ jsx: true })],
  node: [javascript({ jsx: true })],
  python: [python()],
  cpp: [cpp()],
  java: [java()],
};

export interface CodeEditorProps {
  problem?: Problem | null;
}

interface TestCase {
  input: string;
  output: string;
}

interface LocalTestCaseResult {
  output: string;
  success: boolean;
}

export function CodeEditorV2({ problem }: CodeEditorProps) {
  // Use the real-time submission hook
  const { submit, isSubmitting, submitError, stream } = useCodeSubmission();

  // Editor state
  const [code, setCode] = useState<string>(
    () => LANGUAGE_CONFIGS["cpp"].defaultCode,
  );
  const [language, setLanguage] = useState<SupportedLanguage>("cpp");
  const [theme, setTheme] = useState<keyof typeof themes>("VS Code Dark");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Local test execution state
  const [localOutput, setLocalOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [localTestResults, setLocalTestResults] = useState<
    Record<number, LocalTestCaseResult>
  >({});

  // Active tab state
  const [activeTab, setActiveTab] = useState<"testcases" | "submission">(
    "testcases",
  );

  if (!problem) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle language change
  const handleLanguageChange = (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    setCode(LANGUAGE_CONFIGS[newLanguage].defaultCode);
  };

  // Handle theme change
  const handleThemeChange = (newTheme: keyof typeof themes) => {
    setTheme(newTheme);
  };

  // Execute code locally (for testing)
  const runCode = async (
    testCaseInput: string,
  ): Promise<{ success: boolean; output: string }> => {
    setIsRunning(true);
    setLocalOutput("");

    try {
      const response = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          stdin: testCaseInput,
          timeLimit: 5,
          memoryLimit: 128000,
        }),
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, output: result.output };
      } else {
        return {
          success: false,
          output:
            result.stderr || result.compileOutput || result.error || "Error",
        };
      }
    } catch (error) {
      return {
        success: false,
        output: `Error: ${(error as Error).message}`,
      };
    } finally {
      setIsRunning(false);
    }
  };

  // Run a single test case
  const runTestCase = async (testCase: TestCase, index: number) => {
    if (isRunning) return;

    const result = await runCode(testCase.input);

    setLocalTestResults((prev) => ({
      ...prev,
      [index]: {
        output: result.output,
        success: result.output.trim() === testCase.output.trim(),
      },
    }));

    setLocalOutput(
      result.success
        ? `Test ${index + 1}: ${result.output.trim() === testCase.output.trim() ? "✓ Passed" : "✗ Failed"}`
        : `Test ${index + 1}: ${result.output}`,
    );
  };

  // Run all test cases locally
  const runAllTestCases = async () => {
    if (isRunning || !problem.testCases?.length) return;

    setIsRunning(true);
    const newResults: Record<number, LocalTestCaseResult> = {};
    let passedCount = 0;

    for (let i = 0; i < problem.testCases.length; i++) {
      const testCase = problem.testCases[i];
      const result = await runCode(testCase.input);
      const isSuccess = result.output.trim() === testCase.output.trim();

      newResults[i] = { output: result.output, success: isSuccess };
      if (isSuccess) passedCount++;
    }

    setLocalTestResults(newResults);
    setLocalOutput(
      `Passed ${passedCount} of ${problem.testCases.length} test cases`,
    );
    setIsRunning(false);
  };

  // Submit for official judging
  const handleSubmit = async () => {
    if (isSubmitting || !problem) return;

    // Switch to submission tab
    setActiveTab("submission");

    try {
      await submit(code, language, problem.id, {
        contestNameId: problem.contestNameId,
        orgId: problem.orgNameId || String(problem.orgId),
      });
    } catch (error) {
      console.error("Submission error:", error);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-background">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Problem Description Panel */}
        <ResizablePanel defaultSize={35} minSize={25}>
          <div className="h-full flex flex-col bg-background border-r border-border">
            {/* Header */}
            <div className="border-b border-border px-4 py-3 bg-card">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="text-primary">📝</span> Description
              </h2>
            </div>

            {/* Problem Content */}
            <div className="p-5 overflow-auto flex-1">
              <div className="space-y-4">
                {/* Custom styled markdown that matches the warm theme */}
                <div className="problem-markdown">
                  <Markdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-foreground mt-6 mb-3">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-primary mt-5 mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-semibold text-foreground mt-4 mb-2">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-muted-foreground leading-relaxed mb-3">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-muted-foreground mb-3 space-y-1 ml-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-muted-foreground mb-3 space-y-1 ml-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-muted-foreground">{children}</li>
                      ),
                      code: ({ children, className }) => {
                        const isBlock = className?.includes("language-");
                        return isBlock ? (
                          <code className="text-foreground">{children}</code>
                        ) : (
                          <code className="bg-muted text-primary px-1.5 py-0.5 rounded text-sm font-mono">
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-card border border-border p-4 rounded-lg overflow-x-auto my-3 font-mono text-sm text-foreground">
                          {children}
                        </pre>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-foreground font-semibold">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="text-muted-foreground italic">
                          {children}
                        </em>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary pl-4 my-3 text-muted-foreground italic bg-muted/30 py-2 rounded-r">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {problem?.description}
                  </Markdown>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="w-1.5 bg-border hover:bg-primary transition-colors" />

        {/* Editor Panel */}
        <ResizablePanel defaultSize={65} minSize={35}>
          <div className="h-full flex flex-col bg-background">
            {/* Toolbar */}
            <div className="border-b border-border p-2 bg-card">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {/* Language Selector */}
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[130px] bg-background border-border">
                      <SelectValue placeholder="Language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cpp">C++</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Theme Selector */}
                  <Select value={theme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="w-[140px] bg-background border-border">
                      <SelectValue placeholder="Theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(themes).map((themeName) => (
                        <SelectItem key={themeName} value={themeName}>
                          {themeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  {/* Run Button */}
                  <Button
                    variant="outline"
                    onClick={runAllTestCases}
                    disabled={isRunning || isSubmitting}
                  >
                    {isRunning ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Run
                  </Button>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={isRunning || isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit
                  </Button>

                  {/* Fullscreen Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Expand className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Code Editor and Results */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <ResizablePanelGroup direction="vertical" className="h-full">
                {/* Code Editor */}
                <ResizablePanel defaultSize={60} minSize={30}>
                  <div className="h-full overflow-hidden">
                    <CodeMirror
                      value={code}
                      height="100%"
                      theme={themes[theme]}
                      extensions={extensions[language] || extensions.cpp}
                      onChange={(value) => setCode(value)}
                      className="h-full text-sm"
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle className="h-1.5 bg-border hover:bg-primary transition-colors" />

                {/* Results Panel */}
                <ResizablePanel defaultSize={40} minSize={20}>
                  <div className="h-full bg-background border-t border-border">
                    <Tabs
                      value={activeTab}
                      onValueChange={(v) =>
                        setActiveTab(v as "testcases" | "submission")
                      }
                      className="h-full flex flex-col"
                    >
                      <TabsList className="w-full justify-start rounded-none border-b border-border bg-card px-2 h-10">
                        <TabsTrigger value="testcases" className="text-sm px-4">
                          Test Cases
                        </TabsTrigger>
                        <TabsTrigger
                          value="submission"
                          className="text-sm px-4 flex items-center gap-2"
                        >
                          Submission
                          {stream.isConnected && (
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          )}
                        </TabsTrigger>
                      </TabsList>

                      {/* Test Cases Tab */}
                      <TabsContent
                        value="testcases"
                        className="flex-1 overflow-hidden m-0"
                      >
                        <ResizablePanelGroup direction="horizontal">
                          {/* Test Case List */}
                          <ResizablePanel
                            defaultSize={50}
                            className="overflow-auto"
                          >
                            <div className="h-full flex flex-col border-r border-border">
                              <div className="flex items-center px-4 py-2 border-b border-border bg-card">
                                <h2 className="text-sm font-medium text-foreground">
                                  Test Cases
                                </h2>
                              </div>
                              <div className="p-3 space-y-3 overflow-auto flex-1">
                                {problem.testCases?.length ? (
                                  problem.testCases.map((testCase, index) => (
                                    <div
                                      key={index}
                                      className="bg-card rounded-lg p-3 border border-border"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                          {localTestResults[index]?.success ? (
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                          ) : localTestResults[index] ? (
                                            <XCircle className="h-4 w-4 text-red-500" />
                                          ) : (
                                            <Circle className="h-4 w-4 text-muted-foreground" />
                                          )}
                                          <span className="text-sm font-medium text-foreground">
                                            Case {index + 1}
                                          </span>
                                        </div>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            runTestCase(testCase, index)
                                          }
                                          disabled={isRunning}
                                          className="h-7 text-xs"
                                        >
                                          Run
                                        </Button>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="bg-muted rounded p-2">
                                          <div className="text-xs text-muted-foreground mb-1">
                                            Input:
                                          </div>
                                          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                                            {testCase.input}
                                          </pre>
                                        </div>
                                        <div className="bg-muted rounded p-2">
                                          <div className="text-xs text-muted-foreground mb-1">
                                            Expected:
                                          </div>
                                          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">
                                            {testCase.output}
                                          </pre>
                                        </div>
                                        {localTestResults[index] && (
                                          <div
                                            className={cn(
                                              "rounded p-2",
                                              localTestResults[index].success
                                                ? "bg-green-500/10 border border-green-500/30"
                                                : "bg-red-500/10 border border-red-500/30",
                                            )}
                                          >
                                            <div className="text-xs text-muted-foreground mb-1">
                                              Your Output:
                                            </div>
                                            <pre
                                              className={cn(
                                                "text-sm font-mono whitespace-pre-wrap",
                                                localTestResults[index].success
                                                  ? "text-green-600"
                                                  : "text-red-600",
                                              )}
                                            >
                                              {localTestResults[index].output}
                                            </pre>
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

                          <ResizableHandle className="w-1.5 bg-border hover:bg-primary transition-colors" />

                          {/* Output Panel */}
                          <ResizablePanel
                            defaultSize={50}
                            className="overflow-auto"
                          >
                            <div className="h-full flex flex-col">
                              <div className="flex items-center px-4 py-2 border-b border-border bg-card">
                                <h2 className="text-sm font-medium text-foreground">
                                  Console Output
                                </h2>
                              </div>
                              <div className="p-4 font-mono text-sm overflow-auto flex-1">
                                {localOutput ? (
                                  <pre className="text-foreground">
                                    {localOutput}
                                  </pre>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Run your code to see output...
                                  </span>
                                )}
                              </div>
                            </div>
                          </ResizablePanel>
                        </ResizablePanelGroup>
                      </TabsContent>

                      {/* Submission Tab */}
                      <TabsContent
                        value="submission"
                        className="flex-1 overflow-auto m-0 p-4"
                      >
                        {stream.submissionId ? (
                          <SubmissionStatusDisplay
                            status={stream.status}
                            testCaseResults={stream.testCaseResults}
                            passedCount={stream.passedCount}
                            totalCount={stream.totalCount}
                            executionTime={stream.executionTime}
                            memoryUsed={stream.memoryUsed}
                            currentTestCase={stream.currentTestCase}
                            error={stream.error || submitError}
                            isConnected={stream.isConnected}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <Send className="w-12 h-12 mb-4 opacity-30" />
                            <p className="text-lg">
                              Submit your code to see results
                            </p>
                            <p className="text-sm mt-2">
                              Your submission will be tested against all test
                              cases
                            </p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
