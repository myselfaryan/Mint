"use client";

import { useState, useMemo } from "react";
import { Book, mockBooks } from "./mockData";
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
} from "lucide-react";
import { BookEditor } from "./editor";
import { DeleteConfirmationModal } from "@/mint/delete-confirm";
import { Toast, ToastType } from "@/mint/toast";
import { BookSchema } from "./schema";

type SortField = keyof Book;
type SortOrder = "asc" | "desc";

export default function LibraryBookListing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [books, setBooks] = useState(mockBooks);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [toast, setToast] = useState<{
    type: ToastType;
    message: string;
  } | null>(null);

  const filteredAndSortedBooks = useMemo(() => {
    return books
      .filter(
        (book) =>
          book.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
  }, [books, searchTerm, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const downloadCSV = () => {
    const headers = [
      "Book Name",
      "Author",
      "Pages",
      "Publication Date",
      "Copies Available",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedBooks.map((book) =>
        [
          book.name,
          book.author,
          book.pages,
          book.publicationDate,
          book.copiesAvailable,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "library_books.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const addNewBook = () => {
    setSelectedBook(null);
    setIsEditorOpen(true);
  };

  const editBook = (book: Book) => {
    setSelectedBook(book);
    setIsEditorOpen(true);
  };

  const confirmDelete = (book: Book) => {
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const deleteBook = () => {
    if (bookToDelete) {
      setBooks(books.filter((book) => book.id !== bookToDelete.id));
      setIsDeleteModalOpen(false);
      setBookToDelete(null);
      setToast({
        type: ToastType.SUCCESS,
        message: `"${bookToDelete.name}" has been deleted successfully.`,
      });
    }
  };

  const handleSaveBook = (savedBook: BookSchema) => {
    if (selectedBook) {
      setBooks(
        books.map((book) => (book.id === savedBook.id ? savedBook : book)),
      );
      setToast({
        type: ToastType.SUCCESS,
        message: `"${savedBook.name}" has been updated successfully.`,
      });
    } else {
      setBooks([...books, savedBook]);
      setToast({
        type: ToastType.SUCCESS,
        message: `"${savedBook.name}" has been added successfully.`,
      });
    }
    setIsEditorOpen(false);
  };

  const closeToast = () => {
    setToast(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Library Book Listing</h1>
      <div className="flex gap-4 mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by book name or author"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        <Button onClick={addNewBook}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Book
        </Button>
        <Button onClick={downloadCSV}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>
      <Table className="border border-gray-200 rounded-lg overflow-hidden">
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("name")}>
                Book Name <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("author")}>
                Author <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort("pages")}>
                Pages <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("publicationDate")}
              >
                Publication Date <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort("copiesAvailable")}
              >
                Copies Available <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedBooks.map((book) => (
            <TableRow key={book.id}>
              <TableCell>{book.name}</TableCell>
              <TableCell>{book.author}</TableCell>
              <TableCell>{book.pages}</TableCell>
              <TableCell>
                {new Date(book.publicationDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{book.copiesAvailable}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => editBook(book)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => confirmDelete(book)}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <BookEditor
        book={isEditorOpen && !selectedBook ? null : selectedBook}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveBook}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteBook}
        itemName={bookToDelete?.name || ""}
      />
      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={closeToast} />
      )}
    </div>
  );
}
