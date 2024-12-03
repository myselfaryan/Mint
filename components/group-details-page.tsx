"use client";

import { useState } from "react";
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
  Users,
  FileText,
  CheckCircle,
  Clock,
  ArrowUpDown,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Mock data for group statistics
const groupStats = {
  totalMembers: 25,
  totalContestsGiven: 15,
  totalSubmissions: 350,
  pendingSubmissions: 42,
};

// Mock data for group participants
const mockParticipants = [
  { id: "P001", name: "Alice Johnson", submissions: 28, pending: 2 },
  { id: "P002", name: "Bob Smith", submissions: 22, pending: 1 },
  { id: "P003", name: "Charlie Brown", submissions: 30, pending: 0 },
  { id: "P004", name: "Diana Ross", submissions: 18, pending: 3 },
  { id: "P005", name: "Ethan Hunt", submissions: 25, pending: 1 },
];

type SortKey = "id" | "pending";

export function GroupDetailPage() {
  const [participants, setParticipants] = useState(mockParticipants);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const router = useRouter();
  const handleRemoveParticipant = (id: string) => {
    setParticipants(
      participants.filter((participant) => participant.id !== id),
    );
  };

  const handleViewParticipant = (id: string) => {
    // Implement view functionality
    router.push("/student");
    console.log(`Viewing participant with id: ${id}`);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedParticipants = [...participants].sort((a, b) => {
    if (a[sortKey] < b[sortKey]) return sortOrder === "asc" ? -1 : 1;
    if (a[sortKey] > b[sortKey]) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const filteredParticipants = sortedParticipants.filter((participant) =>
    participant.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">Group: Code Wizards</span>
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
        {/* Statistic Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Members</p>
              <p className="text-xl font-bold">{groupStats.totalMembers}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Contests Given</p>
              <p className="text-xl font-bold">
                {groupStats.totalContestsGiven}
              </p>
            </div>
            <FileText className="h-8 w-8 text-green-400" />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Submissions</p>
              <p className="text-xl font-bold">{groupStats.totalSubmissions}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-yellow-400" />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Pending Submissions</p>
              <p className="text-xl font-bold">
                {groupStats.pendingSubmissions}
              </p>
            </div>
            <Clock className="h-8 w-8 text-red-400" />
          </div>
        </div>

        {/* Participants Table */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Participants</h2>
            <Input
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm bg-gray-700 text-gray-300 border-gray-600"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  ID
                  <ArrowUpDown className="h-4 w-4 inline ml-2" />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("pending")}
                >
                  Pending
                  <ArrowUpDown className="h-4 w-4 inline ml-2" />
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParticipants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.id}</TableCell>
                  <TableCell>{participant.name}</TableCell>
                  <TableCell>{participant.submissions}</TableCell>
                  <TableCell>{participant.pending}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-gray-800 text-gray-300 border-gray-700"
                      >
                        <DropdownMenuItem
                          onClick={() => handleViewParticipant(participant.id)}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleRemoveParticipant(participant.id)
                          }
                          className="cursor-pointer text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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
