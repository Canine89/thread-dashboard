import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data", "cache");
const metricsFile = path.join(dataDir, "metrics.json");

export function readMetricsCache<T>(): T | null {
  try {
    if (!fs.existsSync(metricsFile)) return null;
    return JSON.parse(fs.readFileSync(metricsFile, "utf8")) as T;
  } catch {
    return null;
  }
}

export function writeMetricsCache<T>(data: T) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(metricsFile, JSON.stringify(data, null, 2));
}
