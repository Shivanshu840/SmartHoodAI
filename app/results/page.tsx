"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  MapPin,
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Car,
  Shield,
  GraduationCap,
  Brain,
  Zap,
  RefreshCw,
  Download,
  Share2,
  Loader2,
  ExternalLink,
  Eye,
} from "lucide-react"
import { NeighborhoodDetailModal } from "@/components/neighborhood-detail-modal"

interface NeighborhoodMatch {
  id: string
  name: string
  city: string
  state: string
  area?: string
  pincode?: string
  googleMapsUrl?: string
  matchScore: number
  strengths: string[]
  concerns: string[]
  demographics: {
    medianAge: number
    medianIncome: number
    populationDensity: number
    diversityIndex: number
  }
  lifestyle: {
    walkScore: number
    transitScore: number
    bikeScore: number
    crimeRate: number
    schoolRating: number
    costOfLivingIndex: number
  }
  amenities: {
    restaurants: number
    parks: number
    gyms: number
    groceryStores: number
    entertainment: number
    hospitals?: number
    schools?: number
    malls?: number
  }
  transportation?: {
    nearestMetroStation?: string
    metroDistance?: string
    busConnectivity?: string
    autoRickshawAvailability?: string
    parkingAvailability?: string
  }
  costBreakdown?: {
    rent1BHK?: number
    rent2BHK?: number
    rent3BHK?: number
    groceryCostPerMonth?: number
    diningOutAverage?: number
    utilitiesPerMonth?: number
  }
  explanation: string
  aiInsights: string
  recommendedActions: string[]
  nearbyLandmarks?: string[]
  bestTimeToVisit?: string
  localTips?: string[]
}

