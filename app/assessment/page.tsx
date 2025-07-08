"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Plus, X, Brain } from "lucide-react"
import { useRouter } from "next/navigation"

interface AssessmentData {
  personalProfile: {
    ageRange: string
    householdSize: string
    income: string
    hasChildren: boolean
    hasPets: boolean
    childrenAges?: string[]
    childrenNeeds?: string[]
  }
  locationPreferences: {
    city: string
    state: string
    preferredAreas?: string[]
    customAreas?: string[]
  }
  lifestyleFactors: {
    workLocation: string
    commutePreference: string
    activityLevel: number[]
    socialPreference: number[]
    noisePreference: number[]
  }
  neighborhoodPriorities: {
    safety: number[]
    schools: number[]
    nightlife: number[]
    outdoorAccess: number[]
    publicTransit: number[]
    walkability: number[]
    costOfLiving: number[]
    diversity: number[]
  }
  essentialAmenities: string[]
  customAmenities: string[]
  dealBreakers: string[]
  customDealBreakers: string[]
}

interface LocationSuggestion {
  name: string
  description: string
  matchScore: number
  highlights: string[]
  considerations: string[]
}

const assessmentSteps = [
  {
    id: "personalProfile",
    title: "Personal Profile",
    description: "Basic information about you and your household",
    icon: "👤",
  },
  {
    id: "locationPreferences",
    title: "Geographic Preferences",
    description: "Target cities and preferred areas",
    icon: "🗺️",
  },
  {
    id: "lifestyleFactors",
    title: "Lifestyle Assessment",
    description: "Daily routines and personal preferences",
    icon: "🏃",
  },
  {
    id: "neighborhoodPriorities",
    title: "Priority Matrix",
    description: "Rate the importance of key neighborhood factors",
    icon: "⭐",
  },
  {
    id: "essentialAmenities",
    title: "Amenity Requirements",
    description: "Must-have facilities and services nearby",
    icon: "🏪",
  },
  {
    id: "finalReview",
    title: "Assessment Summary",
    description: "Review and confirm your preferences",
    icon: "📋",
  },
]

const priorityLabels = {
  safety: "Safety & Security",
  schools: "Educational Quality",
  nightlife: "Entertainment & Nightlife",
  outdoorAccess: "Parks & Recreation",
  publicTransit: "Public Transportation",
  walkability: "Walkability Score",
  costOfLiving: "Affordability",
  diversity: "Cultural Diversity",
}

