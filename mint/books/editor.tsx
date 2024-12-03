"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Book } from "./mockData";
import { bookSchema, BookSchema } from "./schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

interface BookEditorProps {
  book: Book | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: Book) => void;
}

export function BookEditor({ book, isOpen, onClose, onSave }: BookEditorProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BookSchema>({
    resolver: zodResolver(bookSchema),
    defaultValues: book || {
      id: 0,
      name: "",
      author: "",
      pages: 0,
      publicationDate: "",
      copiesAvailable: 0,
    },
  });

  useEffect(() => {
    if (book) {
      reset(book);
    } else {
      reset({
        id: Date.now(),
        name: "",
        author: "",
        pages: 0,
        publicationDate: "",
        copiesAvailable: 0,
      });
    }
  }, [book, reset]);

  const onSubmit = (data: BookSchema) => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{book ? "Edit Book" : "Add New Book"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
                placeholder="Book Name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                {...register("author")}
                className={errors.author ? "border-red-500" : ""}
                placeholder="Author Name"
              />
              {errors.author && (
                <p className="text-red-500 text-sm">{errors.author.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                type="number"
                {...register("pages", { valueAsNumber: true })}
                className={errors.pages ? "border-red-500" : ""}
                placeholder="0"
              />
              {errors.pages && (
                <p className="text-red-500 text-sm">{errors.pages.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publicationDate">Publication Date</Label>
              <Input
                id="publicationDate"
                type="date"
                {...register("publicationDate")}
                className={errors.publicationDate ? "border-red-500" : ""}
                placeholder="mm/dd/yyyy"
              />
              {errors.publicationDate && (
                <p className="text-red-500 text-sm">
                  {errors.publicationDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="copiesAvailable">Copies Available</Label>
              <Input
                id="copiesAvailable"
                type="number"
                {...register("copiesAvailable", { valueAsNumber: true })}
                className={errors.copiesAvailable ? "border-red-500" : ""}
                placeholder="0"
              />
              {errors.copiesAvailable && (
                <p className="text-red-500 text-sm">
                  {errors.copiesAvailable.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" className="w-full">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
