"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";
import { LucideIcon, Code2, Cpu, Users, Shield, Gauge, Book, Gift, Clock, Settings, Zap } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  icon: LucideIcon;
  category: string;
}

const faqItems: FAQItem[] = [
  {
    icon: Code2,
    category: "Platform",
    question: "What makes Pariksa different from other coding platforms?",
    answer: "Pariksa stands out with its AI-powered evaluation system, real-time collaboration features, and customizable learning paths. Our platform adapts to each student's pace while providing educators with comprehensive analytics and automated grading capabilities."
  },
  {
    icon: Cpu,
    category: "Technology",
    question: "How does the intelligent evaluation system work?",
    answer: "Our evaluation system combines multiple technologies: AI-based code analysis for style and efficiency, automated test case execution, plagiarism detection, and performance benchmarking. It provides instant, detailed feedback with suggestions for improvement."
  },
  {
    icon: Users,
    category: "Collaboration",
    question: "What collaborative features are available?",
    answer: "Students can participate in peer code reviews, join discussion forums, work on team projects, and share solutions in a moderated environment. Educators can create collaborative assignments, monitor group progress, and facilitate team-based learning."
  },
  {
    icon: Shield,
    category: "Security",
    question: "How secure is the code execution environment?",
    answer: "We implement industry-leading security measures including isolated containers for code execution, encrypted data transmission, secure authentication, and regular security audits. Your code and data are protected with enterprise-grade security protocols."
  },
  {
    icon: Gauge,
    category: "Performance",
    question: "Can it handle large-scale deployments?",
    answer: "Absolutely! Our platform is built on a scalable cloud infrastructure that can handle thousands of simultaneous users. We offer dedicated hosting options for institutions with specific performance requirements."
  },
  {
    icon: Book,
    category: "Learning",
    question: "What learning resources are included?",
    answer: "We provide comprehensive documentation, video tutorials, interactive coding exercises, and a vast problem library. Students get access to best practices, code examples, and learning paths tailored to their skill level."
  },
  {
    icon: Gift,
    category: "Features",
    question: "What's included in the free plan?",
    answer: "The free plan includes core features like code evaluation, basic analytics, and access to our problem library. You can manage up to 50 students, create custom assignments, and use our automated grading system."
  },
  {
    icon: Clock,
    category: "Support",
    question: "What kind of support do you offer?",
    answer: "We provide 24/7 technical support, regular platform updates, and dedicated account managers for enterprise customers. Our support team includes experienced developers who can assist with technical queries."
  },
  {
    icon: Settings,
    category: "Integration",
    question: "Can Pariksa integrate with our existing systems?",
    answer: "Yes! We offer robust API integration capabilities and support popular authentication systems (SSO). Pariksa can seamlessly connect with your LMS, GitHub, and other educational tools."
  },
  {
    icon: Zap,
    category: "Getting Started",
    question: "How quickly can we get started?",
    answer: "You can start using Pariksa immediately after signing up. Our onboarding process is straightforward, and we provide quick-start guides for both educators and students. Most institutions are fully operational within a day."
  }
];

export function FAQ() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="relative bg-black min-h-screen py-20">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black opacity-50" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to know about Pariksa. Can't find the answer you're looking for? Reach out to our support team.
          </p>
        </div>

        <motion.div 
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <AccordionItem 
                  value={`item-${index + 1}`}
                  className="border border-gray-800 rounded-lg bg-gray-900/50 backdrop-blur-sm overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-gray-800/50 transition-all">
                    <div className="flex items-center text-left">
                      <div className="mr-4">
                        <item.icon className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-500">{item.category}</p>
                        <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4 text-gray-300">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact support section */}
        <div className="mt-16 text-center">
          <p className="text-gray-400">
            Still have questions?{" "}
            <a href="#contact" className="text-blue-500 hover:text-blue-400 font-medium">
              Contact our support team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
