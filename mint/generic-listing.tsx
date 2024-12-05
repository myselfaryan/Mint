"use client";

import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpDown,
  Search,
  Download,
  PlusCircle,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import { DeleteConfirmationModal } from "@/mint/delete-confirm";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T;
  sortable?: boolean;
}

interface GenericListingProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  title: string;
  searchableFields: (keyof T)[];
  onAdd?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => Promise<void>;
  allowDownload?: boolean;
  addPage?: string;
  rowClickAttr?: keyof T; // attribute to use for navigation when row is clicked
  editPathAttr?: keyof T; // attribute containing the edit path for navigation
}

// For passing to listing, the id should not be null, its just a temporary hack to satisfy typescript
export function GenericListing<T extends { id: number | undefined }>({
  data,
  columns,
  title,
  searchableFields,
  onAdd,
  onEdit,
  onDelete,
  allowDownload = true,
  addPage,
  rowClickAttr,
  editPathAttr,
}: GenericListingProps<T>) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof T>(columns[0].accessorKey);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);
  const { toast } = useToast();
  const filteredAndSortedData = useMemo(() => {
    return data
      .filter((item) =>
        searchableFields.some((field) =>
          String(item[field]).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      )
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [data, searchTerm, sortField, sortOrder, searchableFields]);

  const handleSort = (field: keyof T) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const downloadCSV = () => {
    const headers = columns.map((col) => col.header);
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedData.map((item) =>
        columns.map((col) => item[col.accessorKey]).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `data_export_${title}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = (item: T) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete && onDelete) {
      try {
        // First close the modal
        setIsDeleteModalOpen(false);
        setItemToDelete(null);

        // Then perform the delete operation
        await onDelete(itemToDelete);

        // Show success toast
        toast({
          title: "Success",
          description: `Item has been deleted successfully.`,
        });
      } catch (error) {
        // Show error toast
        toast({
          title: "Failed to delete item",
          description: `Error happened ${error instanceof Error ? error.message : "Unknown error"}`,
        });
        console.log(error);
      }
    }
  };

  return (
    <div className="px-6 py-2 space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          <div className="relative w-full">
            <Search className="absolute left-2 top-1/2 h-8 w-5 -translate-y-1/2 text-muted-foreground " />
            <Input
              placeholder={`Search ${title} by ${searchableFields.join(", ")} `}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-8 md:w-[300px] lg:w-[400px]"
            />
          </div>

          {(onAdd || addPage) && (
            <Button
              size="default"
              onClick={() => {
                if (addPage) {
                  // Use window.location for client-side navigation
                  window.location.href =
                    window.location.pathname + "/" + addPage;
                } else if (onAdd) {
                  onAdd();
                }
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New {title}
            </Button>
          )}
          {allowDownload && (
            <Button size="default" onClick={downloadCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.accessorKey)}>
                  {column.sortable !== false ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="-ml-4"
                      onClick={() => handleSort(column.accessorKey)}
                    >
                      {column.header}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    column.header
                  )}
                </TableHead>
              ))}
              {(onEdit || onDelete || editPathAttr) && (
                <TableHead>Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={
                    columns.length +
                    (onEdit || onDelete || editPathAttr ? 1 : 0)
                  }
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((item) => (
                <TableRow key={String(item.id)}>
                  {columns.map((column, index) => (
                    <TableCell
                      key={String(column.accessorKey)}
                      className={
                        index === 0 && rowClickAttr ? "hover:bg-muted/50" : ""
                      }
                      onClick={() => {
                        if (index === 0 && rowClickAttr && item[rowClickAttr]) {
                          router.push(
                            `${window.location.pathname}/${String(item[rowClickAttr])}`,
                          );
                        }
                      }}
                    >
                      {String(item[column.accessorKey])}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || editPathAttr) && (
                    <TableCell>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              navigator.clipboard.writeText(String(item.id));
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy ID
                          </DropdownMenuItem>
                          {(onEdit || editPathAttr) && (
                            <DropdownMenuItem
                              onClick={() => {
                                if (onEdit) {
                                  onEdit(item);
                                } else if (editPathAttr && item[editPathAttr]) {
                                  router.push(
                                    `${window.location.pathname}/${String(item[editPathAttr])}`,
                                  );
                                }
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => confirmDelete(item)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {isDeleteModalOpen && itemToDelete && (
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          onConfirm={handleDelete}
          itemName={String(itemToDelete.id)}
        />
      )}
    </div>
  );
}