export default function SmartHoodResults() {
  const [results, setResults] = useState<NeighborhoodMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [assessmentData, setAssessmentData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodMatch | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const loadResults = async () => {
      try {
        const storedData = localStorage.getItem("smartHoodAssessment")
        if (storedData) {
          const data = JSON.parse(storedData)
          setAssessmentData(data)
          await generateAIResults(data)
        } else {
          setError("No assessment data found. Please complete the assessment first.")
          setLoading(false)
        }
      } catch (err) {
        setError("Failed to load assessment results.")
        setLoading(false)
      }
    }

    loadResults()
  }, [])

  const generateAIResults = async (data: any) => {
    try {
      console.log("Sending assessment data to API:", data)

      const response = await fetch("/api/generate-results", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log("API response status:", response.status)

      if (response.ok) {
        const aiResults = await response.json()
        console.log("AI results received:", aiResults)

        // Check if we got an error in the response
        if (aiResults.error) {
          console.error("API returned error:", aiResults.error)
          setError(`Failed to generate results: ${aiResults.error}`)
        } else {
          setResults(aiResults)
        }
      } else {
        const errorData = await response.json()
        console.error("API response not ok:", response.status, errorData)
        setError(`Failed to generate results: ${errorData.error || "Unknown error"}`)
      }
    } catch (err) {
      console.error("Error generating AI results:", err)
      setError("Failed to connect to AI service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const openNeighborhoodDetail = (neighborhood: NeighborhoodMatch) => {
    setSelectedNeighborhood(neighborhood)
    setIsModalOpen(true)
  }

  const openGoogleMaps = (neighborhood: NeighborhoodMatch) => {
    if (neighborhood.googleMapsUrl) {
      window.open(neighborhood.googleMapsUrl, "_blank")
    }
  }

  const retakeAssessment = () => {
    localStorage.removeItem("smartHoodAssessment")
    window.location.href = "/assessment"
  }

  const downloadReport = () => {
    if (!results.length || !assessmentData) return

    // Create comprehensive report content
    const reportContent = `
SMARTHOOD AI - NEIGHBORHOOD ANALYSIS REPORT
==========================================

Generated on: ${new Date().toLocaleDateString()}
Location: ${assessmentData.locationPreferences?.city}, ${assessmentData.locationPreferences?.state}

PERSONAL PROFILE
================
Age Range: ${assessmentData.personalProfile?.ageRange}
Household Size: ${assessmentData.personalProfile?.householdSize}
Annual Income: ${assessmentData.personalProfile?.income}
Has Children: ${assessmentData.personalProfile?.hasChildren ? "Yes" : "No"}
Has Pets: ${assessmentData.personalProfile?.hasPets ? "Yes" : "No"}

TOP NEIGHBORHOOD MATCHES
========================

${results
  .map(
    (neighborhood, index) => `
${index + 1}. ${neighborhood.name.toUpperCase()}
   Location: ${neighborhood.city}, ${neighborhood.state}
   Area: ${neighborhood.area || "N/A"}
   Pincode: ${neighborhood.pincode || "N/A"}
   Match Score: ${neighborhood.matchScore}%
   
   STRENGTHS:
   ${neighborhood.strengths.map((s) => `   • ${s}`).join("\n")}
   
   CONSIDERATIONS:
   ${neighborhood.concerns.map((c) => `   • ${c}`).join("\n")}
   
   COST BREAKDOWN (Monthly):
   • 1 BHK Rent: ₹${neighborhood.costBreakdown?.rent1BHK?.toLocaleString() || "N/A"}
   • 2 BHK Rent: ₹${neighborhood.costBreakdown?.rent2BHK?.toLocaleString() || "N/A"}
   • 3 BHK Rent: ₹${neighborhood.costBreakdown?.rent3BHK?.toLocaleString() || "N/A"}
   • Groceries: ₹${neighborhood.costBreakdown?.groceryCostPerMonth?.toLocaleString() || "N/A"}
   • Dining Out (Avg): ₹${neighborhood.costBreakdown?.diningOutAverage || "N/A"}
   • Utilities: ₹${neighborhood.costBreakdown?.utilitiesPerMonth?.toLocaleString() || "N/A"}
   
   LIFESTYLE SCORES:
   • Walkability: ${neighborhood.lifestyle.walkScore}/100
   • Public Transit: ${neighborhood.lifestyle.transitScore}/100
   • Safety: ${(10 - neighborhood.lifestyle.crimeRate).toFixed(1)}/10
   • Schools: ${neighborhood.lifestyle.schoolRating}/10
   
   AMENITIES:
   • Restaurants: ${neighborhood.amenities.restaurants}
   • Parks: ${neighborhood.amenities.parks}
   • Gyms: ${neighborhood.amenities.gyms}
   • Grocery Stores: ${neighborhood.amenities.groceryStores}
   • Entertainment: ${neighborhood.amenities.entertainment}
   
   AI INSIGHTS:
   ${neighborhood.aiInsights}
   
   RECOMMENDED ACTIONS:
   ${neighborhood.recommendedActions.map((a) => `   • ${a}`).join("\n")}
   
   NEARBY LANDMARKS:
   ${neighborhood.nearbyLandmarks?.map((l) => `   • ${l}`).join("\n") || "   • N/A"}
   
   LOCAL TIPS:
   ${neighborhood.localTips?.map((t) => `   • ${t}`).join("\n") || "   • N/A"}
   
   Google Maps: ${neighborhood.googleMapsUrl || "N/A"}
   
`,
  )
  .join("\n" + "=".repeat(50) + "\n")}

ASSESSMENT SUMMARY
==================
This report was generated based on your comprehensive lifestyle assessment. The neighborhoods listed above have been ranked according to their compatibility with your stated preferences and priorities.

For the most up-to-date information, please visit the neighborhoods in person and verify current rental rates and amenities.

Report generated by SmartHood AI - Intelligent Neighborhood Discovery Platform
    `

    // Create and download the file
    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `SmartHood_Report_${assessmentData.locationPreferences?.city}_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="mb-6"
          >
            <Brain className="h-16 w-16 text-blue-600 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Analyzing Your Perfect Neighborhood Match</h2>
          <p className="text-gray-600 mb-6">
            Our AI is processing your preferences against comprehensive neighborhood data...
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing demographic data</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing lifestyle compatibility</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating personalized insights</span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="p-4 bg-red-100 rounded-full w-fit mx-auto mb-6">
            <Zap className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Unable to Generate Results</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={retakeAssessment} className="bg-blue-600 hover:bg-blue-700 w-full">
              Retake Assessment
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
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
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartHoodAI Results
              </h1>
              <p className="text-sm text-gray-600">Your Personalized Neighborhood Matches</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={retakeAssessment} className="flex items-center space-x-2 bg-transparent">
              <RefreshCw className="h-4 w-4" />
              <span>Retake Assessment</span>
            </Button>
            <Button onClick={downloadReport} className="flex items-center space-x-2 bg-green-600 hover:bg-green-700">
              <Download className="h-4 w-4" />
              <span>Download Report</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Share2 className="h-4 w-4" />
              <span>Share Results</span>
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Results Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="mb-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50">
              <CardTitle className="flex items-center text-2xl">
                <TrendingUp className="mr-3 h-6 w-6 text-blue-600" />
                Your Neighborhood Analysis
              </CardTitle>
              <CardDescription className="text-base">
                Based on your comprehensive assessment, we've identified {results.length} neighborhoods in{" "}
                <strong>
                  {assessmentData?.locationPreferences?.city}, {assessmentData?.locationPreferences?.state}
                </strong>{" "}
                that align with your lifestyle and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-6 text-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl"
                >
                  <div className="text-3xl font-bold text-blue-600">{results[0]?.matchScore || 0}%</div>
                  <div className="text-sm text-gray-600 font-medium">Best Match Score</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl"
                >
                  <div className="text-3xl font-bold text-green-600">{results.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Matches Found</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl"
                >
                  <div className="text-3xl font-bold text-purple-600">
                    {results.length > 0
                      ? Math.round(results.reduce((sum, r) => sum + r.matchScore, 0) / results.length)
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Average Compatibility</div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl"
                >
                  <div className="text-3xl font-bold text-orange-600">AI</div>
                  <div className="text-sm text-gray-600 font-medium">Powered Analysis</div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Neighborhood Results */}
        <div className="space-y-8">
          <AnimatePresence>
            {results.map((neighborhood, index) => (
              <motion.div
                key={neighborhood.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="overflow-hidden shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center text-xl mb-3">
                          <Badge variant="secondary" className="mr-3 px-3 py-1 text-sm font-bold">
                            #{index + 1}
                          </Badge>
                          <span className="text-2xl font-bold text-gray-800">{neighborhood.name}</span>
                          <span className="text-lg font-normal text-gray-500 ml-3">
                            {neighborhood.city}, {neighborhood.state}
                          </span>
                          {neighborhood.pincode && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              {neighborhood.pincode}
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Star className="h-5 w-5 text-yellow-500 mr-2" />
                            <span className="font-bold text-xl text-gray-800">{neighborhood.matchScore}% Match</span>
                          </div>
                          <Progress value={neighborhood.matchScore} className="w-48 h-3" />
                          <Badge
                            variant={
                              neighborhood.matchScore >= 90
                                ? "default"
                                : neighborhood.matchScore >= 80
                                  ? "secondary"
                                  : "outline"
                            }
                            className="px-3 py-1"
                          >
                            {neighborhood.matchScore >= 90
                              ? "Excellent"
                              : neighborhood.matchScore >= 80
                                ? "Very Good"
                                : "Good"}{" "}
                            Fit
                          </Badge>
                        </div>
                        {neighborhood.area && <p className="text-sm text-gray-500 mt-2">{neighborhood.area}</p>}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => openNeighborhoodDetail(neighborhood)}
                          className="bg-indigo-600 hover:bg-indigo-700 flex items-center space-x-2"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </Button>
                        <Button
                          onClick={() => openGoogleMaps(neighborhood)}
                          variant="outline"
                          className="flex items-center space-x-2"
                        >
                          <MapPin className="h-4 w-4" />
                          <span>Maps</span>
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-8 space-y-6">
                    {/* Quick Overview */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-l-4 border-blue-500"
                    >
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center">
                        <Brain className="h-5 w-5 mr-2" />
                        AI Analysis
                      </h4>
                      <p className="text-blue-800 leading-relaxed">{neighborhood.explanation}</p>
                    </motion.div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        {
                          icon: Car,
                          label: "Walkability",
                          value: neighborhood.lifestyle.walkScore,
                          color: "blue",
                          suffix: "/100",
                        },
                        {
                          icon: Shield,
                          label: "Safety",
                          value: (10 - neighborhood.lifestyle.crimeRate).toFixed(1),
                          color: "green",
                          suffix: "/10",
                        },
                        {
                          icon: GraduationCap,
                          label: "Education",
                          value: neighborhood.lifestyle.schoolRating,
                          color: "purple",
                          suffix: "/10",
                        },
                        {
                          icon: DollarSign,
                          label: "Affordability",
                          value: Math.max(0, 200 - neighborhood.lifestyle.costOfLivingIndex),
                          color: "red",
                          suffix: "/100",
                        },
                      ].map((metric, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border shadow-sm"
                        >
                          <metric.icon className={`h-8 w-8 mx-auto mb-2 text-${metric.color}-600`} />
                          <div className="text-2xl font-bold text-gray-800">
                            {metric.value}
                            {metric.suffix}
                          </div>
                          <div className="text-xs text-gray-600 font-medium">{metric.label}</div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Quick Amenities */}
                    <div className="grid grid-cols-5 gap-4 text-center">
                      {[
                        { label: "Restaurants", count: neighborhood.amenities.restaurants, icon: "🍽️" },
                        { label: "Parks", count: neighborhood.amenities.parks, icon: "🌳" },
                        { label: "Gyms", count: neighborhood.amenities.gyms, icon: "💪" },
                        { label: "Grocery", count: neighborhood.amenities.groceryStores, icon: "🛒" },
                        { label: "Entertainment", count: neighborhood.amenities.entertainment, icon: "🎭" },
                      ].map((amenity, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ scale: 1.1 }}
                          className="p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl border shadow-sm"
                        >
                          <div className="text-xl mb-1">{amenity.icon}</div>
                          <div className="text-lg font-bold text-gray-800">{amenity.count}</div>
                          <div className="text-xs text-gray-600 font-medium">{amenity.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Center */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="mt-12 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="text-xl">Ready to Take the Next Step?</CardTitle>
              <CardDescription className="text-base">
                Explore these neighborhoods further with our comprehensive tools and resources.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-4">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button className="h-auto p-6 flex flex-col items-center space-y-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <MapPin className="h-8 w-8" />
                    <span className="font-semibold">Visit Neighborhoods</span>
                    <span className="text-xs opacity-90">Plan your exploration</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center space-y-3 w-full bg-white/50"
                  >
                    <Users className="h-8 w-8" />
                    <span className="font-semibold">Connect Locally</span>
                    <span className="text-xs opacity-75">Get insider insights</span>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Button
                    onClick={downloadReport}
                    variant="outline"
                    className="h-auto p-6 flex flex-col items-center space-y-3 w-full bg-white/50"
                  >
                    <Download className="h-8 w-8" />
                    <span className="font-semibold">Download Report</span>
                    <span className="text-xs opacity-75">Save your results</span>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Neighborhood Detail Modal */}
      <NeighborhoodDetailModal
        neighborhood={selectedNeighborhood}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
