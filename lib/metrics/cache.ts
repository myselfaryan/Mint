import fs from "node:fs";

type CacheMetric = {
  timestamp: number;
  path: string;
  useCache: boolean;
  duration: number;
  cacheHit?: boolean;
  dbQueries: number;
  memoryUsage: number;
};

class CacheMetricsCollector {
  private metrics: CacheMetric[] = [];
  private readonly FILE_PATH = "/tmp/cache-metrics.json";
  private flushInterval: NodeJS.Timeout;

  constructor() {
    // Create metrics file if doesn't exist
    try {
      const dir = "/tmp";
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      if (!fs.existsSync(this.FILE_PATH)) {
        fs.writeFileSync(this.FILE_PATH, "[]");
      }

      // Flush metrics to file every 5 minutes
      this.flushInterval = setInterval(() => this.flush(), 5 * 60 * 1000);
    } catch (error) {
      console.error("Failed to initialize metrics collector:", error);
      throw error;
    }
  }

  record(metric: Omit<CacheMetric, "timestamp">) {
    this.metrics.push({
      ...metric,
      timestamp: Date.now(),
    });

    if (this.metrics.length > 1000) {
      this.flush();
    }
  }

  private flush() {
    if (this.metrics.length === 0) return;

    try {
      console.log("Flushing metrics to file:", this.FILE_PATH);
      const existingMetrics = JSON.parse(
        fs.readFileSync(this.FILE_PATH, "utf8"),
      );
      console.log("Existing metrics count:", existingMetrics.length);
      const allMetrics = [...existingMetrics, ...this.metrics];
      fs.writeFileSync(this.FILE_PATH, JSON.stringify(allMetrics, null, 2));
      console.log("Flushed metrics count:", this.metrics.length);
      this.metrics = [];
    } catch (error) {
      console.error("Failed to flush metrics:", error);
    }
  }

  generateReport(): {
    withCache: { avg: number; p95: number; hits: number; misses: number };
    withoutCache: { avg: number; p95: number };
    dbQueriesSaved: number;
    memoryUsage: { withCache: number; withoutCache: number };
  } {
    try {
      const allMetrics: CacheMetric[] = [
        ...JSON.parse(fs.readFileSync(this.FILE_PATH, "utf8")),
        ...this.metrics,
      ];

      const cached = allMetrics.filter((m) => m.useCache);
      const uncached = allMetrics.filter((m) => !m.useCache);

      const hits = cached.filter((m) => m.cacheHit).length;
      const misses = cached.filter((m) => !m.cacheHit).length;

      return {
        withCache: {
          avg: this.average(cached.map((m) => m.duration)),
          p95: this.percentile(
            cached.map((m) => m.duration),
            95,
          ),
          hits,
          misses,
        },
        withoutCache: {
          avg: this.average(uncached.map((m) => m.duration)),
          p95: this.percentile(
            uncached.map((m) => m.duration),
            95,
          ),
        },
        dbQueriesSaved: cached.reduce(
          (acc, m) => acc + (m.cacheHit ? 1 : 0),
          0,
        ),
        memoryUsage: {
          withCache: this.average(cached.map((m) => m.memoryUsage)),
          withoutCache: this.average(uncached.map((m) => m.memoryUsage)),
        },
      };
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw error;
    }
  }

  private average(numbers: number[]): number {
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }

  private percentile(numbers: number[], p: number): number {
    const sorted = [...numbers].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * (p / 100);
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  }

  cleanup() {
    clearInterval(this.flushInterval);
    this.flush();
  }
}

// Export singleton instance
export const cacheMetrics = new CacheMetricsCollector();
