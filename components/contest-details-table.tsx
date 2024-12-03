'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Search, Bell, User, Filter, Download, Calendar, Users, Award } from 'lucide-react'

const mockParticipants = [
  { id: 1, name: 'Alice Johnson', team: 'Code Wizards', status: 'Registered', score: 95, lastSubmission: '2024-09-06 14:30' },
  { id: 2, name: 'Bob Smith', team: 'Binary Bosses', status: 'In Progress', score: 80, lastSubmission: '2024-09-06 15:45' },
  { id: 3, name: 'Charlie Brown', team: 'Algo Aces', status: 'Completed', score: 100, lastSubmission: '2024-09-06 16:20' },
  { id: 4, name: 'Diana Ross', team: 'Data Dynamos', status: 'Registered', score: null, lastSubmission: 'N/A' },
  { id: 5, name: 'Ethan Hunt', team: 'Code Wizards', status: 'In Progress', score: 85, lastSubmission: '2024-09-06 18:05' },
]

const mockProblems = [
  { seqNo: 1, name: 'Problem 1', marks: 100 },
  { seqNo: 2, name: 'Problem 2', marks: 200 },
  { seqNo: 3, name: 'Problem 3', marks: 150 },
  { seqNo: 4, name: 'Problem 4', marks: 250 },
]

export function ContestDetailPage() {
  const [selectedTeam, setSelectedTeam] = useState('All')

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-lg font-semibold">Contest: Algorithmic Challenge 2024</span>
          <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon"><Search className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><Bell className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon"><User className="h-4 w-4" /></Button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Start Date</p>
              <p className="text-xl font-bold">Sep 15, 2024</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-400" />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Participants</p>
              <p className="text-xl font-bold">128</p>
            </div>
            <Users className="h-8 w-8 text-green-400" />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400">Total Prize</p>
              <p className="text-xl font-bold">$10,000</p>
            </div>
            <Award className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <Tabs defaultValue="participants" className="w-full">
          <TabsList className="w-full bg-gray-800 p-0 mb-6">
            <TabsTrigger value="participants" className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700">Participants</TabsTrigger>
            <TabsTrigger value="challenges" className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700">Leaderboard</TabsTrigger>
            {/* <TabsTrigger value="analytics" className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700">Analytics</TabsTrigger> */}
          </TabsList>

          {/* Participants Tab */}
          <TabsContent value="participants">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Participants</h2>
              <div className="flex space-x-2">
                <Select onValueChange={setSelectedTeam} value={selectedTeam}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Teams</SelectItem>
                    <SelectItem value="Code Wizards">Code Wizards</SelectItem>
                    <SelectItem value="Binary Bosses">Binary Bosses</SelectItem>
                    <SelectItem value="Algo Aces">Algo Aces</SelectItem>
                    <SelectItem value="Data Dynamos">Data Dynamos</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Last Submission</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockParticipants
                  .filter(participant => selectedTeam === 'All' || participant.team === selectedTeam)
                  .map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>{participant.name}</TableCell>
                      <TableCell>{participant.team}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${participant.status === 'Completed' ? 'bg-green-800 text-green-200' :
                            participant.status === 'In Progress' ? 'bg-yellow-800 text-yellow-200' :
                            'bg-blue-800 text-blue-200'}`} >
                          {participant.status}
                        </span>
                      </TableCell>
                      <TableCell>{participant.score !== null ? `${participant.score}` : 'N/A'}</TableCell>
                      <TableCell>{participant.lastSubmission}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges">
            <h2 className="text-2xl font-bold mb-4">Contest Challenges</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Seq No.</TableHead>
                  <TableHead>Problem Name</TableHead>
                  <TableHead>Marks</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProblems.map((problem) => (
                  <TableRow key={problem.seqNo}>
                    <TableCell>{problem.seqNo}</TableCell>
                    <TableCell>{problem.name}</TableCell>
                    <TableCell>{problem.marks}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        Attempt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockParticipants
                  .filter(participant => participant.score !== null)
                  .sort((a, b) => b.score - a.score)  // Sort by score in descending order
                  .map((participant) => (
                    <TableRow key={participant.id}>
                      <TableCell>{participant.name}</TableCell>
                      <TableCell>{participant.team}</TableCell>
                      <TableCell>{participant.score}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TabsContent>

          {/* Analytics Tab */}
          {/* <TabsContent value="analytics">
            <h2 className="text-2xl font-bold mb-4">Contest Analytics</h2>
            <p>Analytics data will be displayed here.</p>
          </TabsContent> */}
        </Tabs>
      </div>
    </div>
  )
}
