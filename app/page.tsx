"use client";
import { Button } from "../components/ui/button";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Code2,
  Users,
  Zap,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Shield,
  BarChart3,
  Clock,
  Award,
  BookOpen,
  Terminal,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Mint</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                How It Works
              </a>
              <a
                href="#faq"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
              >
                FAQ
              </a>
            </nav>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => router.push("/auth/login")}
              >
                Sign In
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => router.push("/auth/register")}
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 md:px-6 relative">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                The Modern Coding Contest Platform
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
                Host Coding Contests
                <span className="block text-primary">That Inspire</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Create, manage, and run professional coding competitions with
                real-time evaluation, live leaderboards, and powerful analytics.
                Built for educators, organizations, and competitive programmers.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-lg px-8 h-12 gap-2"
                  onClick={() => router.push("/auth/register")}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 h-12"
                  onClick={() => router.push("/auth/login")}
                >
                  Sign In
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to
                <span className="text-primary"> Run Great Contests</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed for seamless contest management and
                exceptional participant experience.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Code2,
                  title: "Online Code Editor",
                  description:
                    "Full-featured code editor with syntax highlighting, auto-completion, and multi-language support.",
                },
                {
                  icon: Zap,
                  title: "Real-time Evaluation",
                  description:
                    "Instant code execution and test case validation with detailed feedback.",
                },
                {
                  icon: BarChart3,
                  title: "Live Leaderboards",
                  description:
                    "Real-time rankings with score updates, penalties, and performance tracking.",
                },
                {
                  icon: Users,
                  title: "Team Management",
                  description:
                    "Organize participants into groups, manage roles, and bulk import users.",
                },
                {
                  icon: Shield,
                  title: "Secure & Fair",
                  description:
                    "Plagiarism detection, secure code execution, and anti-cheat measures.",
                },
                {
                  icon: Clock,
                  title: "Flexible Scheduling",
                  description:
                    "Set registration periods, contest durations, and custom time limits.",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How It Works
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get started in minutes with our simple three-step process.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                {
                  step: "01",
                  icon: BookOpen,
                  title: "Create Problems",
                  description:
                    "Add coding problems with test cases, time limits, and detailed descriptions.",
                },
                {
                  step: "02",
                  icon: Trophy,
                  title: "Launch Contest",
                  description:
                    "Set up your contest with custom rules, invite participants, and go live.",
                },
                {
                  step: "03",
                  icon: Award,
                  title: "Track Results",
                  description:
                    "Monitor submissions, view analytics, and celebrate winners.",
                },
              ].map((item, index) => (
                <div key={index} className="text-center relative">
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
                  )}
                  <div className="relative inline-block mb-6">
                    <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                      <item.icon className="w-10 h-10 text-primary" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Got questions? We&apos;ve got answers.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: "What programming languages are supported?",
                  a: "We support Python, JavaScript, C++, Java, and many more. Our code execution engine handles most popular languages.",
                },
                {
                  q: "Can I import participants from a CSV file?",
                  a: "Yes! You can bulk import users via CSV. We'll automatically create accounts and send invitation emails.",
                },
                {
                  q: "Is there a limit on the number of problems?",
                  a: "No limits on problems! Create as many coding challenges as you need for your contests.",
                },
                {
                  q: "How secure is the code execution?",
                  a: "All code runs in isolated containers with strict resource limits. We prevent malicious code from affecting our systems.",
                },
                {
                  q: "Can I customize the platform with my branding?",
                  a: "Pro and Enterprise plans include custom branding options including logos, colors, and custom domains.",
                },
              ].map((faq, index) => (
                <Card
                  key={index}
                  className="hover:border-primary/30 transition-colors"
                >
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-2">{faq.q}</h3>
                    <p className="text-muted-foreground text-sm">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-primary/5">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <Terminal className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Host Your First Contest?
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Join thousands of organizations running successful coding
                competitions with Mint.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 h-12 gap-2"
                onClick={() => router.push("/auth/register")}
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">Mint</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modern coding contest platform for educators and organizations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#features"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    How It Works
                  </a>
                </li>
                <li>
                  <a
                    href="/api-doc"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    API Docs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/docs"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Documentation
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    FAQ
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Mint. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
