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
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
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
    "cpp"
  );
  const [theme, setTheme] = useState<keyof typeof themes>("VS Code Dark");

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="rounded-lg min-h-[800px]"
    >
      <ResizablePanel
        defaultSize={40}
        minSize={30}
        className="h-[calc(100vh-8rem)]"
      >
        <div className="h-full flex flex-col border-r border-zinc-800">
          <div className="border-b border-zinc-800 px-2 py-3">
            <h2 className="text-lg font-medium text-zinc-100">Description</h2>
          </div>
          <div className="p-4 overflow-auto">
            <div className="space-y-4">
              <h1 className="text-xl font-bold text-zinc-100">
                2028. Find Missing Observations
              </h1>
              <p className="text-sm text-zinc-300">
                You have observations of n + m 6-sided dice rolls with each face
                numbered from 1 to 6...
              </p>
            </div>
          </div>
        </div>
      </ResizablePanel>
      <ResizableHandle className="w-2 bg-zinc-950 hover:bg-zinc-800 transition-colors" />
      <ResizablePanel
        defaultSize={60}
        minSize={30}
        className="h-[calc(100vh-8rem)]"
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 px-2 py-3">
            <div className="flex items-center space-x-2">
              <Select
                value={language}
                onValueChange={(value: typeof language) => setLanguage(value)}
              >
                <SelectTrigger className="h-8 w-32 bg-white text-black border-zinc-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cpp">C++</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={theme}
                onValueChange={(value: keyof typeof themes) => setTheme(value)}
              >
                <SelectTrigger className="h-8 w-24 bg-white text-black border-zinc-300">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {Object.keys(themes).map((themeName) => (
                    <SelectItem
                      key={themeName}
                      value={themeName as keyof typeof themes}
                    >
                      {themeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="text-black hover:text-zinc-100 hover:bg-zinc-800"
              >
                Run
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-black hover:text-zinc-100 hover:bg-zinc-800"
              >
                Submit
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden [&_.cm-editor]:h-full [&_.cm-scroller]:h-full [&_.cm-gutters]:bg-transparent">
            <CodeMirror
              value={code}
              onChange={setCode}
              theme={themes[theme]}
              extensions={extensions[language]}
              className="h-full"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: true,
                highlightSpecialChars: true,
                history: true,
                foldGutter: true,
                drawSelection: true,
                dropCursor: true,
                allowMultipleSelections: true,
                indentOnInput: true,
                syntaxHighlighting: true,
                bracketMatching: true,
                closeBrackets: true,
                autocompletion: true,
                rectangularSelection: true,
                crosshairCursor: true,
                highlightActiveLine: true,
                highlightSelectionMatches: true,
                closeBracketsKeymap: true,
                defaultKeymap: true,
                searchKeymap: true,
                historyKeymap: true,
                foldKeymap: true,
                completionKeymap: true,
                lintKeymap: true,
              }}
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
