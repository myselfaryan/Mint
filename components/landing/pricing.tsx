"use client";

import { Button } from "../ui/button";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

const pricingPlans = [
  {
    name: "Free",
    price: "₹0",
    description: "Perfect for trying out Pariksa",
    features: [
      "Create up to 5 tests",
      "Basic question types",
      "Manual grading",
      "Basic analytics",
      "Email support",
      "Up to 30 students",
    ],
    buttonText: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "₹499",
    period: "/month",
    description: "For growing educational institutions",
    features: [
      "Unlimited tests",
      "Advanced question types",
      "Auto-grading",
      "Detailed analytics & reports",
      "Priority support",
      "Up to 500 students",
      "Custom branding",
      "Export results",
    ],
    buttonText: "Go Pro",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large institutions & universities",
    features: [
      "Everything in Pro",
      "Unlimited students",
      "Custom question types",
      "API access",
      "24/7 dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Onboarding assistance",
    ],
    buttonText: "Contact Sales",
    popular: false,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="container px-4 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-4">Choose Your Plan</h2>
          <p className="text-gray-400 text-lg">Start free and scale as you grow</p>
        </motion.div>
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {pricingPlans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              className={`relative rounded-2xl p-8 backdrop-blur-sm transition-all duration-300 ${
                plan.popular
                  ? "bg-blue-600/90 border-2 border-blue-400 shadow-lg shadow-blue-500/20"
                  : "bg-gray-900/90 border border-gray-800 hover:border-gray-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-400 ml-1">{plan.period}</span>
                  )}
                </div>
                <p className="text-gray-400">{plan.description}</p>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <motion.li 
                    key={feature} 
                    className="flex items-center text-gray-300"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
              <Button
                className={`w-full transition-all duration-300 ${
                  plan.popular
                    ? "bg-white text-blue-600 hover:bg-gray-100 hover:scale-105"
                    : "bg-blue-600 hover:bg-blue-700 hover:scale-105"
                }`}
              >
                {plan.buttonText}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
