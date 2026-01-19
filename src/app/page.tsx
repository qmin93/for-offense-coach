"use client";

import Link from "next/link";
import {
  MousePointer2,
  Grid3X3,
  Route,
  Shield,
  Download,
  Target,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HeroField, FeatureCard, UseCaseCard, InteractiveDemo } from "@/components/landing";

// ============================================
// Feature data
// ============================================

const features = [
  {
    icon: MousePointer2,
    title: "Drag & Drop Editor",
    description: "Move players anywhere on the field with intuitive controls",
  },
  {
    icon: Grid3X3,
    title: "Formation Library",
    description: "Pre-built formations: Doubles, Trips, I-Form, Empty, and more",
  },
  {
    icon: Route,
    title: "Concept Templates",
    description: "Apply run & pass concepts with one click: Zone, Power, Mesh, Flood",
  },
  {
    icon: Shield,
    title: "Defense Presets",
    description: "Test against 4-3, 3-4, Nickel, Cover 1, Cover 3 defenses",
  },
  {
    icon: Download,
    title: "Instant Export",
    description: "Export to PNG or PDF for practice scripts and playbooks",
  },
  {
    icon: Target,
    title: "Install Focus",
    description: "Built-in drill suggestions and coaching points for each concept",
  },
];

const useCases = [
  {
    icon: "🏈",
    title: "Youth Football",
    description: "Simple drag-and-drop for new coaches",
  },
  {
    icon: "🎓",
    title: "High School",
    description: "Full playbook management and export",
  },
  {
    icon: "🏟️",
    title: "College/Pro",
    description: "Advanced concepts and defense simulation",
  },
];

// ============================================
// Main Landing Page
// ============================================

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-0 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FC</span>
              </div>
              <span className="font-bold text-lg text-foreground">ForOffenseCoach</span>
            </div>
            <Link href="/editor/new">
              <Button variant="hero" size="sm">
                Start Designing
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Content */}
            <div className="space-y-8">
              <div className="flex gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-xs">
                  Free to Use
                </Badge>
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30 font-mono text-xs">
                  No Sign-up Required
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
                Design Plays Like a{" "}
                <span className="text-gradient">Pro Coach</span>
              </h1>

              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Intuitive football play designer with formations, concepts, and instant export. Build your playbook in minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/editor/new">
                  <Button variant="hero" size="xl">
                    Start Designing
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="group">
                  <Play className="w-5 h-5 text-accent group-hover:text-accent" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-mono">500+ Active Coaches</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono">10K+ Plays Created</span>
                </div>
              </div>
            </div>

            {/* Right - Hero Field Animation */}
            <div className="relative">
              <HeroField />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to{" "}
              <span className="text-gradient">Design Winning Plays</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Powerful features designed specifically for football coaches at every level
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <InteractiveDemo />

      {/* Use Cases */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Coaches at{" "}
              <span className="text-gradient">Every Level</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From youth leagues to professional teams, our tools scale with your needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {useCases.map((useCase) => (
              <UseCaseCard
                key={useCase.title}
                icon={useCase.icon}
                title={useCase.title}
                description={useCase.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="gradient-border p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Build Your{" "}
              <span className="text-gradient">Playbook</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
              Join thousands of coaches already designing winning plays with ForOffenseCoach
            </p>
            <Link href="/editor/new">
              <Button variant="cta" size="xl" className="mb-6">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground font-mono">
              No account required • Works in browser • Mobile friendly
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Logo and tagline */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">FC</span>
                </div>
                <span className="font-bold text-lg text-foreground">ForOffenseCoach</span>
              </div>
              <p className="text-muted-foreground text-sm mb-4 max-w-sm">
                Football Play Designer - Create professional play diagrams and build your complete playbook with ease.
              </p>
              <p className="text-sm text-muted-foreground/60 font-mono">
                Made for coaches, by coaches
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="#demo" className="hover:text-primary transition-colors">Demo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 ForOffenseCoach. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center hover:bg-primary/20 transition-colors">
                <span className="sr-only">YouTube</span>
                <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
