'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchComponentProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchComponentComponent({ onSearch, placeholder = "Search...", className = "" }: SearchComponentProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target as Node)) {
        handleCollapse()
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  const handleExpand = () => {
    setIsExpanded(true)
    document.body.style.overflow = 'hidden'
  }

  const handleCollapse = () => {
    setIsExpanded(false)
    setSearchQuery("")
    document.body.style.overflow = 'auto'
  }

  const handleSearch = () => {
    onSearch(searchQuery)
    handleCollapse()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleExpand}
        aria-label="Open search"
        className={className}
      >
        <Search className="h-4 w-4" />
      </Button>

      {isExpanded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div ref={overlayRef} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
            <div className="flex items-center mb-4">
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow bg-gray-700 border-none text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearch}
                className="ml-2"
                aria-label="Perform search"
              >
                <Search className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCollapse}
                className="ml-2"
                aria-label="Close search"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {/* You can add search suggestions or recent searches here */}
            <div className="text-sm text-gray-400">
              Press Enter to search or ESC to close
            </div>
          </div>
        </div>
      )}
    </>
  )
}