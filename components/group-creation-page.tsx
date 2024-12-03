'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Trash2, Users } from 'lucide-react'

export function GroupCreationPage() {
  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState<string[]>([])
  const [userIdInput, setUserIdInput] = useState('')

  const handleCreateGroup = () => {
    const newMembers = userIdInput.split(',').map(id => id.trim()).filter(id => id !== '')
    const updatedMembers = [...new Set([...members, ...newMembers])]
    
    // Implement group creation logic here
    console.log('Creating group:', { name: groupName, members: updatedMembers })
    
    // Reset form after creation
    setGroupName('')
    setMembers([])
    setUserIdInput('')
  }

  const handleRemoveMember = (memberId: string) => {
    setMembers(members.filter(id => id !== memberId))
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-4 flex items-center">
        <Button variant="ghost" size="icon" className="mr-4">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-semibold">Create New Group</h1>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
          <div className="mb-6">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="mt-1 bg-gray-700 border-gray-600 text-gray-300"
              placeholder="Enter group name"
            />
          </div>

          <div className="mb-6">
            <Label htmlFor="userIds">Add Members (User IDs)</Label>
            <Textarea
              id="userIds"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              className="mt-1 bg-gray-700 border-gray-600 text-gray-300"
              placeholder="Enter comma-separated user IDs"
            />
          </div>

          {members.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Current Members</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((memberId) => (
                    <TableRow key={memberId}>
                      <TableCell>{memberId}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMember(memberId)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
            <Button
            onClick={handleCreateGroup}
            className="w-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
            disabled={!groupName || (members.length === 0 && !userIdInput.trim())}
            >
            <Users className="h-4 w-4 mr-2" />
            Create Group
            </Button>
        </div>
      </div>
    </div>
  )
}

