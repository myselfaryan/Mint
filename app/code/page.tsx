import { CodeEditor } from "@/components/code-editor"
import { Button } from "@/components/ui/button"

export default function CodePage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="h-screen">
        <div className="h-full rounded-lg border border-zinc-800 bg-zinc-900">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <h1 className="text-lg font-semibold text-zinc-100">Daily Question</h1>
            <div className="flex items-center space-x-2">
              <Button className="rounded p-2 hover:bg-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </Button>
              <Button className="rounded p-2 hover:bg-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Button>
              <Button className="rounded p-2 hover:bg-zinc-800">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400">
                  <path d="M15 3h6v6"/>
                  <path d="M10 14 21 3"/>
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                </svg>
              </Button>
            </div>
          </div>
          <CodeEditor />
        </div>
      </div>
    </div>
  )
}