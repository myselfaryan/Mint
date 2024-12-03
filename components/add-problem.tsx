'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function AddProblem() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ title, description });
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl font-semibold text-white mb-8 text-center">Add New Problem</h1>
        <div className="bg-[#1E1E1E] rounded-lg border border-[#2D2D2D] shadow-2xl">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#CCCCCC] text-sm">Problem Title</Label>
                <Input
                  id="title"
                  placeholder="Enter problem title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-[#2D2D2D] border-[#3E3E3E] text-[#CCCCCC] placeholder:text-[#6B6B6B] focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] h-10 text-sm"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#CCCCCC] text-sm">Problem Description</Label>
                <textarea
                  id="description"
                  className="w-full min-h-[300px] p-3 bg-[#2D2D2D] border border-[#3E3E3E] rounded-md text-[#CCCCCC] placeholder:text-[#6B6B6B] focus:border-[#007ACC] focus:ring-1 focus:ring-[#007ACC] text-sm resize-none"
                  placeholder="Enter problem description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#007ACC] hover:bg-[#1B8CDC] text-white py-2.5 rounded-md font-medium transition-colors duration-200 text-sm"
              >
                Add Problem
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
