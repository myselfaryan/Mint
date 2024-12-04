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
  cpp: `class Solution {
public:
    vector<int> missingRolls(vector<int>& rolls, int mean, int n) {
        // Your code here
    }
};`,
};

const extensions = {
  javascript: [javascript({ jsx: true })],
  python: [python()],
  cpp: [cpp()],
};

export function CodeEditor() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<"javascript" | "python" | "cpp">(
    "cpp",
  );
  const [theme, setTheme] = useState<keyof typeof themes>("VS Code Dark");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [output, setOutput] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);

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

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
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
          stdin: "",
          args: [],
          compile_timeout: 10000,
          run_timeout: 5000,
        }),
      });

      const result = await response.json();
      if (result.run?.output) {
        setOutput(result.run.output);
      } else if (result.compile?.output) {
        setOutput(result.compile.output);
      } else if (result.message) {
        setOutput(result.message);
      } else if (result.error) {
        setOutput(result.error);
      }
    } catch (error) {
      setOutput("Error executing code: " + (error as Error).message);
    } finally {
      setIsRunning(false);
    }
  };

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
                  2028. Find Missing Observations
                </h1>
                <p className="text-sm text-foreground">
                  You have observations of n + m 6-sided dice rolls with each
                  face numbered from 1 to 6...
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
                  <Select
                    value={language}
                    onValueChange={(value: "javascript" | "python" | "cpp") =>
                      setLanguage(value)
                    }
                  >
                    <SelectTrigger className="w-[180px] bg-background text-foreground border-border">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={theme}
                    onValueChange={(value: keyof typeof themes) =>
                      setTheme(value)
                    }
                  >
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
                    onClick={runCode}
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
              <div className="flex-1 overflow-hidden">
                <CodeMirror
                  value={code}
                  height="100%"
                  theme={themes[theme]}
                  extensions={extensions[language]}
                  onChange={(value) => setCode(value)}
                  className="h-full"
                />
              </div>
              <div className="h-[250px] border-t border-border">
                <div className="flex h-full">
                  <div className="flex-1 border-r border-border">
                    <div className="flex items-center px-4 py-2 border-b border-border bg-muted">
                      <h2 className="text-sm font-medium text-foreground">
                        Test Cases
                      </h2>
                    </div>
                    <div className="p-2 space-y-2 overflow-auto h-[calc(100%-36px)]">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2 py-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span className="text-sm text-foreground">
                            Case 1
                          </span>
                        </div>
                        <div className="bg-muted rounded p-2">
                          <div className="text-sm font-mono">
                            <span className="text-muted-foreground">x = </span>
                            <span className="text-foreground">121</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 px-2 py-1">
                          <div className="h-2 w-2 rounded-full bg-muted"></div>
                          <span className="text-sm text-foreground">
                            Case 2
                          </span>
                        </div>
                        <div className="bg-muted rounded p-2">
                          <div className="text-sm font-mono">
                            <span className="text-muted-foreground">x = </span>
                            <span className="text-foreground">-121</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center px-4 py-2 border-b border-border bg-muted">
                      <h2 className="text-sm font-medium text-foreground">
                        Test Results
                      </h2>
                    </div>
                    <div className="p-4 font-mono text-sm text-foreground overflow-auto h-[calc(100%-36px)]">
                      {output || "Run your code to see the test results..."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
