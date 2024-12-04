"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  Bell,
  User,
  Download,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
const mockUsers = [
  {
    id: "U001",
    name: "Alice Johnson",
    avatar: "/placeholder.svg?height=32&width=32",
    submissions: 15,
    pending: 2,
  },
  {
    id: "U002",
    name: "Bob Smith",
    avatar: "/placeholder.svg?height=32&width=32",
    submissions: 8,
    pending: 1,
  },
  {
    id: "U003",
    name: "Charlie Brown",
    avatar: "/placeholder.svg?height=32&width=32",
    submissions: 22,
    pending: 0,
  },
  {
    id: "U004",
    name: "Diana Ross",
    avatar: "/placeholder.svg?height=32&width=32",
    submissions: 5,
    pending: 3,
  },
  {
    id: "U005",
    name: "Ethan Hunt",
    avatar: "/placeholder.svg?height=32&width=32",
    submissions: 19,
    pending: 1,
  },
];

type SortField = "id" | "submissions" | "pending";
type SortOrder = "asc" | "desc";

export function UserListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const router = useRouter();

  const sortedAndFilteredUsers = useMemo(() => {
    return mockUsers
      .filter(
        (user) =>
          (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterStatus === "All" ||
            (filterStatus === "With Pending" && user.pending > 0) ||
            (filterStatus === "No Pending" && user.pending === 0)),
      )
      .sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [searchTerm, filterStatus, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleViewUser = (userId: string) => {
    router.push("/student");
    console.log(`Viewing user: ${userId}`);
    // Implement view user functionality here
  };

  const handleRemoveUser = (userId: string) => {
    console.log(`Removing user: ${userId}`);
    // Implement remove user functionality here
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="ml-2 h-4 w-4" />
    ) : (
      <ChevronDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-background p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold">User Management</span>
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
          <h1 className="text-2xl font-bold">User List</h1>
          <div className="flex space-x-2">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
            />
            <Select onValueChange={setFilterStatus} defaultValue={filterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Users</SelectItem>
                <SelectItem value="With Pending">With Pending</SelectItem>
                <SelectItem value="No Pending">No Pending</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/${id}/users/new">
              <Button variant="outline" size="lg">
                {/* <Download className="h-4 w-4" /> */}
                +Add User
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-background rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">User</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("id")}
                    className="font-semibold"
                  >
                    User ID
                    <SortIcon field="id" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("submissions")}
                    className="font-semibold"
                  >
                    Submissions
                    <SortIcon field="submissions" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("pending")}
                    className="font-semibold"
                  >
                    Pending
                    <SortIcon field="pending" />
                  </Button>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="flex items-center space-x-2">
                    {/* <Image
                      src={user.avatar}
                      alt={`${user.name}'s avatar`}
                      width={32}
                      height={32}
                      className="rounded-full"
                    /> */}
                    <span className="font-medium">{user.name}</span>
                  </TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.submissions}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium
                      ${user.pending > 0 ? "bg-yellow-800 text-yellow-200" : "bg-green-800 text-green-200"}`}
                    >
                      {user.pending}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewUser(user.id)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View user
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRemoveUser(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove user
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
