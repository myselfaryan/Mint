"use client";
import { Button } from "../components/ui/button";
import { FAQ } from "../components/landing/faq";
import { VortexDemo } from "../components/landing/vortex-demo";
import { Features } from "../components/landing/features";
import { GeminiSection } from "../components/landing/gemini-section";
import { AboutUs } from "../components/landing/about-us";
import { Pricing } from "../components/landing/pricing";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="#" className="text-xl font-bold text-white">
                Pariksa
              </a>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a
                href="#features"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-gray-300 hover:text-white transition-colors"
              >
                How It Works
              </a>
              <a
                href="#pricing"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <a
                href="#faq"
                className="text-gray-300 hover:text-white transition-colors"
              >
                FAQ
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-gray-300 hover:text-white hover:bg-gray-800"
                onClick={() => router.push("/auth")}
              >
                Sign In
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push("/auth?mode=register")}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section with Vortex */}
        <section className="h-screen">
          <VortexDemo />
        </section>

        {/* Gemini Effect Section */}
        <GeminiSection />

        {/* About Us Section */}
        <section className="relative bg-black">
          <AboutUs />
        </section>

        {/* Features Section */}
        <section className="relative bg-black">
          <Features />
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="relative bg-black py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Create Assignment
                </h3>
                <p className="text-gray-400">
                  Set up coding problems with test cases and requirements
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Students Code</h3>
                <p className="text-gray-400">
                  Students write and submit their solutions
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Automated Evaluation
                </h3>
                <p className="text-gray-400">
                  Get instant feedback and detailed analysis
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="relative bg-black py-20">
          <Pricing />
        </section>

        {/* FAQ Section */}
        <section id="faq" className="relative bg-black py-20">
          <FAQ />
        </section>
      </main>

      {/* Footer */}
      <footer className="relative bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>
              &copy; {new Date().getFullYear()} Pariksa. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
