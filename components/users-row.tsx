'use client'

import { useState } from 'react'
import { TableCell, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react'
import Image from 'next/image'

interface User {
  id: string
  name: string
  avatar: string
}

interface UserRowProps {
  user: User
}
export function UserRow({ user }: UserRowProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  const handleViewUser = (userId: string) => {
    setSelectedUser(userId)
    // Implement view user functionality here
    console.log(`Viewing user: ${userId}`)
  }

  const handleRemoveUser = (userId: string) => {
    // Implement remove user functionality here
    console.log(`Removing user: ${userId}`)
  }

  return (
    <TableRow>
      <TableCell>
        <Image
          src={user.avatar}
          alt={`${user.name}'s avatar`}
          width={40}
          height={40}
          className="rounded-full"
        />
      </TableCell>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.id}</TableCell>
      <TableCell>{user.submissions}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewUser(user.id)}>
              View user
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRemoveUser(user.id)}>
              Remove user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

