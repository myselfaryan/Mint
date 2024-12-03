"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  User,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";

// Mock data for contests
const mockContests = [
  {
    id: "C001",
    name: "Algorithmic Challenge 2024",
    organiserId: "ORG001",
    organiserName: "TechCorp",
    duration: "48 hours",
  },
  {
    id: "C002",
    name: "Web Dev Hackathon",
    organiserId: "ORG002",
    organiserName: "CodeCraft Academy",
    duration: "24 hours",
  },
  {
    id: "C003",
    name: "Data Science Competition",
    organiserId: "ORG003",
    organiserName: "DataMinds Institute",
    duration: "72 hours",
  },
  {
    id: "C004",
    name: "Mobile App Innovation",
    organiserId: "ORG004",
    organiserName: "AppGenius",
    duration: "36 hours",
  },
  {
    id: "C005",
    name: "Cybersecurity CTF",
    organiserId: "ORG005",
    organiserName: "SecureNet",
    duration: "12 hours",
  },
];

export function ContestListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredContests = mockContests.filter(
    (contest) =>
      contest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contest.organiserId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contest.organiserName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleViewContest = (contestId: string) => {
    router.push(`/contest/&{id}`);
    console.log(`Viewing contest: ${contestId}`);
    // Implement view contest functionality here
  };

  const handleRemoveContest = (contestId: string) => {
    console.log(`Removing contest: ${contestId}`);
    // Implement remove contest functionality here
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">Contest List</span>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Contests</h1>
          <div className="flex gap-2 items-center">
            <Input
              placeholder="Search contests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
          </div>
          <Button onClick={() => router.push("/contest/create")}>
            Add New Contest
          </Button>
        </div>

        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contest ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Organiser ID</TableHead>
                <TableHead>Organiser Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContests.map((contest) => (
                <TableRow key={contest.id}>
                  <TableCell>{contest.id}</TableCell>
                  <TableCell className="font-medium">{contest.name}</TableCell>
                  <TableCell>{contest.organiserId}</TableCell>
                  <TableCell>{contest.organiserName}</TableCell>
                  <TableCell>{contest.duration}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewContest(contest.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveContest(contest.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
