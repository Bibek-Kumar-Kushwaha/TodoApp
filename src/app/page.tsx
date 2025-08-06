import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckSquare,
  Calendar,
  Search,
  Smartphone,
  Zap,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: CheckSquare,
      title: "Smart Task Management",
      description:
        "Organize tasks with priorities, categories, and due dates. Never miss an important deadline again.",
    },
    {
      icon: Search,
      title: "Powerful Search & Filter",
      description:
        "Find any task instantly with our advanced search and filtering capabilities.",
    },
    {
      icon: Calendar,
      title: "Due Date Tracking",
      description:
        "Keep track of deadlines with smart due date reminders and overdue notifications.",
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description:
        "Works seamlessly across all devices - desktop, tablet, and mobile.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Built with Next.js and optimized for speed and performance.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
              Organize Your Life with{" "}
              <span className="text-primary">TodoApp</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              A modern, feature-rich todo application that helps you stay
              productive. With multi-language support, smart filtering, and
              beautiful design.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/todos">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8"
              >
                <Link href="/register">Create Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to stay organized
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you manage tasks efficiently
              and boost your productivity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader>
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to boost your productivity?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who have already organized their lives with
            TodoApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-lg px-8"
            >
              <Link href="/register">Start Free Today</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-lg px-8 bg-primary-foreground text-primary"
            >
              <Link href="/todos">Try Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
