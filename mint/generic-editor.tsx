"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

export interface Field {
  name: string;
  label: string;
  type: "text" | "number" | "date" | "datetime" | "select" | "textarea";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface GenericEditorProps<T> {
  data: T | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: T) => void | Promise<void>;
  schema: z.ZodType<T>;
  fields: Field[];
  title: string;
}

export function GenericEditor<T>({
  data,
  isOpen,
  onClose,
  onSave,
  schema,
  fields,
  title,
}: GenericEditorProps<T>) {
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: data || {},
  });

  useEffect(() => {
    if (data) {
      // Convert datetime strings to local datetime-local format for input
      const formattedData = { ...data };
      fields.forEach((field) => {
        if (
          field.type === "datetime" &&
          formattedData[field.name as keyof typeof formattedData]
        ) {
          const date = new Date(
            formattedData[field.name as keyof typeof formattedData] as string,
          );
          formattedData[field.name as keyof typeof formattedData] = date
            .toISOString()
            .slice(0, 16) as any;
        }
      });
      reset(formattedData);
    } else {
      reset({} as T);
    }
  }, [data, reset, fields]);

  const onSubmit = async (formData: T) => {
    setIsSaving(true);
    try {
      // Convert datetime-local values to ISO strings
      const processedData = { ...formData };
      fields.forEach((field) => {
        if (
          field.type === "datetime" &&
          processedData[field.name as keyof typeof processedData]
        ) {
          const date = new Date(
            processedData[field.name as keyof typeof processedData] as string,
          );
          processedData[field.name as keyof typeof processedData] =
            date.toISOString() as any;
        }
      });

      // If this is a new entry, add an id
      if (!data) {
        processedData.id = Date.now() as any;
      }

      await onSave(processedData as T);
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {data ? `Edit ${title}` : `Add New ${title}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{field.label}</Label>
                {field.type === "select" && field.options ? (
                  <Select
                    onValueChange={(value) => {
                      const event = {
                        target: { name: field.name, value },
                      };
                      register(field.name as any).onChange(event);
                    }}
                    defaultValue={
                      data?.[field.name as keyof typeof data] as string
                    }
                  >
                    <SelectTrigger
                      className={
                        errors[field.name as keyof typeof errors]
                          ? "border-red-500"
                          : ""
                      }
                    >
                      <SelectValue
                        placeholder={field.placeholder || "Select an option"}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === "textarea" ? (
                  <Textarea
                    id={field.name}
                    placeholder={field.placeholder || ""}
                    {...register(field.name as any)}
                    className={
                      errors[field.name as keyof typeof errors]
                        ? "border-red-500"
                        : ""
                    }
                  />
                ) : field.type === "datetime" ? (
                  <Input
                    id={field.name}
                    type="datetime-local"
                    placeholder={field.placeholder || ""}
                    {...register(field.name as any)}
                    className={
                      errors[field.name as keyof typeof errors]
                        ? "border-red-500"
                        : ""
                    }
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder || ""}
                    {...register(field.name as any, {
                      valueAsNumber: field.type === "number",
                    })}
                    className={
                      errors[field.name as keyof typeof errors]
                        ? "border-red-500"
                        : ""
                    }
                  />
                )}
                {errors[field.name as keyof typeof errors] && (
                  <p className="text-red-500 text-sm">
                    {
                      errors[field.name as keyof typeof errors]
                        ?.message as string
                    }
                  </p>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
