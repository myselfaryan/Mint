# Real-Time Code Execution Engine

A **FREE** real-time code execution system for Mint using the open-source Piston API.

## 💰 Cost: **$0 - Completely FREE!**

This implementation uses the **Piston API** which is:
- ✅ Completely free and open-source
- ✅ No API key required
- ✅ No setup needed - works out of the box
- ✅ Supports 50+ programming languages

## Features

- **Multi-language Support**: Python, C++, Java, JavaScript
- **Real-time Updates**: Server-Sent Events (SSE) for live test case execution status
- **Redis Queue System**: Reliable job queuing with real-time notifications
- **Rate Limiting**: Per-user submission rate limiting
- **Result Caching**: Fast result retrieval with Redis caching

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Code Editor   │────▶│   /api/submit   │────▶│   Redis Queue   │
│   (Frontend)    │     │   (API Route)   │     │                 │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
        │                                                 │
        │                                                 ▼
        │                                       ┌─────────────────┐
        │                                       │  Queue Worker   │
        │                                       │   (Background)  │
        │                                       └────────┬────────┘
        │                                                 │
        │                                                 ▼
        │                                       ┌─────────────────┐
        │                                       │   Piston API    │
        │                                       │     (FREE)      │
        │                                       └────────┬────────┘
        │                                                 │
        ▼                                                 ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  SSE Stream     │◀────│  Redis Pub/Sub  │◀────│  Status Updates │
│  /api/.../stream│     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Quick Start

### 1. Start the services (Postgres + Redis)

```bash
docker compose up -d
```

### 2. Run the application

```bash
bun dev
```

### 3. Start the queue worker (in a separate terminal)

```bash
bun run queue:worker
```

That's it! No API keys, no paid services needed.

## API Endpoints

### Code Execution (for testing)

#### POST `/api/execute`
Execute code without saving.

**Request:**
```json
{
  "code": "print('Hello World')",
  "language": "python",
  "stdin": "",
  "timeLimit": 5,
  "memoryLimit": 128000
}
```

**Response:**
```json
{
  "success": true,
  "output": "Hello World",
  "stderr": "",
  "status": "accepted"
}
```

### Submissions (for judging)

#### POST `/api/submit`
Submit code for official judging.

**Request:**
```json
{
  "code": "...",
  "language": "python",
  "problemId": 1
}
```

**Response:**
```json
{
  "submissionId": 123,
  "status": "queued",
  "message": "Submission queued for processing",
  "testCaseCount": 10
}
```

#### GET `/api/submit/[id]`
Get submission results.

#### GET `/api/submissions/[id]/stream`
SSE endpoint for real-time updates.

## Frontend Integration

### Using the Code Editor

```tsx
import { CodeEditorV2 } from "@/components/code-editor-v2";

export default function ProblemPage({ problem }) {
  return <CodeEditorV2 problem={problem} />;
}
```

### Using the Submission Hook

```tsx
import { useCodeSubmission } from "@/hooks/useSubmissionStream";

function MyComponent() {
  const { submit, isSubmitting, stream } = useCodeSubmission();

  const handleSubmit = async () => {
    await submit(code, language, problemId);
  };

  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
      <div>Status: {stream.status}</div>
      <div>Progress: {stream.passedCount}/{stream.totalCount}</div>
    </div>
  );
}
```

## Supported Languages

| Language | Version | Piston Alias |
|----------|---------|--------------|
| Python | 3.10 | python |
| C++ | GCC 10.2 | cpp |
| Java | OpenJDK 15 | java |
| JavaScript | Node.js 18 | node |

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PISTON_API_URL` | Piston API endpoint | `https://emkc.org/api/v2/piston` (free) |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |

## Real-Time Updates via SSE

Connect to `/api/submissions/[id]/stream` to receive live updates:

### Event Types

1. **submission_created**: Initial confirmation
2. **submission_status_update**: Status changes
3. **test_case_started**: Test case execution begins
4. **test_case_completed**: Test case result
5. **submission_completed**: Final result
6. **error**: Error occurred

## Rate Limiting

- **Default**: 10 submissions per 60 seconds per user
- Returns `429 Too Many Requests` when exceeded

## Adding New Languages

Piston supports 50+ languages! To add one:

1. Check available languages:
```bash
curl https://emkc.org/api/v2/piston/runtimes
```

2. Add configuration in `lib/code-execution/types.ts`

3. Add CodeMirror extension if available

## About Piston API

[Piston](https://github.com/engineer-man/piston) is a high-performance code execution engine that:
- Runs in isolated containers
- Supports 50+ languages
- Is completely free and open-source
- Can be self-hosted if needed

Public API: `https://emkc.org/api/v2/piston` (no key required)
