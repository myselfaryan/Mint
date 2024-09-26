'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Search, Bell, User, Calendar, Trophy, CheckCircle } from 'lucide-react'

const mockUpcomingTests = [
  { id: 1, name: 'Weekly Challenge #23', date: '2024-09-10 14:00', duration: '2 hours' },
  { id: 2, name: 'Data Structures Exam', date: '2024-09-15 10:00', duration: '3 hours' },
  { id: 3, name: 'Algorithms Sprint', date: '2024-09-20 09:00', duration: '1.5 hours' },
]

const mockPastContests = [
  { id: 1, name: 'Weekly Challenge #22', date: '2024-09-03', rank: 45, score: 1200 },
  { id: 2, name: 'Summer Coding Cup', date: '2024-08-15', rank: 78, score: 950 },
  { id: 3, name: 'Algorithms Mastery Test', date: '2024-08-01', rank: 23, score: 1450 },
]

export function StudentDashboard() {
  const [problemsAttempted, setProblemsAttempted] = useState(127)
  const [contestsAttempted, setContestsAttempted] = useState(15)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-lg font-semibold">Student Dashboard</span>
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
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Attempted</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{problemsAttempted}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contests Attempted</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contestsAttempted}</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Contest</CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockUpcomingTests[0].name}</div>
              <p className="text-xs text-gray-400 mt-1">{mockUpcomingTests[0].date}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="w-full bg-gray-800 p-0 mb-6">
            <TabsTrigger value="upcoming" className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700">Upcoming Tests</TabsTrigger>
            <TabsTrigger value="past" className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700">Past Contests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUpcomingTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="font-medium">{test.name}</TableCell>
                    <TableCell>{test.date}</TableCell>
                    <TableCell>{test.duration}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View Details</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="past">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contest Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Rank</TableHead>
                  <TableHead>Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPastContests.map((contest) => (
                  <TableRow key={contest.id}>
                    <TableCell className="font-medium">{contest.name}</TableCell>
                    <TableCell>{contest.date}</TableCell>
                    <TableCell>{contest.rank}</TableCell>
                    <TableCell>{contest.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}