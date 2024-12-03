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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  Filter,
  Download,
} from "lucide-react";

const mockSubmissions = [
  {
    id: 1,
    student: "Alice Johnson",
    assignment: "Two Sum",
    status: "Passed",
    score: 100,
    submittedAt: "2024-09-06 14:30",
  },
  {
    id: 2,
    student: "Bob Smith",
    assignment: "Reverse String",
    status: "Failed",
    score: 60,
    submittedAt: "2024-09-06 15:45",
  },
  {
    id: 3,
    student: "Charlie Brown",
    assignment: "Binary Search",
    status: "Passed",
    score: 95,
    submittedAt: "2024-09-06 16:20",
  },
  {
    id: 4,
    student: "Diana Ross",
    assignment: "Two Sum",
    status: "Pending",
    score: null,
    submittedAt: "2024-09-06 17:10",
  },
  {
    id: 5,
    student: "Ethan Hunt",
    assignment: "Reverse String",
    status: "Passed",
    score: 90,
    submittedAt: "2024-09-06 18:05",
  },
];

export function TeacherDashboard() {
  const [selectedAssignment, setSelectedAssignment] = useState("All");

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">Teacher Dashboard</span>
          <Button variant="ghost" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="submissions" className="w-full">
          <TabsList className="w-full bg-gray-800 p-0 mb-6">
            <TabsTrigger
              value="submissions"
              className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
            >
              Submissions
            </TabsTrigger>
            <TabsTrigger
              value="students"
              className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
            >
              Students
            </TabsTrigger>
            <TabsTrigger
              value="assignments"
              className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
            >
              Assignments
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700"
            >
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="submissions">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Submissions</h2>
              <div className="flex space-x-2">
                <Select
                  onValueChange={setSelectedAssignment}
                  value={selectedAssignment}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Assignment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Assignments</SelectItem>
                    <SelectItem value="Two Sum">Two Sum</SelectItem>
                    <SelectItem value="Reverse String">
                      Reverse String
                    </SelectItem>
                    <SelectItem value="Binary Search">Binary Search</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Submitted At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubmissions
                  .filter(
                    (sub) =>
                      selectedAssignment === "All" ||
                      sub.assignment === selectedAssignment,
                  )
                  .map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>{submission.student}</TableCell>
                      <TableCell>{submission.assignment}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium
                          ${
                            submission.status === "Passed"
                              ? "bg-green-800 text-green-200"
                              : submission.status === "Failed"
                                ? "bg-red-800 text-red-200"
                                : "bg-yellow-800 text-yellow-200"
                          }`}
                        >
                          {submission.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {submission.score !== null
                          ? `${submission.score}%`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{submission.submittedAt}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>
          {/* Add content for other tabs */}
        </Tabs>
      </div>
    </div>
  );
}
