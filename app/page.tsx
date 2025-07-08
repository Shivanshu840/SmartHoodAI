"use client"

import { useState, useEffect } from "react"
import { motion, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  MapPin,
  Users,
  Search,
  Star,
  Shield,
  Home,
  Zap,
  ArrowRight,
  CheckCircle,
  Target,
  BarChart3,
  Sparkles,
  Globe,
  Clock,
} from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      name: "Priya Sharma",
      location: "Bangalore",
      text: "SmartHoodAI helped me find the perfect neighborhood in Koramangala that matches my startup lifestyle!",
      rating: 5,
    },
    {
      name: "Rajesh Kumar",
      location: "Mumbai",
      text: "The AI analysis was spot-on. Found a family-friendly area in Powai with great schools for my kids.",
      rating: 5,
    },
    {
      name: "Anita Patel",
      location: "Pune",
      text: "Saved months of research. The detailed cost breakdown and local insights were incredibly helpful.",
      rating: 5,
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartHoodAI
              </h1>
              <p className="text-sm text-gray-600 font-medium">Intelligent Neighborhood Discovery</p>
            </div>
          </motion.div>
          <nav className="flex items-center space-x-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
                asChild
              >
                <Link href="/assessment">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Get Started
                </Link>
              </Button>
            </motion.div>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10"></div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="container mx-auto px-4 text-center relative z-10"
        >
          <motion.div variants={itemVariants} className="mb-8">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-semibold bg-blue-100 text-blue-800">
              🚀 AI-Powered Neighborhood Matching
            </Badge>
          </motion.div>

          <motion.h2
            variants={itemVariants}
            className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Find Your Perfect
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Neighborhood Match
            </span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
            Discover neighborhoods in India that perfectly align with your lifestyle, preferences, and budget using our
            advanced AI analysis. Get personalized recommendations with detailed insights, cost breakdowns, and local
            tips.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-xl px-8 py-4 text-lg"
                asChild
              >
                <Link href="/assessment">
                  <Search className="mr-3 h-6 w-6" />
                  Start Free Assessment
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg bg-transparent"
              >
                <Globe className="mr-3 h-6 w-6" />
                View Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { number: "50+", label: "Cities Covered", icon: MapPin },
              { number: "10K+", label: "Neighborhoods Analyzed", icon: Home },
              { number: "95%", label: "Match Accuracy", icon: Target },
              { number: "5K+", label: "Happy Users", icon: Users },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border"
              >
                <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-semibold bg-indigo-100 text-indigo-800">
              How It Works
            </Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Three Simple Steps to Your Perfect Neighborhood</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered platform makes finding your ideal neighborhood effortless and accurate
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                step: "01",
                icon: Users,
                title: "Complete Assessment",
                description:
                  "Answer questions about your lifestyle, preferences, budget, and priorities. Our comprehensive assessment covers everything from commute preferences to family needs.",
                color: "blue",
                features: ["Personal Profile", "Lifestyle Factors", "Budget Analysis", "Priority Matrix"],
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Analysis",
                description:
                  "Our advanced AI processes your preferences against comprehensive neighborhood data including demographics, amenities, safety, and cost of living.",
                color: "indigo",
                features: ["Real-time Data", "Smart Matching", "Cost Analysis", "Safety Metrics"],
              },
              {
                step: "03",
                icon: MapPin,
                title: "Get Recommendations",
                description:
                  "Receive personalized neighborhood matches with detailed insights, cost breakdowns, local tips, and Google Maps integration for easy exploration.",
                color: "purple",
                features: ["Match Scores", "Detailed Reports", "Local Insights", "Maps Integration"],
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="relative"
              >
                <Card className="h-full shadow-xl border-0 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <CardHeader className="text-center pb-4">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <step.icon className="h-10 w-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 mb-3">{step.title}</CardTitle>
                    <CardDescription className="text-gray-600 text-base leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {step.features.map((feature, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-gray-700 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-semibold bg-blue-100 text-blue-800">
              Key Features
            </Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Why Choose SmartHoodAI?</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI technology meets comprehensive neighborhood data for unmatched accuracy
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI-Powered Matching",
                description: "Advanced algorithms analyze your preferences against comprehensive neighborhood data",
                color: "blue",
              },
              {
                icon: Shield,
                title: "Real-Time Data",
                description: "Up-to-date information on safety, amenities, costs, and local insights",
                color: "green",
              },
              {
                icon: BarChart3,
                title: "Detailed Analytics",
                description: "Comprehensive reports with match scores, cost breakdowns, and lifestyle metrics",
                color: "purple",
              },
              {
                icon: MapPin,
                title: "Maps Integration",
                description: "Seamless Google Maps integration for easy neighborhood exploration",
                color: "red",
              },
              {
                icon: Clock,
                title: "Time-Saving",
                description: "Skip months of research with instant, personalized recommendations",
                color: "orange",
              },
              {
                icon: Zap,
                title: "Instant Results",
                description: "Get your neighborhood matches in minutes, not weeks",
                color: "indigo",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="h-full shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-semibold bg-green-100 text-green-800">
              Success Stories
            </Badge>
            <h3 className="text-4xl font-bold text-gray-900 mb-4">What Our Users Say</h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of satisfied users who found their perfect neighborhoods
            </p>
          </motion.div>

          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
              <CardContent className="p-12 text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl text-gray-800 font-medium mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                <div>
                  <div className="font-bold text-gray-900 text-lg">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-600">{testimonials[currentTestimonial].location}</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 text-center"
        >
          <h3 className="text-4xl font-bold mb-6">Ready to Find Your Perfect Neighborhood?</h3>
          <p className="text-xl mb-12 max-w-3xl mx-auto opacity-90">
            Join thousands of users who have discovered their ideal neighborhoods with SmartHoodAI. Start your free
            assessment today and get personalized recommendations in minutes.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-xl px-12 py-4 text-lg"
              asChild
            >
              <Link href="/assessment">
                <Sparkles className="mr-3 h-6 w-6" />
                Start Your Free Assessment
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    SmartHoodAI
                  </h4>
                  <p className="text-gray-400 text-sm">Intelligent Neighborhood Discovery</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Discover your perfect neighborhood with AI-powered analysis. Get personalized recommendations based on
                your lifestyle, preferences, and budget.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Product</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/assessment" className="hover:text-white transition-colors">
                    Assessment
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SmartHoodAI. All rights reserved. Find Your Perfect Neighborhood Match.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
