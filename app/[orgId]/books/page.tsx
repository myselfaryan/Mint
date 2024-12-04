"use client";

// books-page.tsx
import { GenericListing, ColumnDef } from "@/mint/generic-listing";
import { GenericEditor, Field } from "@/mint/generic-editor";
import { bookSchema } from "@/mint/books/schema";
import { Book, mockBooks } from "@/mint/books/mockData";
import { useEffect, useState } from "react";

const columns: ColumnDef<{ id: string | number } & Book>[] = [
  { header: "Name", accessorKey: "name" as const },
  { header: "Author", accessorKey: "author" as const },
  { header: "Pages", accessorKey: "pages" as const },
  { header: "Publication Date", accessorKey: "publicationDate" as const },
  { header: "Copies Available", accessorKey: "copiesAvailable" as const },
];

const fields: Field[] = [
  { name: "name", label: "Name", type: "text" },
  { name: "author", label: "Author", type: "text" },
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

  const handleDelete = async (book: Book) => {
    // Here you would typically make an API call to delete the book
    // For now, we'll just simulate an API call
    console.log("Attempting to delete", book);
    await new Promise((resolve) => setTimeout(resolve, 500));
    // The actual state update will be handled by the GenericListing component
  };

  const handleSave = async (book: Book) => {
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
      <GenericListing
        data={books}
        setData={setBooks}
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
        onDelete={handleDelete}
      />

      <GenericEditor
        data={selectedBook}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSave}
        schema={bookSchema}
        fields={fields}
        title="Book"
      />
    </>
  );
}
