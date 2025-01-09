"use client";

// books-page.tsx
import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { GenericEditor, Field } from "@/mint/generic-editor";
import { bookSchema } from "@/mint/books/schema";
import { Book, mockBooks } from "@/mint/books/mockData";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { marked } from "marked";

const columns: ColumnDef<{ id: string | number } & Book>[] = [
  { header: "Name", accessorKey: "name" as const },
  { header: "Author", accessorKey: "author" as const },
  { header: "Book Type", accessorKey: "bookType" as const },
  { header: "Pages", accessorKey: "pages" as const },
  { header: "Publication Date", accessorKey: "publicationDate" as const },
  { header: "Copies Available", accessorKey: "copiesAvailable" as const },
];

const fields: Field[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "author", label: "Author", type: "text" },
  {
    name: "bookType",
    label: "Book Type",
    type: "select",
    options: [
      { value: "Fiction", label: "Fiction" },
      { value: "Non-Fiction", label: "Non-Fiction" },
    ],
  },
  { name: "pages", label: "Pages", type: "number" },
  { name: "publicationDate", label: "Publication Date", type: "date" },
  { name: "copiesAvailable", label: "Copies Available", type: "number" },
];

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  useEffect(() => {
    setBooks(mockBooks);
  }, []);

  const deleteBook = async (book: Book) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update the state after successful API call
      setBooks((prevBooks) => prevBooks.filter((b) => b.id !== book.id));
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const saveBook = async (book: Book) => {
    // Here you would typically make an API call to save the book
    if (selectedBook) {
      // Update existing book
      setBooks(books.map((b) => (b.id === book.id ? book : b)));
    } else {
      // Add new book
      setBooks([...books, { ...book, id: Date.now() }]);
    }
    setIsEditorOpen(false);
  };

  return (
    <>
      <div className="mt-6 my-4 mx-8">
        <Alert variant={"destructive"}>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            <div
              dangerouslySetInnerHTML={{
                __html: marked.parse(
                  "You are viewing **dummy data** in this page, because fetching from backend failed. This is because `ENABLE_MOCKING` is set to _true_ in the `.env` file.",
                ),
              }}
            />
          </AlertDescription>
        </Alert>
      </div>
      <GenericListing
        data={books}
        columns={columns}
        title="Books"
        searchableFields={["name", "author"]}
        onAdd={() => {
          setSelectedBook(null);
          setIsEditorOpen(true);
        }}
        onEdit={(book) => {
          setSelectedBook(book);
          setIsEditorOpen(true);
        }}
        onDelete={deleteBook}
      />

      <GenericEditor
        data={selectedBook}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={saveBook}
        schema={bookSchema}
        fields={fields}
        title="Book"
      />
    </>
  );
}
