import { useState, useMemo } from 'react'

export interface Contest {
  id: string
  name: string
  organiser: string
  organiserKind: 'Individual' | 'Company' | 'Institution'
  status: 'Upcoming' | 'Ongoing' | 'Completed'
}

const fakeContests: Contest[] = [
  { id: "001", name: "Web Dev Challenge", organiser: "TechCorp", organiserKind: "Company", status: "Upcoming" },
  { id: "002", name: "AI Hackathon", organiser: "DataSci University", organiserKind: "Institution", status: "Ongoing" },
  { id: "003", name: "Mobile App Contest", organiser: "John Doe", organiserKind: "Individual", status: "Completed" },
  { id: "004", name: "Cybersecurity CTF", organiser: "SecureNet", organiserKind: "Company", status: "Upcoming" },
  { id: "005", name: "Game Jam", organiser: "GameDev Institute", organiserKind: "Institution", status: "Ongoing" },
]

export function useContests() {
  const [contests] = useState<Contest[]>(fakeContests)
  const [search, setSearch] = useState('')
  const [sortConfig, setSortConfig] = useState<{ key: keyof Contest; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' })

  const sortedContests = useMemo(() => {
    let sortableContests = [...contests]
    if (search) {
      sortableContests = sortableContests.filter(contest =>
        contest.name.toLowerCase().includes(search.toLowerCase()) ||
        contest.organiser.toLowerCase().includes(search.toLowerCase())
      )
    }
    sortableContests.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
    return sortableContests
  }, [contests, search, sortConfig])

  const requestSort = (key: keyof Contest) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  return { contests: sortedContests, search, setSearch, requestSort, sortConfig }
}

