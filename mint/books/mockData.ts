export interface Book {
  id?: number;
  name: string;
  author: string;
  pages: number;
  publicationDate: string;
  copiesAvailable: number;
}

export const mockBooks: Book[] = [
  {
    id: 1,
    name: "To Kill a Mockingbird",
    author: "Harper Lee",
    pages: 281,
    publicationDate: "1960-07-11",
    copiesAvailable: 5,
  },
  {
    id: 2,
    name: "1984",
    author: "George Orwell",
    pages: 328,
    publicationDate: "1949-06-08",
    copiesAvailable: 3,
  },
  {
    id: 3,
    name: "Pride and Prejudice",
    author: "Jane Austen",
    pages: 432,
    publicationDate: "1813-01-28",
    copiesAvailable: 7,
  },
  {
    id: 4,
    name: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    pages: 180,
    publicationDate: "1925-04-10",
    copiesAvailable: 4,
  },
  {
    id: 5,
    name: "Moby-Dick",
    author: "Herman Melville",
    pages: 635,
    publicationDate: "1851-10-18",
    copiesAvailable: 2,
  },
];
