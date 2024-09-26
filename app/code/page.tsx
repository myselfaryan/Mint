"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import js from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import cpp from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  AlarmClock,
  Copy,
  Settings,
  Timer,
  User,
  Tag,
  Building,
  HelpCircle,
} from "lucide-react";

SyntaxHighlighter.registerLanguage("javascript", js);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("cpp", cpp);

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

export default function Component() {
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState(defaultCode.cpp);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.contentEditable = "true";
    }
  }, []);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    setCode(defaultCode[newLanguage]);
  };

  const handleCodeChange = (e) => {
    setCode(e.target.textContent);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span>Daily Question</span>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Expand className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <AlarmClock className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Timer className="h-4 w-4" />
          </Button>
          <span>0</span>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
          <span className="text-yellow-500">Premium</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-1/2 p-4 overflow-y-auto border-r border-gray-700">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full bg-gray-800 p-0 mb-4">
              <TabsTrigger
                value="description"
                className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="editorial"
                className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
              >
                Editorial
              </TabsTrigger>
              <TabsTrigger
                value="solutions"
                className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
              >
                Solutions
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
              >
                Submissions
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <h1 className="text-2xl font-bold mb-4">
                2028. Find Missing Observations
              </h1>
              <div className="flex space-x-2 mb-4">
                <span className="bg-yellow-800 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium">
                  Medium
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs px-3 py-1 h-auto bg-gray-700"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  Topics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs px-3 py-1 h-auto bg-gray-700"
                >
                  <Building className="h-3 w-3 mr-1" />
                  Companies
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full text-xs px-3 py-1 h-auto bg-gray-700"
                >
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Hint
                </Button>
              </div>
              <div className="prose prose-invert max-w-none">
                <p>
                  You have observations of n + m 6-sided dice rolls with each
                  face numbered from 1 to 6. n of the observations went missing,
                  and you only have the observations of m rolls. Fortunately,
                  you have also calculated the average value of the n + m rolls.
                </p>
                <p>
                  You are given an integer array rolls of length m where
                  rolls[i] is the value of the ith observation. You are also
                  given the two integers mean and n.
                </p>
                <p>
                  Return an array of length n containing the missing
                  observations such that the average value of the n + m rolls is
                  exactly mean. If there are multiple valid answers, return any
                  of them. If no such array exists, return an empty array.
                </p>
                <p>
                  The average value of a set of k numbers is the sum of the
                  numbers divided by k.
                </p>
                <p>
                  Note that mean is an integer, so the sum of the n + m rolls
                  should be divisible by n + m.
                </p>
                {/* Add more problem description here */}
              </div>
            </TabsContent>
            {/* Add content for other tabs */}
          </Tabs>
        </div>

        {/* Right Panel */}
        <div className="w-1/2 flex flex-col">
          <Tabs defaultValue="code" className="flex-1">
            <TabsList className="w-full bg-gray-800 p-0">
              <TabsTrigger
                value="code"
                className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
              >
                Code
              </TabsTrigger>
              <TabsTrigger
                value="note"
                className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
              >
                Note
              </TabsTrigger>
              <TabsTrigger
                value="testcase"
                className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
              >
                Testcase
              </TabsTrigger>
              <TabsTrigger
                value="testresult"
                className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
              >
                Test Result
              </TabsTrigger>
            </TabsList>
            <TabsContent value="code" className="flex-1 overflow-hidden">
              <div className="flex items-center justify-between p-2 bg-gray-800">
                <Select onValueChange={handleLanguageChange} value={language}>
                  <SelectTrigger className="w-[180px] bg-gray-800">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800">
                    <SelectItem className="bg-gray-800" value="cpp">
                      C++
                    </SelectItem>
                    <SelectItem className="bg-gray-800" value="javascript">
                      JavaScript
                    </SelectItem>
                    <SelectItem className="bg-gray-800" value="python">
                      Python
                    </SelectItem>
                  </SelectContent>
                </Select>
                <span>Auto</span>
              </div>
              <div className="relative flex-1">
                <SyntaxHighlighter
                  language={language}
                  style={atomOneDark}
                  customStyle={{
                    margin: 0,
                    padding: "1rem",
                    height: "100%",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    fontFamily: '"Fira Code", monospace',
                  }}
                >
                  {code}
                </SyntaxHighlighter>
                <div
                  ref={editorRef}
                  onInput={handleCodeChange}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: "1rem",
                    fontFamily: '"Fira Code", monospace',
                    fontSize: "14px",
                    lineHeight: "1.5",
                    color: "transparent",
                    caretColor: "white",
                    whiteSpace: "pre-wrap",
                    overflow: "auto",
                    background: "transparent",
                  }}
                  aria-label="Code editor"
                />
              </div>
            </TabsContent>
            {/* Add content for other tabs */}
          </Tabs>
          <div className="p-4 bg-gray-800 flex justify-end space-x-4">
            <Button className="bg-gray-800" variant="outline">
              Run
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">Submit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
