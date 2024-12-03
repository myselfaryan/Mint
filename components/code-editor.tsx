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
  const [language, setLanguage] = useState<"javascript" | "python" | "cpp">("cpp");
  const [theme, setTheme] = useState<keyof typeof themes>("VS Code Dark");
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    <div className="h-screen bg-gray-900">
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-screen"
      >
        <ResizablePanel
          defaultSize={40}
          minSize={30}
        >
          <div className="h-full flex flex-col border-r border-gray-800">
            <div className="border-b border-gray-800 px-4 py-3 bg-gray-800">
              <h2 className="text-lg font-medium text-gray-300">Description</h2>
            </div>
            <div className="p-4 overflow-auto">
              <div className="space-y-4">
                <h1 className="text-xl font-bold text-gray-300">
                  2028. Find Missing Observations
                </h1>
                <p className="text-sm text-gray-300">
                  You have observations of n + m 6-sided dice rolls with each face
                  numbered from 1 to 6...
                </p>
              </div>
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle className="w-2 bg-gray-800 hover:bg-gray-700 transition-colors" />
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="border-b border-gray-800 p-2 bg-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <Select
                    value={language}
                    onValueChange={(value: "javascript" | "python" | "cpp") =>
                      setLanguage(value)
                    }
                  >
                    <SelectTrigger className="w-[180px] bg-gray-900 text-gray-300 border-gray-700">
                      <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={theme}
                    onValueChange={(value: keyof typeof themes) => setTheme(value)}
                  >
                    <SelectTrigger className="w-[180px] bg-gray-900 text-gray-300 border-gray-700">
                      <SelectValue placeholder="Select Theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
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
                    className="w-[100px] h-10 bg-gray-900 text-gray-300 hover:bg-gray-700 border-gray-700"
                  >
                    Run
                  </Button>
                  <Button
                    variant="outline"
                    className="w-[100px] h-10 bg-gray-900 text-gray-300 hover:bg-gray-700 border-gray-700"
                  >
                    Submit
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon"
                    className="h-10 bg-gray-900 text-gray-300 hover:bg-gray-700 border-gray-700"
                    onClick={toggleFullscreen}
                  >
                    <Expand className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <CodeMirror
                value={defaultCode[language]}
                height="100%"
                theme={themes[theme]}
                extensions={extensions[language]}
                onChange={(value) => setCode(value)}
                className="h-full"
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