export default function SmartHoodAssessment() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([])
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  const [customAmenity, setCustomAmenity] = useState("")
  const [customDealBreaker, setCustomDealBreaker] = useState("")
  const [error, setError] = useState<string | null>(null)

  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    personalProfile: {
      ageRange: "",
      householdSize: "",
      income: "",
      hasChildren: false,
      hasPets: false,
      childrenAges: [],
      childrenNeeds: [],
    },
    locationPreferences: {
      city: "",
      state: "",
      preferredAreas: [],
      customAreas: [],
    },
    lifestyleFactors: {
      workLocation: "",
      commutePreference: "",
      activityLevel: [5],
      socialPreference: [5],
      noisePreference: [5],
    },
    neighborhoodPriorities: {
      safety: [8],
      schools: [5],
      nightlife: [5],
      outdoorAccess: [7],
      publicTransit: [6],
      walkability: [7],
      costOfLiving: [8],
      diversity: [6],
    },
    essentialAmenities: [],
    customAmenities: [],
    dealBreakers: [],
    customDealBreakers: [],
  })

  const saveAssessmentData = (data: AssessmentData) => {
    try {
      localStorage.setItem(
        "smartHoodAssessmentDraft",
        JSON.stringify({
          ...data,
          lastSaved: new Date().toISOString(),
          currentStep: currentStep,
        }),
      )
    } catch (error) {
      console.error("Failed to save assessment data:", error)
    }
  }

  useEffect(() => {
    try {
      const savedData = localStorage.getItem("smartHoodAssessmentDraft")
      if (savedData) {
        const parsed = JSON.parse(savedData)
        setAssessmentData(parsed)
        if (parsed.currentStep && parsed.currentStep < assessmentSteps.length) {
          setCurrentStep(parsed.currentStep)
        }
      }
    } catch (error) {
      console.error("Failed to load saved assessment data:", error)
    }
  }, [])

  const updateAssessmentData = (section: keyof AssessmentData, data: any) => {
    const newData = {
      ...assessmentData,
      [section]: Array.isArray(data) ? data : { ...assessmentData[section], ...data },
    }
    setAssessmentData(newData)
    saveAssessmentData(newData) // Auto-save on every change
  }

  const addCustomAmenity = () => {
    if (customAmenity.trim()) {
      updateAssessmentData("customAmenities", [...assessmentData.customAmenities, customAmenity.trim()])
      setCustomAmenity("")
    }
  }

  const addCustomDealBreaker = () => {
    if (customDealBreaker.trim()) {
      updateAssessmentData("customDealBreakers", [...assessmentData.customDealBreakers, customDealBreaker.trim()])
      setCustomDealBreaker("")
    }
  }

  const removeCustomItem = (section: "customAmenities" | "customDealBreakers", item: string) => {
    updateAssessmentData(
      section,
      assessmentData[section].filter((i) => i !== item),
    )
  }

  const generateLocationSuggestions = async () => {
    setIsGeneratingSuggestions(true)
    try {
      console.log("Sending assessment data for suggestions:", assessmentData)

      const response = await fetch("/api/generate-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assessmentData),
      })

      console.log("Suggestions API response status:", response.status)

      if (response.ok) {
        const suggestions = await response.json()
        console.log("Suggestions received:", suggestions)

        // Check if we got an error in the response
        if (suggestions.error) {
          console.error("Suggestions API returned error:", suggestions.error)
          setLocationSuggestions(getFallbackSuggestions())
        } else {
          setLocationSuggestions(suggestions)
        }
      } else {
        const errorText = await response.text()
        console.error("Suggestions API response not ok:", response.status, errorText)
        setLocationSuggestions(getFallbackSuggestions())
      }
    } catch (error) {
      console.error("Error generating suggestions:", error)
      setLocationSuggestions(getFallbackSuggestions())
    } finally {
      setIsGeneratingSuggestions(false)
    }
  }

  const getFallbackSuggestions = () => [
    {
      name: "Central Business District",
      description: "A vibrant urban area with excellent connectivity and modern amenities.",
      matchScore: 85,
      highlights: ["Excellent public transportation", "Modern amenities", "Business connectivity"],
      considerations: ["Higher cost of living", "Can be crowded"],
    },
    {
      name: "Residential Suburbs",
      description: "A peaceful area perfect for families with good schools and community feel.",
      matchScore: 80,
      highlights: ["Family-friendly", "Good schools", "Safe environment"],
      considerations: ["Longer commute", "Limited nightlife"],
    },
  ]

  const validateAssessmentData = () => {
    const requiredFields = [
      { field: assessmentData.personalProfile.ageRange, name: "Age Range" },
      { field: assessmentData.personalProfile.householdSize, name: "Household Size" },
      { field: assessmentData.personalProfile.income, name: "Income" },
      { field: assessmentData.locationPreferences.city, name: "City" },
      { field: assessmentData.locationPreferences.state, name: "State" },
    ]

    const missingFields = requiredFields.filter(({ field }) => !field || field.trim() === "")

    if (missingFields.length > 0) {
      setError(`Please complete the following required fields: ${missingFields.map((f) => f.name).join(", ")}`)
      return false
    }

    return true
  }

  const handleNext = async () => {
    // Validate required fields before proceeding to final review
    if (currentStep === 4) {
      if (!validateAssessmentData()) {
        setError("Please complete all required fields before proceeding.")
        return
      }
    }

    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setError(null) // Clear any previous errors
    } else {
      // Final step - save data and go to results
      const finalData = {
        ...assessmentData,
        completedAt: new Date().toISOString(),
        assessmentVersion: "2.0",
      }
      localStorage.setItem("smartHoodAssessment", JSON.stringify(finalData))
      router.push("/results")
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = ((currentStep + 1) / assessmentSteps.length) * 100

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.3 },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg"
            >
              <Brain className="h-7 w-7 text-white" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartHoodAI
              </h1>
              <p className="text-sm text-gray-600 font-medium">Intelligent Neighborhood Discovery Platform</p>
            </div>
          </div>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full border shadow-sm"
          >
            Step {currentStep + 1} of {assessmentSteps.length}
          </motion.div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Enhanced Progress Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="bg-white rounded-2xl p-6 shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Assessment Progress</h2>
              <span className="text-sm font-medium text-blue-600">{Math.round(progress)}% Complete</span>
            </div>

            <div className="relative">
              <Progress value={progress} className="h-3 bg-gray-100 rounded-full" />
              <motion.div
                className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>

            <div className="flex justify-between mt-6 overflow-x-auto">
              {assessmentSteps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`text-center min-w-[100px] ${index <= currentStep ? "text-blue-600" : "text-gray-400"}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-medium transition-all duration-300 ${
                      index < currentStep
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg"
                        : index === currentStep
                          ? "bg-blue-100 text-blue-600 border-2 border-blue-500 shadow-md"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {index < currentStep ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </motion.div>
                  <div className="text-xs font-semibold">{step.title}</div>
                  <div className="text-xs text-gray-500 mt-1 hidden md:block">{step.description}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div key={currentStep} variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b">
                <motion.div variants={itemVariants}>
                  <CardTitle className="text-2xl text-gray-800 flex items-center space-x-3">
                    <span className="text-2xl">{assessmentSteps[currentStep].icon}</span>
                    <span>{assessmentSteps[currentStep].title}</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-base mt-2">
                    {assessmentSteps[currentStep].description}
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent className="p-8">
                {currentStep === 0 && (
                  <motion.div variants={itemVariants} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700">Age Range</Label>
                        <Select
                          value={assessmentData.personalProfile.ageRange}
                          onValueChange={(value) => updateAssessmentData("personalProfile", { ageRange: value })}
                        >
                          <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors">
                            <SelectValue placeholder="Select your age range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="18-25">18-25 years</SelectItem>
                            <SelectItem value="26-35">26-35 years</SelectItem>
                            <SelectItem value="36-45">36-45 years</SelectItem>
                            <SelectItem value="46-55">46-55 years</SelectItem>
                            <SelectItem value="56-65">56-65 years</SelectItem>
                            <SelectItem value="65+">65+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700">Household Composition</Label>
                        <Select
                          value={assessmentData.personalProfile.householdSize}
                          onValueChange={(value) => updateAssessmentData("personalProfile", { householdSize: value })}
                        >
                          <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors">
                            <SelectValue placeholder="Select household size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Single Person</SelectItem>
                            <SelectItem value="2">Couple/Two Adults</SelectItem>
                            <SelectItem value="3">Small Family (3 people)</SelectItem>
                            <SelectItem value="4">Medium Family (4 people)</SelectItem>
                            <SelectItem value="5+">Large Family (5+ people)</SelectItem>
                          </SelectContent>
                        </Select>
                      </motion.div>
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700">Annual Household Income</Label>
                      <Select
                        value={assessmentData.personalProfile.income}
                        onValueChange={(value) => updateAssessmentData("personalProfile", { income: value })}
                      >
                        <SelectTrigger className="h-12 border-2 hover:border-blue-300 transition-colors">
                          <SelectValue placeholder="Select income bracket" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="<5L">Below ₹5,00,000</SelectItem>
                          <SelectItem value="5L-10L">₹5,00,000 - ₹10,00,000</SelectItem>
                          <SelectItem value="10L-15L">₹10,00,000 - ₹15,00,000</SelectItem>
                          <SelectItem value="15L-25L">₹15,00,000 - ₹25,00,000</SelectItem>
                          <SelectItem value="25L-50L">₹25,00,000 - ₹50,00,000</SelectItem>
                          <SelectItem value="50L+">Above ₹50,00,000</SelectItem>
                        </SelectContent>
                      </Select>
                    </motion.div>

                    <div className="space-y-6">
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center space-x-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-100"
                      >
                        <Checkbox
                          id="children"
                          checked={assessmentData.personalProfile.hasChildren}
                          onCheckedChange={(checked) =>
                            updateAssessmentData("personalProfile", { hasChildren: checked })
                          }
                          className="w-5 h-5"
                        />
                        <Label htmlFor="children" className="text-base font-semibold text-gray-700">
                          I have children living at home
                        </Label>
                      </motion.div>

                      <AnimatePresence>
                        {assessmentData.personalProfile.hasChildren && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="ml-6 space-y-6 p-6 bg-blue-25 rounded-xl border-l-4 border-blue-400"
                          >
                            <div>
                              <Label className="text-base font-semibold text-gray-700 mb-4 block">
                                Children's Age Groups
                              </Label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {["Infant (0-2)", "Toddler (3-5)", "School Age (6-12)", "Teen (13-18)"].map((age) => (
                                  <motion.div
                                    key={age}
                                    whileHover={{ scale: 1.05 }}
                                    className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm"
                                  >
                                    <Checkbox
                                      id={age}
                                      checked={assessmentData.personalProfile.childrenAges?.includes(age)}
                                      onCheckedChange={(checked) => {
                                        const current = assessmentData.personalProfile.childrenAges || []
                                        if (checked) {
                                          updateAssessmentData("personalProfile", { childrenAges: [...current, age] })
                                        } else {
                                          updateAssessmentData("personalProfile", {
                                            childrenAges: current.filter((a) => a !== age),
                                          })
                                        }
                                      }}
                                    />
                                    <Label htmlFor={age} className="text-sm font-medium">
                                      {age}
                                    </Label>
                                  </motion.div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Label className="text-base font-semibold text-gray-700 mb-4 block">
                                Child-Specific Requirements
                              </Label>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                  "Top-rated schools",
                                  "Safe playgrounds",
                                  "Pediatric healthcare",
                                  "After-school programs",
                                  "Family restaurants",
                                  "Child-safe streets",
                                ].map((need) => (
                                  <motion.div
                                    key={need}
                                    whileHover={{ scale: 1.02 }}
                                    className="flex items-center space-x-2 p-3 bg-white rounded-lg shadow-sm"
                                  >
                                    <Checkbox
                                      id={need}
                                      checked={assessmentData.personalProfile.childrenNeeds?.includes(need)}
                                      onCheckedChange={(checked) => {
                                        const current = assessmentData.personalProfile.childrenNeeds || []
                                        if (checked) {
                                          updateAssessmentData("personalProfile", { childrenNeeds: [...current, need] })
                                        } else {
                                          updateAssessmentData("personalProfile", {
                                            childrenNeeds: current.filter((n) => n !== need),
                                          })
                                        }
                                      }}
                                    />
                                    <Label htmlFor={need} className="text-sm font-medium">
                                      {need}
                                    </Label>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center space-x-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-100"
                      >
                        <Checkbox
                          id="pets"
                          checked={assessmentData.personalProfile.hasPets}
                          onCheckedChange={(checked) => updateAssessmentData("personalProfile", { hasPets: checked })}
                          className="w-5 h-5"
                        />
                        <Label htmlFor="pets" className="text-base font-semibold text-gray-700">
                          I have pets
                        </Label>
                      </motion.div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div variants={itemVariants} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700">Target City</Label>
                        <Input
                          placeholder="Enter your preferred city"
                          value={assessmentData.locationPreferences.city}
                          onChange={(e) => updateAssessmentData("locationPreferences", { city: e.target.value })}
                          className="h-12 border-2 hover:border-blue-300 transition-colors"
                        />
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} className="space-y-3">
                        <Label className="text-base font-semibold text-gray-700">State/Region</Label>
                        <Input
                          placeholder="Enter your state"
                          value={assessmentData.locationPreferences.state}
                          onChange={(e) => updateAssessmentData("locationPreferences", { state: e.target.value })}
                          className="h-12 border-2 hover:border-blue-300 transition-colors"
                        />
                      </motion.div>
                    </div>

                    <motion.div whileHover={{ scale: 1.01 }} className="space-y-3">
                      <Label className="text-base font-semibold text-gray-700">
                        Preferred Neighborhoods (Optional)
                      </Label>
                      <Textarea
                        placeholder="List any specific neighborhoods, areas, or localities you're interested in..."
                        value={assessmentData.locationPreferences.preferredAreas?.join(", ") || ""}
                        onChange={(e) =>
                          updateAssessmentData("locationPreferences", {
                            preferredAreas: e.target.value
                              .split(",")
                              .map((area) => area.trim())
                              .filter(Boolean),
                          })
                        }
                        className="min-h-[100px] border-2 hover:border-blue-300 transition-colors resize-none"
                        rows={4}
                      />
                      <p className="text-sm text-gray-500">Separate multiple areas with commas</p>
                    </motion.div>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div variants={itemVariants} className="space-y-8">
                    <div className="space-y-6">
                      <div>
                        <Label className="text-lg font-semibold text-gray-800 mb-4 block">Work Environment</Label>
                        <RadioGroup
                          value={assessmentData.lifestyleFactors.workLocation}
                          onValueChange={(value) => updateAssessmentData("lifestyleFactors", { workLocation: value })}
                          className="space-y-3"
                        >
                          {[
                            {
                              value: "downtown",
                              label: "Central Business District",
                              desc: "City center, corporate offices",
                            },
                            { value: "suburbs", label: "Suburban Office Parks", desc: "Quieter business areas" },
                            { value: "remote", label: "Remote Work", desc: "Work from home primarily" },
                            {
                              value: "flexible",
                              label: "Hybrid/Flexible",
                              desc: "Multiple locations or flexible schedule",
                            },
                          ].map((option) => (
                            <motion.div
                              key={option.value}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 border-2 border-transparent hover:border-blue-100 transition-all"
                            >
                              <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                              <div>
                                <Label htmlFor={option.value} className="font-semibold text-gray-700">
                                  {option.label}
                                </Label>
                                <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                              </div>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-lg font-semibold text-gray-800 mb-4 block">Commute Preference</Label>
                        <RadioGroup
                          value={assessmentData.lifestyleFactors.commutePreference}
                          onValueChange={(value) =>
                            updateAssessmentData("lifestyleFactors", { commutePreference: value })
                          }
                          className="space-y-3"
                        >
                          {[
                            { value: "walk", label: "Walking", desc: "Prefer to walk to work/amenities" },
                            { value: "bike", label: "Cycling", desc: "Bike-friendly routes and infrastructure" },
                            { value: "transit", label: "Public Transportation", desc: "Metro, bus, or train systems" },
                            { value: "drive", label: "Personal Vehicle", desc: "Car with parking availability" },
                          ].map((option) => (
                            <motion.div
                              key={option.value}
                              whileHover={{ scale: 1.02 }}
                              className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 border-2 border-transparent hover:border-blue-100 transition-all"
                            >
                              <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                              <div>
                                <Label htmlFor={option.value} className="font-semibold text-gray-700">
                                  {option.label}
                                </Label>
                                <p className="text-sm text-gray-500 mt-1">{option.desc}</p>
                              </div>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {[
                        {
                          key: "activityLevel",
                          label: "Activity Level",
                          description: "How active is your lifestyle?",
                          lowLabel: "Homebody",
                          highLabel: "Very Active",
                          gradient: "from-blue-50 to-indigo-50",
                        },
                        {
                          key: "socialPreference",
                          label: "Social Preference",
                          description: "How much social interaction do you prefer?",
                          lowLabel: "Private",
                          highLabel: "Very Social",
                          gradient: "from-green-50 to-emerald-50",
                        },
                        {
                          key: "noisePreference",
                          label: "Noise Tolerance",
                          description: "How much ambient noise can you tolerate?",
                          lowLabel: "Need Quiet",
                          highLabel: "Don't Mind Noise",
                          gradient: "from-purple-50 to-pink-50",
                        },
                      ].map((item) => (
                        <motion.div
                          key={item.key}
                          whileHover={{ scale: 1.01 }}
                          className={`p-6 bg-gradient-to-r ${item.gradient} rounded-xl border shadow-sm`}
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <Label className="text-base font-semibold text-gray-800">{item.label}</Label>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className="bg-white px-4 py-2 rounded-full shadow-sm border"
                            >
                              <span className="text-lg font-bold text-blue-600">
                                {
                                  assessmentData.lifestyleFactors[
                                    item.key as keyof typeof assessmentData.lifestyleFactors
                                  ][0]
                                }
                              </span>
                              <span className="text-sm text-gray-500">/10</span>
                            </motion.div>
                          </div>

                          <div className="space-y-3">
                            <Slider
                              value={
                                assessmentData.lifestyleFactors[
                                  item.key as keyof typeof assessmentData.lifestyleFactors
                                ]
                              }
                              onValueChange={(value) => updateAssessmentData("lifestyleFactors", { [item.key]: value })}
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 font-medium">
                              <span>{item.lowLabel}</span>
                              <span>{item.highLabel}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div variants={itemVariants} className="space-y-8">
                    <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border">
                      <h3 className="text-lg font-bold text-gray-800 mb-2">Neighborhood Priority Assessment</h3>
                      <p className="text-gray-600">
                        Rate each factor based on its importance to your ideal neighborhood
                      </p>
                      <div className="flex justify-center space-x-8 mt-4 text-sm">
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <span>1-3: Low Priority</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <span>4-7: Medium Priority</span>
                        </span>
                        <span className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                          <span>8-10: High Priority</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-6">
                      {Object.entries(assessmentData.neighborhoodPriorities).map(([key, value], index) => (
                        <motion.div
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.01 }}
                          className="p-6 bg-white border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <Label className="text-lg font-semibold text-gray-800">
                                {priorityLabels[key as keyof typeof priorityLabels]}
                              </Label>
                            </div>
                            <motion.div
                              whileHover={{ scale: 1.1 }}
                              className={`px-4 py-2 rounded-full text-white font-bold text-lg shadow-sm ${
                                value[0] <= 3 ? "bg-red-400" : value[0] <= 7 ? "bg-yellow-400" : "bg-green-400"
                              }`}
                            >
                              {value[0]}
                            </motion.div>
                          </div>

                          <div className="space-y-3">
                            <Slider
                              value={value}
                              onValueChange={(newValue) =>
                                updateAssessmentData("neighborhoodPriorities", { [key]: newValue })
                              }
                              max={10}
                              min={1}
                              step={1}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 font-medium">
                              <span>Not Important</span>
                              <span>Extremely Important</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div variants={itemVariants} className="space-y-8">
                    <div>
                      <Label className="text-xl font-bold text-gray-800 mb-4 block">Essential Amenities</Label>
                      <p className="text-gray-600 mb-6">Select amenities that are important for your daily life</p>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                        {[
                          "Grocery stores",
                          "Restaurants",
                          "Coffee shops",
                          "Gyms/Fitness centers",
                          "Parks & Recreation",
                          "Libraries",
                          "Shopping centers",
                          "Movie theaters",
                          "Hospitals/Healthcare",
                          "Banks & ATMs",
                          "Gas stations",
                          "Pharmacies",
                          ...(assessmentData.personalProfile.hasChildren
                            ? ["Quality schools", "Daycare centers", "Playgrounds", "Pediatric care"]
                            : []),
                          ...(assessmentData.personalProfile.hasPets
                            ? ["Pet services", "Dog parks", "Veterinary clinics"]
                            : []),
                          "Public pools",
                          "Community centers",
                          "Places of worship",
                        ].map((amenity) => (
                          <motion.div
                            key={amenity}
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-50 border-2 border-transparent hover:border-blue-200 transition-all"
                          >
                            <Checkbox
                              id={amenity}
                              checked={assessmentData.essentialAmenities.includes(amenity)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateAssessmentData("essentialAmenities", [
                                    ...assessmentData.essentialAmenities,
                                    amenity,
                                  ])
                                } else {
                                  updateAssessmentData(
                                    "essentialAmenities",
                                    assessmentData.essentialAmenities.filter((a) => a !== amenity),
                                  )
                                }
                              }}
                            />
                            <Label htmlFor={amenity} className="text-sm font-medium cursor-pointer">
                              {amenity}
                            </Label>
                          </motion.div>
                        ))}
                      </div>

                      {/* Custom Amenities */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border">
                        <Label className="text-base font-semibold text-gray-800 mb-3 block">Add Custom Amenities</Label>
                        <div className="flex space-x-3 mb-4">
                          <Input
                            placeholder="Enter custom amenity..."
                            value={customAmenity}
                            onChange={(e) => setCustomAmenity(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addCustomAmenity()}
                            className="flex-1"
                          />
                          <Button onClick={addCustomAmenity} size="sm" className="px-4">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {assessmentData.customAmenities.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {assessmentData.customAmenities.map((amenity, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border shadow-sm"
                              >
                                <span className="text-sm font-medium">{amenity}</span>
                                <button
                                  onClick={() => removeCustomItem("customAmenities", amenity)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-xl font-bold text-red-600 mb-4 block">Deal Breakers</Label>
                      <p className="text-gray-600 mb-6">
                        Select factors that would eliminate a neighborhood from consideration
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {[
                          "High crime rate",
                          "Poor public transportation",
                          "No parking available",
                          "Long commute (>1 hour)",
                          "Very expensive cost of living",
                          "No outdoor spaces/parks",
                          "Too noisy/busy",
                          "Limited dining options",
                          "Poor walkability",
                          "Frequent power outages",
                          "Poor internet connectivity",
                          ...(assessmentData.personalProfile.hasChildren ? ["Poor school ratings"] : []),
                        ].map((dealBreaker) => (
                          <motion.div
                            key={dealBreaker}
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 border-2 border-transparent hover:border-red-200 transition-all"
                          >
                            <Checkbox
                              id={dealBreaker}
                              checked={assessmentData.dealBreakers.includes(dealBreaker)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  updateAssessmentData("dealBreakers", [...assessmentData.dealBreakers, dealBreaker])
                                } else {
                                  updateAssessmentData(
                                    "dealBreakers",
                                    assessmentData.dealBreakers.filter((d) => d !== dealBreaker),
                                  )
                                }
                              }}
                            />
                            <Label htmlFor={dealBreaker} className="text-sm font-medium cursor-pointer">
                              {dealBreaker}
                            </Label>
                          </motion.div>
                        ))}
                      </div>

                      {/* Custom Deal Breakers */}
                      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border">
                        <Label className="text-base font-semibold text-gray-800 mb-3 block">
                          Add Custom Deal Breakers
                        </Label>
                        <div className="flex space-x-3 mb-4">
                          <Input
                            placeholder="Enter custom deal breaker..."
                            value={customDealBreaker}
                            onChange={(e) => setCustomDealBreaker(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addCustomDealBreaker()}
                            className="flex-1"
                          />
                          <Button onClick={addCustomDealBreaker} size="sm" className="px-4">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {assessmentData.customDealBreakers.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {assessmentData.customDealBreakers.map((dealBreaker, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center space-x-2 bg-white px-3 py-1 rounded-full border shadow-sm"
                              >
                                <span className="text-sm font-medium">{dealBreaker}</span>
                                <button
                                  onClick={() => removeCustomItem("customDealBreakers", dealBreaker)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {currentStep === 5 && (
                  <motion.div variants={itemVariants} className="space-y-8">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-3">Assessment Complete</h3>
                      <p className="text-gray-600 text-lg">
                        Review your preferences before receiving your personalized results
                      </p>
                    </div>

                    <div className="grid gap-6">
                      <motion.div whileHover={{ scale: 1.01 }}>
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-3">
                              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                              <span>Personal Profile & Location</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="grid md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-2">
                              <p>
                                <strong>Age Range:</strong> {assessmentData.personalProfile.ageRange}
                              </p>
                              <p>
                                <strong>Household:</strong> {assessmentData.personalProfile.householdSize}
                              </p>
                              <p>
                                <strong>Income:</strong> {assessmentData.personalProfile.income}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p>
                                <strong>Location:</strong> {assessmentData.locationPreferences.city},{" "}
                                {assessmentData.locationPreferences.state}
                              </p>
                              <p>
                                <strong>Children:</strong> {assessmentData.personalProfile.hasChildren ? "Yes" : "No"}
                              </p>
                              <p>
                                <strong>Pets:</strong> {assessmentData.personalProfile.hasPets ? "Yes" : "No"}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.01 }}>
                        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-3">
                              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                              <span>Top Neighborhood Priorities</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid md:grid-cols-2 gap-3">
                              {Object.entries(assessmentData.neighborhoodPriorities)
                                .sort(([, a], [, b]) => b[0] - a[0])
                                .slice(0, 6)
                                .map(([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                                  >
                                    <span className="font-medium text-gray-700">
                                      {priorityLabels[key as keyof typeof priorityLabels]}
                                    </span>
                                    <Badge variant="outline" className="font-bold">
                                      {value[0]}/10
                                    </Badge>
                                  </div>
                                ))}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.01 }}>
                        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                          <CardHeader>
                            <CardTitle className="text-lg flex items-center space-x-3">
                              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                              <span>Essential Amenities</span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="flex flex-wrap gap-2">
                              {[...assessmentData.essentialAmenities, ...assessmentData.customAmenities].map(
                                (amenity) => (
                                  <Badge key={amenity} variant="secondary" className="bg-white shadow-sm">
                                    {amenity}
                                  </Badge>
                                ),
                              ) || <span className="text-gray-500">None selected</span>}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Enhanced Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-between items-center mt-10"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-8 py-3 bg-white border-2 hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
          </motion.div>

          <div className="text-center">
            <div className="text-sm text-gray-600 font-medium">
              {currentStep + 1} of {assessmentSteps.length} steps completed
            </div>
            <div className="text-xs text-gray-500 mt-1">{Math.round(progress)}% progress</div>
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleNext}
              disabled={isGeneratingSuggestions}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg"
            >
              {isGeneratingSuggestions ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : currentStep === assessmentSteps.length - 1 ? (
                "Get My Results"
              ) : (
                <>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
