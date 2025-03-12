// Simple in-memory metrics store compatible with Edge Runtime
class EdgeMetrics {
  private counters: Map<string, number>
  private histograms: Map<string, number[]>

  constructor() {
    this.counters = new Map()
    this.histograms = new Map()
  }

  // Counter methods
  incrementCounter(name: string, labels: Record<string, string>) {
    const key = this.getKey(name, labels)
    const current = this.counters.get(key) || 0
    this.counters.set(key, current + 1)
  }

  // Histogram methods
  observeHistogram(name: string, value: number, labels: Record<string, string>) {
    const key = this.getKey(name, labels)
    const values = this.histograms.get(key) || []
    values.push(value)
    this.histograms.set(key, values)
  }

  // Get metrics in Prometheus format
  getMetrics(): string {
    let output = ''

    // Counter metrics
    this.counters.forEach((value, key) => {
      const [name, labelStr] = this.parseKey(key)
      output += `# TYPE ${name} counter\n`
      output += `${name}${labelStr} ${value}\n`
    })

    // Histogram metrics
    this.histograms.forEach((values, key) => {
      const [name, labelStr] = this.parseKey(key)
      output += `# TYPE ${name} histogram\n`

      // Calculate quantiles
      const sorted = values.sort((a, b) => a - b)
      const count = sorted.length
      const sum = sorted.reduce((a, b) => a + b, 0)

      output += `${name}_count${labelStr} ${count}\n`
      output += `${name}_sum${labelStr} ${sum}\n`

      // Add bucket information
      const buckets = [10, 50, 100, 200, 500, 1000, 2000, 5000]
      buckets.forEach(bucket => {
        const le = bucket
        const count = sorted.filter(v => v <= le).length
        output += `${name}_bucket${this.addLe(labelStr, le)} ${count}\n`
      })
    })

    return output
  }

  private getKey(name: string, labels: Record<string, string>): string {
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',')
    return `${name}{${labelStr}}`
  }

  private parseKey(key: string): [string, string] {
    const match = key.match(/^(.+){(.+)}$/)
    if (!match) return [key, '']
    return [match[1], `{${match[2]}}`]
  }

  private addLe(labelStr: string, le: number): string {
    if (labelStr === '') return `{le="${le}"}`
    return labelStr.replace('}', `,le="${le}"}`)
  }
}

export const metrics = new EdgeMetrics()