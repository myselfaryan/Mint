import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const plans = [
  {
    name: "Free",
    price: "0",
    description: "Perfect for students and small projects",
    features: [
      "Up to 5 active assignments",
      "Basic code evaluation",
      "Student discussion forum",
      "Email support"
    ]
  },
  {
    name: "Premium",
    price: "29",
    description: "Ideal for educators and institutions",
    features: [
      "Unlimited assignments",
      "Advanced code evaluation",
      "Priority support",
      "Custom test cases",
      "Plagiarism detection",
      "Analytics dashboard"
    ]
  },
  {
    name: "Enterprise",
    price: "Contact us",
    description: "Tailored for large organizations",
    features: [
      "Custom integration",
      "Dedicated support",
      "SLA guarantee",
      "Custom features",
      "Training sessions",
      "White-labeling options"
    ]
  }
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`p-6 ${index === 1 ? 'bg-blue-900 border-blue-700' : 'bg-gray-800 border-gray-700'} hover:scale-105 transition-all duration-200`}>
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                <div className="text-4xl font-bold mb-4 text-white">
                  {typeof plan.price === "number" ? `$${plan.price}` : plan.price}
                  {typeof plan.price === "number" && <span className="text-base font-normal text-gray-300">/month</span>}
                </div>
                <p className="text-gray-300 mb-6">{plan.description}</p>
                <ul className="space-y-3 text-left mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    index === 1 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                >
                  {index === 2 ? "Contact Sales" : "Get Started"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
