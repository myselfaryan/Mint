import { useState, useMemo } from 'react'

interface User {
  id: string
  name: string
  avatar: string
  submissions: number
}

const fakeUsers: User[] = [
  { id: "001", name: "Alice Johnson", avatar: "/placeholder.svg?height=40&width=40", submissions: 15 },
  { id: "002", name: "Bob Smith", avatar: "/placeholder.svg?height=40&width=40", submissions: 8 },
  { id: "003", name: "Charlie Brown", avatar: "/placeholder.svg?height=40&width=40", submissions: 22 },
  { id: "004", name: "Diana Ross", avatar: "/placeholder.svg?height=40&width=40", submissions: 5 },
  { id: "005", name: "Edward Norton", avatar: "/placeholder.svg?height=40&width=40", submissions: 19 },
]

export function useUsers() {
  const [users] = useState<User[]>(fakeUsers)
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [sortField, setSortField] = useState<'id' | 'submissions'>('id')

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.id.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => {
      if (sortField === 'id') {
        return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id)
      } else {
        return sortOrder === 'asc' ? a.submissions - b.submissions : b.submissions - a.submissions
      }
    })
  }, [users, search, sortOrder, sortField])

  return {
    users: filteredUsers,
    search,
    setSearch,
    sortOrder,
    setSortOrder,
    sortField,
    setSortField,
  }
}

