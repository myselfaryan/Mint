import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Dr. Sarah Johnson",
    role: "Computer Science Professor",
    content: "Pariksa has transformed how I manage programming assignments. The automated grading saves hours of work.",
    image: "/testimonials/sarah.jpg"
  },
  {
    name: "Alex Chen",
    role: "Student",
    content: "The instant feedback helps me learn faster. I can practice and improve without waiting for manual grading.",
    image: "/testimonials/alex.jpg"
  },
  {
    name: "Prof. Michael Brown",
    role: "Department Head",
    content: "We've implemented Pariksa across our department. It's improved both teaching efficiency and student engagement.",
    image: "/testimonials/michael.jpg"
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-white">What People Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gray-700 mb-4">
                  {/* Add actual images later */}
                </div>
                <blockquote className="mb-4 text-gray-300">"{testimonial.content}"</blockquote>
                <cite className="not-italic">
                  <div className="font-semibold text-white">{testimonial.name}</div>
                  <div className="text-gray-400">{testimonial.role}</div>
                </cite>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
