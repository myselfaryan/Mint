'use client'
import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, ChevronRight, Search, Bell, User, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AddProblem() {
  const router = useRouter()
  const [testCases, setTestCases] = useState([{ input: '', expectedOutput: '' }])
  const [pendingContest, setPendingContest] = useState<{ name: string; duration: string } | null>(null)

  useEffect(() => {
    // Load pending contest data from localStorage
    const contestData = localStorage.getItem('pendingContest')
    if (contestData) {
      setPendingContest(JSON.parse(contestData))
    }
  }, [])

  const addTestCase = () => {
    setTestCases([...testCases, { input: '', expectedOutput: '' }])
  }

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index))
  }

  const updateTestCase = (index: number, field: 'input' | 'expectedOutput', value: string) => {
    const updatedTestCases = testCases.map((testCase, i) => 
      i === index ? { ...testCase, [field]: value } : testCase
    )
    setTestCases(updatedTestCases)
  }

  const handleCreateContest = () => {
    if (!pendingContest) return

    // TODO: Add API call to create contest with problems
    console.log('Creating contest:', pendingContest)
    console.log('With test cases:', testCases)

    // Clear the pending contest data
    localStorage.removeItem('pendingContest')
    
    // Navigate back to contests page
    router.push('/contests')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-gray-800 p-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-lg font-semibold">Add New Problem</span>
          <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
        </div>
        {pendingContest && (
          <Button 
            onClick={handleCreateContest}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Contest
          </Button>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="problem" className="w-full">
          <TabsList className="w-full bg-gray-800 p-0 mb-6">
            <TabsTrigger value="problem" className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700">Problem Statement</TabsTrigger>
            <TabsTrigger value="testcases" className="flex-1 bg-gray-800 data-[state=active]:bg-gray-700">Test Cases</TabsTrigger>
            
          </TabsList>
          
          <TabsContent value="problem">
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">Problem Title</label>
                <Input id="title" placeholder="Enter problem title" className="bg-gray-800 border-gray-700" />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Problem Description</label>
                <Textarea id="description" placeholder="Enter problem description" className="bg-gray-800 border-gray-700 min-h-[200px]" />
              </div>
              
              
            </div>
          </TabsContent>
          
          <TabsContent value="testcases">
            <div className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Test Case {index + 1}</h3>
                    <Button variant="ghost" size="sm" onClick={() => removeTestCase(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <label htmlFor={`input-${index}`} className="block text-sm font-medium mb-1">Input</label>
                    <Textarea 
                      id={`input-${index}`} 
                      value={testCase.input} 
                      onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                      placeholder="Enter test case input" 
                      className="bg-gray-700 border-gray-600" 
                    />
                  </div>
                  <div>
                    <label htmlFor={`output-${index}`} className="block text-sm font-medium mb-1">Expected Output</label>
                    <Textarea 
                      id={`output-${index}`} 
                      value={testCase.expectedOutput} 
                      onChange={(e) => updateTestCase(index, 'expectedOutput', e.target.value)}
                      placeholder="Enter expected output" 
                      className="bg-gray-700 border-gray-600" 
                    />
                  </div>
                </div>
              ))}
              <Button onClick={addTestCase} className="w-full">
                <Plus className="h-4 w-4 mr-2" /> Add Test Case
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="solution">
            <div className="space-y-4">
              <div>
                <label htmlFor="solution" className="block text-sm font-medium mb-1">Solution</label>
                <Textarea id="solution" placeholder="Enter the solution code" className="bg-gray-800 border-gray-700 min-h-[300px] font-mono" />
              </div>
              <div>
                <label htmlFor="explanation" className="block text-sm font-medium mb-1">Explanation</label>
                <Textarea id="explanation" placeholder="Explain the solution" className="bg-gray-800 border-gray-700" />
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 flex justify-end">
          <Button className="bg-green-600 hover:bg-green-700">Save Problem</Button>
        </div>
      </div>
    </div>
  )
}