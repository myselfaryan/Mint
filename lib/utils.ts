import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInMs / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInYears > 0) {
    return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
  } else if (diffInMonths > 0) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  } else if (diffInDays > 0) {
    return diffInDays === 1 ? "yesterday" : `${diffInDays} days ago`;
  } else if (diffInHours > 0) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  } else if (diffInMins > 0) {
    return diffInMins === 1 ? "1 minute ago" : `${diffInMins} minutes ago`;
  } else {
    return "just now";
  }
}

// Example usage:
// const joinDate = "2024-12-04T23:37:56.356Z";
// console.log(`Joined ${timeAgo(joinDate)}`);
// Output might be like: "Joined 2 days ago"
