import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import {
  CodeIcon,
  BrainCircuitIcon,
  UsersIcon,
  SettingsIcon,
  GraduationCapIcon,
  ShieldCheckIcon,
} from "lucide-react";

const features = [
  {
    title: "Advanced Code Evaluation",
    description:
      "Real-time feedback and automated grading with support for multiple programming languages.",
    icon: <CodeIcon className="w-8 h-8" />,
  },
  {
    title: "Smart Assessment",
    description:
      "AI-powered code analysis for style, efficiency, and best practices.",
    icon: <BrainCircuitIcon className="w-8 h-8" />,
  },
  {
    title: "Collaborative Learning",
    description:
      "Interactive discussion forums and peer review system for better learning outcomes.",
    icon: <UsersIcon className="w-8 h-8" />,
  },
  {
    title: "Customizable Workflows",
    description:
      "Tailor the platform to your specific teaching methodology and requirements.",
    icon: <SettingsIcon className="w-8 h-8" />,
  },
  {
    title: "Learning Analytics",
    description:
      "Comprehensive insights into student performance and progress tracking.",
    icon: <GraduationCapIcon className="w-8 h-8" />,
  },
  {
    title: "Secure Environment",
    description:
      "Safe code execution environment with plagiarism detection and security measures.",
    icon: <ShieldCheckIcon className="w-8 h-8" />,
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 bg-black overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
          Powerful Features for Modern Education
        </h2>
        <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
          Everything you need to manage coding assignments effectively and
          provide an engaging learning experience.
        </p>

        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />
          <InfiniteMovingCards
            items={features}
            direction="right"
            speed="slow"
          />
          <InfiniteMovingCards
            items={[...features].reverse()}
            direction="left"
            speed="slow"
          />
        </div>
      </div>
    </section>
  );
}
