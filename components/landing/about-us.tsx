"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  IconBrandYoutubeFilled,
  IconCode,
  IconMessageCircle,
  IconRocket,
  IconBrain,
} from "@tabler/icons-react";
import Link from "next/link";

export function AboutUs() {
  const features = [
    {
      title: "Automated Assessment",
      description:
        "Evaluate student code submissions automatically with our powerful testing framework and AI-driven analysis.",
      skeleton: <SkeletonOne />,
      className:
        "col-span-1 lg:col-span-4 border-b lg:border-r dark:border-neutral-800",
    },
    {
      title: "Real-time Feedback",
      description:
        "Provide instant feedback to students with detailed insights and suggestions for improvement.",
      skeleton: <SkeletonTwo />,
      className: "border-b col-span-1 lg:col-span-2 dark:border-neutral-800",
    },
    {
      title: "Interactive Learning",
      description:
        "Engage students with our interactive coding environment and real-time collaboration features.",
      skeleton: <SkeletonThree />,
      className: "col-span-1 lg:col-span-3 lg:border-r dark:border-neutral-800",
    },
    {
      title: "Seamless Integration",
      description:
        "Easily integrate with your existing LMS and development tools for a smooth teaching experience.",
      skeleton: <SkeletonFour />,
      className: "col-span-1 lg:col-span-3 border-b lg:border-none",
    },
  ];

  return (
    <div className="relative z-20 py-10 lg:py-40 max-w-7xl mx-auto">
      <div className="px-8">
        <h4 className="text-3xl lg:text-5xl lg:leading-tight max-w-5xl mx-auto text-center tracking-tight font-medium text-white">
          Transform Your Teaching Experience
        </h4>

        <p className="text-sm lg:text-base max-w-2xl my-4 mx-auto text-neutral-400 text-center font-normal">
          Pariksa provides cutting-edge tools and features to make coding
          education more effective, engaging, and efficient for both educators
          and students.
        </p>
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-6 mt-12 xl:border rounded-md dark:border-neutral-800">
          {features.map((feature) => (
            <FeatureCard key={feature.title} className={feature.className}>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <div className="h-full w-full">{feature.skeleton}</div>
            </FeatureCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureCard = ({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn(`p-4 sm:p-8 relative overflow-hidden`, className)}>
      {children}
    </div>
  );
};

const FeatureTitle = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p className="max-w-5xl mx-auto text-left tracking-tight text-white text-xl md:text-2xl md:leading-snug">
      {children}
    </p>
  );
};

const FeatureDescription = ({ children }: { children?: React.ReactNode }) => {
  return (
    <p
      className={cn(
        "text-sm md:text-base max-w-4xl text-left mx-auto",
        "text-neutral-400 text-center font-normal",
        "text-left max-w-sm mx-0 md:text-sm my-2",
      )}
    >
      {children}
    </p>
  );
};

const SkeletonOne = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-8 mx-auto bg-neutral-900 shadow-2xl group h-full rounded-xl border border-neutral-800">
        <motion.div
          className="flex flex-col items-center justify-center h-full space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <IconCode className="w-16 h-16 text-blue-500" />
          <div className="text-center space-y-2">
            <div className="h-2 w-24 bg-blue-500/20 rounded-full mx-auto" />
            <div className="h-2 w-16 bg-blue-500/20 rounded-full mx-auto" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SkeletonTwo = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-8 mx-auto bg-neutral-900 shadow-2xl group h-full rounded-xl border border-neutral-800">
        <motion.div
          className="flex flex-col items-center justify-center h-full space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <IconMessageCircle className="w-16 h-16 text-green-500" />
          <div className="text-center space-y-2">
            <div className="h-2 w-24 bg-green-500/20 rounded-full mx-auto" />
            <div className="h-2 w-16 bg-green-500/20 rounded-full mx-auto" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SkeletonThree = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-8 mx-auto bg-neutral-900 shadow-2xl group h-full rounded-xl border border-neutral-800">
        <motion.div
          className="flex flex-col items-center justify-center h-full space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <IconBrain className="w-16 h-16 text-purple-500" />
          <div className="text-center space-y-2">
            <div className="h-2 w-24 bg-purple-500/20 rounded-full mx-auto" />
            <div className="h-2 w-16 bg-purple-500/20 rounded-full mx-auto" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const SkeletonFour = () => {
  return (
    <div className="relative flex py-8 px-2 gap-10 h-full">
      <div className="w-full p-8 mx-auto bg-neutral-900 shadow-2xl group h-full rounded-xl border border-neutral-800">
        <motion.div
          className="flex flex-col items-center justify-center h-full space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <IconRocket className="w-16 h-16 text-orange-500" />
          <div className="text-center space-y-2">
            <div className="h-2 w-24 bg-orange-500/20 rounded-full mx-auto" />
            <div className="h-2 w-16 bg-orange-500/20 rounded-full mx-auto" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
