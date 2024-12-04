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
  Plus,
  Eye,
  Trash2,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const mockGroups = [
  { id: 1, name: "Code Wizards", participants: 15, contestsGiven: 7 },
  { id: 2, name: "Binary Bosses", participants: 12, contestsGiven: 5 },
  { id: 3, name: "Algo Aces", participants: 18, contestsGiven: 8 },
  { id: 4, name: "Data Dynamos", participants: 10, contestsGiven: 6 },
  { id: 5, name: "Syntax Savants", participants: 14, contestsGiven: 7 },
];

type SortKey = "name" | "participants" | "contestsGiven";

export function GroupsInfoPage() {
  const [groups, setGroups] = useState(mockGroups);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const router = useRouter();

  const handleSort = (key: SortKey) => {
    setSortOrder(sortKey === key && sortOrder === "asc" ? "desc" : "asc");
    setSortKey(key);
  };

  const sortedGroups = [...groups].sort((a, b) => {
    const comparison =
      a[sortKey] < b[sortKey] ? -1 : a[sortKey] > b[sortKey] ? 1 : 0;
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const filteredGroups = sortedGroups.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRemoveGroup = (id: number) => {
    setGroups(groups.filter((group) => group.id !== id));
  };

  const handleViewGroup = (id: number) => {
    router.push(`/groups/${id}`);
    console.log(`Viewing group with id: ${id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-background p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">Groups Information</span>
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Groups</h1>
          <Link href="/groups/new">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Group
            </Button>
          </Link>
        </header>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm bg-background text-foreground border border-foreground rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Table */}
        <div className="bg-background p-4  ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="cursor-pointer"
                >
                  Group Name
                  <ArrowUpDown className="h-4 w-4 inline ml-2" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("participants")}
                  className="cursor-pointer"
                >
                  Participants
                  <ArrowUpDown className="h-4 w-4 inline ml-2" />
                </TableHead>
                <TableHead
                  onClick={() => handleSort("contestsGiven")}
                  className="cursor-pointer"
                >
                  Contests Given
                  <ArrowUpDown className="h-4 w-4 inline ml-2" />
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <TableRow
                  key={group.id}
                  className="hover:bg-muted transition-colors"
                >
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell>{group.participants}</TableCell>
                  <TableCell>{group.contestsGiven}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="hover:bg-background"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-background text-foreground border-accent-default rounded-lg shadow-lg"
                      >
                        <DropdownMenuItem
                          onClick={() => handleViewGroup(group.id)}
                          className="hover:bg-foreground transition-colors"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveGroup(group.id)}
                          className="text-red-500 hover:bg-foreground transition-colors"
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
      </main>
    </div>
  );
}
