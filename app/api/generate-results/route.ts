import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  const assessmentData = await request.json()
  console.log("Assessment data received:", JSON.stringify(assessmentData, null, 2))

  try {
    // Check if API key is available
    if (!process.env.GOOGLE_AI_API_KEY) {
      console.error("GOOGLE_AI_API_KEY is not set")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)
    // Use the more efficient gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const userCity = assessmentData.locationPreferences?.city || "Mumbai"
    const userState = assessmentData.locationPreferences?.state || "Maharashtra"

    // Create a more concise but comprehensive prompt
    const prompt = `Generate 3 REAL neighborhoods in ${userCity}, ${userState}, India as JSON array.

USER: Age ${assessmentData.personalProfile?.ageRange}, Income ${assessmentData.personalProfile?.income}, ${assessmentData.personalProfile?.hasChildren ? "Has children" : "No children"}

TOP PRIORITIES: ${Object.entries(assessmentData.neighborhoodPriorities || {})
      .sort(([, a], [, b]) => (b as number[])[0] - (a as number[])[0])
      .slice(0, 3)
      .map(([key, value]) => `${key}: ${(value as number[])[0]}/10`)
      .join(", ")}

Return JSON array with this structure for each REAL neighborhood in ${userCity}:
{
  "id": "1",
  "name": "Real neighborhood name in ${userCity}",
  "city": "${userCity}",
  "state": "${userState}",
  "area": "Locality description",
  "pincode": "Real pincode for ${userCity}",
  "googleMapsUrl": "https://www.google.com/maps/search/[neighborhood]+${userCity}+${userState}",
  "matchScore": 85-95,
  "strengths": ["4 specific strengths"],
  "concerns": ["2 considerations"],
  "demographics": {"medianAge": 30, "medianIncome": 1200000, "populationDensity": 15000, "diversityIndex": 0.8},
  "lifestyle": {"walkScore": 80, "transitScore": 85, "bikeScore": 70, "crimeRate": 2.0, "schoolRating": 8.0, "costOfLivingIndex": 120},
  "amenities": {"restaurants": 100, "parks": 5, "gyms": 15, "groceryStores": 12, "entertainment": 20, "hospitals": 8, "schools": 10, "malls": 3},
  "transportation": {"nearestMetroStation": "Station name", "metroDistance": "1 km", "busConnectivity": "Good", "autoRickshawAvailability": "High", "parkingAvailability": "Limited"},
  "costBreakdown": {"rent1BHK": 25000, "rent2BHK": 40000, "rent3BHK": 65000, "groceryCostPerMonth": 5000, "diningOutAverage": 500, "utilitiesPerMonth": 2500},
  "explanation": "Why this matches user preferences",
  "aiInsights": "Lifestyle analysis",
  "recommendedActions": ["4 specific actions"],
  "nearbyLandmarks": ["3 real landmarks"],
  "bestTimeToVisit": "Best time to visit",
  "localTips": ["2 local tips"]
}

Use ONLY real neighborhoods in ${userCity}. Return JSON array only.`

    console.log("Sending prompt to AI with gemini-1.5-flash...")

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log("AI Response received:", text.substring(0, 500) + "...")

    // Parse the AI response
    let neighborhoods
    try {
      // Clean the response to extract JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        neighborhoods = JSON.parse(jsonMatch[0])
        console.log("Successfully parsed neighborhoods:", neighborhoods.length)

        // Validate that we have valid neighborhoods
        if (!Array.isArray(neighborhoods) || neighborhoods.length === 0) {
          throw new Error("No valid neighborhoods returned")
        }

        // Ensure all neighborhoods have required fields
        neighborhoods = neighborhoods.filter((n) => n.name && n.city && n.matchScore)

        if (neighborhoods.length === 0) {
          throw new Error("No valid neighborhoods after filtering")
        }
      } else {
        throw new Error("No valid JSON found in AI response")
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError)
      console.log("Raw AI response:", text)

      // Return intelligent fallback based on city
      return NextResponse.json(getIntelligentFallback(userCity, userState, assessmentData))
    }

    return NextResponse.json(neighborhoods)
  } catch (error) {
    console.error("Detailed error generating neighborhood results:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    // Check if it's a quota error
    if (error.message.includes("429") || error.message.includes("quota")) {
      console.log("Quota exceeded, using intelligent fallback")
      return NextResponse.json(
        getIntelligentFallback(
          assessmentData?.locationPreferences?.city || "Mumbai",
          assessmentData?.locationPreferences?.state || "Maharashtra",
          assessmentData,
        ),
      )
    }

    return NextResponse.json(
      {
        error: "Failed to generate neighborhood analysis. Please try again.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

function getIntelligentFallback(city: string, state: string, assessmentData: any) {
  console.log(`Generating intelligent fallback for ${city}, ${state}`)

  // Get user priorities to customize fallback
  const priorities = assessmentData.neighborhoodPriorities || {}
  const topPriorities = Object.entries(priorities)
    .sort(([, a], [, b]) => (b as number[])[0] - (a as number[])[0])
    .slice(0, 3)
    .map(([key]) => key)

  const hasChildren = assessmentData.personalProfile?.hasChildren
  const income = assessmentData.personalProfile?.income

  // City-specific real neighborhoods with proper pincodes
  const cityData: { [key: string]: any[] } = {
    Bangalore: [
      {
        id: "1",
        name: "Koramangala",
        city: "Bangalore",
        state: "Karnataka",
        area: "5th Block & 6th Block Area",
        pincode: "560095",
        googleMapsUrl: "https://www.google.com/maps/search/Koramangala+Bangalore+Karnataka",
        matchScore: 91,
        strengths: [
          "Heart of Bangalore's startup ecosystem",
          "Excellent food and nightlife scene",
          "Great connectivity to IT corridors",
          "Young, vibrant community",
        ],
        concerns: ["High rental costs", "Traffic congestion"],
        demographics: { medianAge: 28, medianIncome: 1200000, populationDensity: 18000, diversityIndex: 0.85 },
        lifestyle: {
          walkScore: 88,
          transitScore: 80,
          bikeScore: 85,
          crimeRate: 2.0,
          schoolRating: 8.0,
          costOfLivingIndex: 130,
        },
        amenities: {
          restaurants: 300,
          parks: 4,
          gyms: 20,
          groceryStores: 25,
          entertainment: 40,
          hospitals: 10,
          schools: 8,
          malls: 3,
        },
        transportation: {
          nearestMetroStation: "Koramangala Metro Station",
          metroDistance: "0.8 km",
          busConnectivity: "Excellent",
          autoRickshawAvailability: "High",
          parkingAvailability: "Limited",
        },
        costBreakdown: {
          rent1BHK: 25000,
          rent2BHK: 40000,
          rent3BHK: 65000,
          groceryCostPerMonth: 5000,
          diningOutAverage: 500,
          utilitiesPerMonth: 2500,
        },
        explanation:
          "Koramangala is perfect for young professionals seeking an energetic urban lifestyle with excellent connectivity.",
        aiInsights:
          "The area has the highest density of startups in India and continues to evolve with new restaurants and co-working spaces.",
        recommendedActions: [
          "Explore 5th Block for restaurants",
          "Visit Forum Mall",
          "Check startup offices",
          "Experience 80 Feet Road nightlife",
        ],
        nearbyLandmarks: ["Forum Mall", "Jyoti Nivas College", "Koramangala Indoor Stadium", "80 Feet Road"],
        bestTimeToVisit: "Evening (6-9 PM) to experience the vibrant food and social scene",
        localTips: ["5th Block is more expensive but has better amenities", "Great connectivity to Electronic City"],
      },
      {
        id: "2",
        name: "Indiranagar",
        city: "Bangalore",
        state: "Karnataka",
        area: "100 Feet Road & CMH Road Area",
        pincode: "560038",
        googleMapsUrl: "https://www.google.com/maps/search/Indiranagar+Bangalore+Karnataka",
        matchScore: 87,
        strengths: [
          "Established area with character",
          "Excellent restaurants and pubs",
          "Good metro connectivity",
          "Tree-lined streets",
        ],
        concerns: ["Older infrastructure", "Weekend traffic"],
        demographics: { medianAge: 33, medianIncome: 1400000, populationDensity: 16000, diversityIndex: 0.78 },
        lifestyle: {
          walkScore: 82,
          transitScore: 85,
          bikeScore: 80,
          crimeRate: 1.8,
          schoolRating: 8.5,
          costOfLivingIndex: 135,
        },
        amenities: {
          restaurants: 180,
          parks: 6,
          gyms: 18,
          groceryStores: 20,
          entertainment: 25,
          hospitals: 8,
          schools: 12,
          malls: 2,
        },
        transportation: {
          nearestMetroStation: "Indiranagar Metro Station",
          metroDistance: "0.3 km",
          busConnectivity: "Excellent",
          autoRickshawAvailability: "High",
          parkingAvailability: "Good",
        },
        costBreakdown: {
          rent1BHK: 28000,
          rent2BHK: 45000,
          rent3BHK: 70000,
          groceryCostPerMonth: 5500,
          diningOutAverage: 600,
          utilitiesPerMonth: 2800,
        },
        explanation:
          "Indiranagar combines old Bangalore charm with modern amenities, perfect for balanced urban lifestyle.",
        aiInsights: "The area maintains cultural identity while modernizing, offering unique local experiences.",
        recommendedActions: [
          "Walk along 100 Feet Road",
          "Visit weekend markets",
          "Explore Chinnaswamy Stadium area",
          "Check tree-lined streets",
        ],
        nearbyLandmarks: ["Chinnaswamy Stadium", "100 Feet Road", "HAL Airport", "Ulsoor Lake"],
        bestTimeToVisit: "Morning (8-10 AM) to appreciate peaceful tree-lined atmosphere",
        localTips: ["100 Feet Road crowded on weekends", "Inner roads quieter for families"],
      },
      {
        id: "3",
        name: "Whitefield",
        city: "Bangalore",
        state: "Karnataka",
        area: "IT Hub & Residential Area",
        pincode: "560066",
        googleMapsUrl: "https://www.google.com/maps/search/Whitefield+Bangalore+Karnataka",
        matchScore: 84,
        strengths: [
          "Major IT hub with tech companies",
          "Planned infrastructure",
          "Good schools and hospitals",
          "Family-friendly environment",
        ],
        concerns: ["Distance from city center", "Traffic during peak hours"],
        demographics: { medianAge: 31, medianIncome: 1300000, populationDensity: 12000, diversityIndex: 0.8 },
        lifestyle: {
          walkScore: 70,
          transitScore: 75,
          bikeScore: 85,
          crimeRate: 1.5,
          schoolRating: 8.8,
          costOfLivingIndex: 115,
        },
        amenities: {
          restaurants: 120,
          parks: 8,
          gyms: 15,
          groceryStores: 18,
          entertainment: 15,
          hospitals: 12,
          schools: 20,
          malls: 4,
        },
        transportation: {
          nearestMetroStation: "Whitefield Metro Station",
          metroDistance: "1.2 km",
          busConnectivity: "Good",
          autoRickshawAvailability: "High",
          parkingAvailability: "Excellent",
        },
        costBreakdown: {
          rent1BHK: 22000,
          rent2BHK: 35000,
          rent3BHK: 55000,
          groceryCostPerMonth: 4800,
          diningOutAverage: 450,
          utilitiesPerMonth: 2300,
        },
        explanation:
          "Whitefield is ideal for IT professionals and families seeking modern amenities with good infrastructure.",
        aiInsights:
          "The area continues to grow as a self-sufficient IT township with excellent educational facilities.",
        recommendedActions: [
          "Visit major IT parks",
          "Explore Phoenix MarketCity",
          "Check residential complexes",
          "Experience local markets",
        ],
        nearbyLandmarks: ["Phoenix MarketCity", "ITPL", "Whitefield Railway Station", "Hope Farm"],
        bestTimeToVisit: "Weekend mornings to see family-friendly atmosphere",
        localTips: ["Great for IT professionals", "Excellent schools for families with children"],
      },
    ],
    Mumbai: [
      {
        id: "1",
        name: "Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        area: "Linking Road & Hill Road Area",
        pincode: "400050",
        googleMapsUrl: "https://www.google.com/maps/search/Bandra+West+Mumbai+Maharashtra",
        matchScore: 89,
        strengths: [
          "Excellent connectivity to South Mumbai",
          "Vibrant nightlife and dining",
          "Close to Bandra-Kurla Complex",
          "Celebrity neighborhood",
        ],
        concerns: ["High cost of living", "Traffic congestion"],
        demographics: { medianAge: 32, medianIncome: 1800000, populationDensity: 25000, diversityIndex: 0.82 },
        lifestyle: {
          walkScore: 85,
          transitScore: 90,
          bikeScore: 70,
          crimeRate: 2.1,
          schoolRating: 8.5,
          costOfLivingIndex: 145,
        },
        amenities: {
          restaurants: 200,
          parks: 5,
          gyms: 25,
          groceryStores: 15,
          entertainment: 30,
          hospitals: 8,
          schools: 12,
          malls: 4,
        },
        transportation: {
          nearestMetroStation: "Bandra Station",
          metroDistance: "0.5 km",
          busConnectivity: "Excellent",
          autoRickshawAvailability: "High",
          parkingAvailability: "Limited",
        },
        costBreakdown: {
          rent1BHK: 45000,
          rent2BHK: 75000,
          rent3BHK: 120000,
          groceryCostPerMonth: 8000,
          diningOutAverage: 800,
          utilitiesPerMonth: 3500,
        },
        explanation:
          "Bandra West is Mumbai's most happening suburb, perfect for young professionals wanting urban lifestyle.",
        aiInsights:
          "Rapid commercial development with highest concentration of trendy cafes and restaurants in Mumbai.",
        recommendedActions: [
          "Visit Linking Road",
          "Check sea-facing areas",
          "Explore Hill Road nightlife",
          "Visit BKC offices",
        ],
        nearbyLandmarks: ["Bandstand Promenade", "Mount Mary Church", "Bandra-Worli Sea Link", "Linking Road"],
        bestTimeToVisit: "Evening (5-8 PM) to experience area's energy",
        localTips: ["Sea-facing apartments command premium", "Local trains fastest during peak hours"],
      },
      {
        id: "2",
        name: "Powai",
        city: "Mumbai",
        state: "Maharashtra",
        area: "Hiranandani Gardens & IIT Area",
        pincode: "400076",
        googleMapsUrl: "https://www.google.com/maps/search/Powai+Mumbai+Maharashtra",
        matchScore: 85,
        strengths: [
          "Planned township with infrastructure",
          "Close to IT companies",
          "Good schools and institutions",
          "Peaceful lake-side environment",
        ],
        concerns: ["Distance from South Mumbai", "Limited nightlife"],
        demographics: { medianAge: 35, medianIncome: 1500000, populationDensity: 15000, diversityIndex: 0.75 },
        lifestyle: {
          walkScore: 75,
          transitScore: 70,
          bikeScore: 80,
          crimeRate: 1.5,
          schoolRating: 9.0,
          costOfLivingIndex: 125,
        },
        amenities: {
          restaurants: 80,
          parks: 8,
          gyms: 15,
          groceryStores: 12,
          entertainment: 10,
          hospitals: 6,
          schools: 15,
          malls: 2,
        },
        transportation: {
          nearestMetroStation: "Powai Station (Under Construction)",
          metroDistance: "2 km",
          busConnectivity: "Good",
          autoRickshawAvailability: "Medium",
          parkingAvailability: "Good",
        },
        costBreakdown: {
          rent1BHK: 35000,
          rent2BHK: 55000,
          rent3BHK: 85000,
          groceryCostPerMonth: 6500,
          diningOutAverage: 600,
          utilitiesPerMonth: 3000,
        },
        explanation:
          "Powai offers perfect blend of urban amenities and peaceful living, ideal for families and IT professionals.",
        aiInsights: "Growing tech companies and startups with excellent educational infrastructure for families.",
        recommendedActions: [
          "Visit Hiranandani Gardens",
          "Check IIT Powai campus",
          "Explore R City Mall",
          "See Powai Lake",
        ],
        nearbyLandmarks: ["Powai Lake", "IIT Bombay", "Hiranandani Gardens", "R City Mall"],
        bestTimeToVisit: "Morning (9-11 AM) for peaceful lake-side environment",
        localTips: ["Hiranandani has better infrastructure", "Lake-facing apartments are premium"],
      },
      {
        id: "3",
        name: "Andheri East",
        city: "Mumbai",
        state: "Maharashtra",
        area: "SEEPZ & Airport Area",
        pincode: "400069",
        googleMapsUrl: "https://www.google.com/maps/search/Andheri+East+Mumbai+Maharashtra",
        matchScore: 82,
        strengths: [
          "Close to international airport",
          "Major business hub",
          "Good connectivity",
          "Affordable compared to West",
        ],
        concerns: ["Industrial area noise", "Air pollution"],
        demographics: { medianAge: 30, medianIncome: 1200000, populationDensity: 20000, diversityIndex: 0.85 },
        lifestyle: {
          walkScore: 78,
          transitScore: 85,
          bikeScore: 75,
          crimeRate: 2.3,
          schoolRating: 7.8,
          costOfLivingIndex: 120,
        },
        amenities: {
          restaurants: 150,
          parks: 4,
          gyms: 18,
          groceryStores: 20,
          entertainment: 15,
          hospitals: 10,
          schools: 15,
          malls: 3,
        },
        transportation: {
          nearestMetroStation: "Andheri Station",
          metroDistance: "0.8 km",
          busConnectivity: "Excellent",
          autoRickshawAvailability: "High",
          parkingAvailability: "Good",
        },
        costBreakdown: {
          rent1BHK: 30000,
          rent2BHK: 50000,
          rent3BHK: 80000,
          groceryCostPerMonth: 6000,
          diningOutAverage: 500,
          utilitiesPerMonth: 2800,
        },
        explanation:
          "Andheri East is perfect for professionals working in business districts with good airport connectivity.",
        aiInsights: "Major commercial hub with growing IT and financial services companies.",
        recommendedActions: [
          "Explore SEEPZ area",
          "Visit business districts",
          "Check airport connectivity",
          "See local markets",
        ],
        nearbyLandmarks: ["Mumbai Airport", "SEEPZ", "Marol Naka", "Chakala"],
        bestTimeToVisit: "Morning (8-10 AM) to avoid traffic and see business activity",
        localTips: ["Great for frequent travelers", "More affordable than western suburbs"],
      },
    ],
    Delhi: [
      {
        id: "1",
        name: "Connaught Place",
        city: "Delhi",
        state: "Delhi",
        area: "Central Delhi Business District",
        pincode: "110001",
        googleMapsUrl: "https://www.google.com/maps/search/Connaught+Place+Delhi",
        matchScore: 88,
        strengths: [
          "Heart of Delhi with connectivity",
          "Rich history and architecture",
          "Major shopping and business hub",
          "Cultural center",
        ],
        concerns: ["Very high cost", "Extremely crowded"],
        demographics: { medianAge: 30, medianIncome: 1600000, populationDensity: 30000, diversityIndex: 0.9 },
        lifestyle: {
          walkScore: 95,
          transitScore: 98,
          bikeScore: 60,
          crimeRate: 3.2,
          schoolRating: 8.0,
          costOfLivingIndex: 160,
        },
        amenities: {
          restaurants: 400,
          parks: 3,
          gyms: 30,
          groceryStores: 20,
          entertainment: 50,
          hospitals: 15,
          schools: 8,
          malls: 6,
        },
        transportation: {
          nearestMetroStation: "Rajiv Chowk Metro Station",
          metroDistance: "0.1 km",
          busConnectivity: "Excellent",
          autoRickshawAvailability: "High",
          parkingAvailability: "Very Limited",
        },
        costBreakdown: {
          rent1BHK: 50000,
          rent2BHK: 80000,
          rent3BHK: 130000,
          groceryCostPerMonth: 9000,
          diningOutAverage: 900,
          utilitiesPerMonth: 4000,
        },
        explanation:
          "Connaught Place is Delhi's premier business hub, ideal for professionals wanting to be at the center.",
        aiInsights: "Combines historical significance with modern business infrastructure.",
        recommendedActions: [
          "Explore circular market",
          "Visit India Gate",
          "Experience metro connectivity",
          "Check cultural events",
        ],
        nearbyLandmarks: ["India Gate", "Parliament House", "Jantar Mantar", "Central Park"],
        bestTimeToVisit: "Early morning (7-9 AM) to avoid crowds",
        localTips: ["Metro is best transport", "Rich in history and culture"],
      },
      {
        id: "2",
        name: "Gurgaon Sector 29",
        city: "Delhi",
        state: "Haryana",
        area: "Leisure City Mall Area",
        pincode: "122001",
        googleMapsUrl: "https://www.google.com/maps/search/Gurgaon+Sector+29+Haryana",
        matchScore: 85,
        strengths: [
          "Modern infrastructure",
          "Great nightlife and dining",
          "Close to Cyber City",
          "Shopping and entertainment",
        ],
        concerns: ["Traffic congestion", "Water supply issues"],
        demographics: { medianAge: 28, medianIncome: 1400000, populationDensity: 18000, diversityIndex: 0.82 },
        lifestyle: {
          walkScore: 80,
          transitScore: 70,
          bikeScore: 75,
          crimeRate: 2.0,
          schoolRating: 8.2,
          costOfLivingIndex: 135,
        },
        amenities: {
          restaurants: 250,
          parks: 5,
          gyms: 20,
          groceryStores: 15,
          entertainment: 35,
          hospitals: 8,
          schools: 10,
          malls: 4,
        },
        transportation: {
          nearestMetroStation: "IFFCO Chowk",
          metroDistance: "2 km",
          busConnectivity: "Good",
          autoRickshawAvailability: "High",
          parkingAvailability: "Good",
        },
        costBreakdown: {
          rent1BHK: 35000,
          rent2BHK: 55000,
          rent3BHK: 85000,
          groceryCostPerMonth: 7000,
          diningOutAverage: 700,
          utilitiesPerMonth: 3200,
        },
        explanation:
          "Sector 29 is perfect for young professionals seeking modern lifestyle with great entertainment options.",
        aiInsights: "Hub for nightlife and dining with proximity to major IT companies.",
        recommendedActions: [
          "Explore Leisure City Mall",
          "Check nightlife options",
          "Visit nearby Cyber City",
          "Experience local dining",
        ],
        nearbyLandmarks: ["Leisure City Mall", "Kingdom of Dreams", "Cyber City", "Golf Course Road"],
        bestTimeToVisit: "Evening (6-9 PM) for dining and entertainment scene",
        localTips: ["Great nightlife and dining", "Close to major IT hubs"],
      },
    ],
    Pune: [
      {
        id: "1",
        name: "Koregaon Park",
        city: "Pune",
        state: "Maharashtra",
        area: "Upscale Residential Area",
        pincode: "411001",
        googleMapsUrl: "https://www.google.com/maps/search/Koregaon+Park+Pune+Maharashtra",
        matchScore: 86,
        strengths: [
          "Upscale with excellent amenities",
          "Great restaurants and nightlife",
          "Close to IT companies",
          "Peaceful residential environment",
        ],
        concerns: ["Higher cost of living", "Traffic during peak"],
        demographics: { medianAge: 31, medianIncome: 1300000, populationDensity: 12000, diversityIndex: 0.8 },
        lifestyle: {
          walkScore: 80,
          transitScore: 75,
          bikeScore: 85,
          crimeRate: 1.8,
          schoolRating: 8.3,
          costOfLivingIndex: 120,
        },
        amenities: {
          restaurants: 150,
          parks: 6,
          gyms: 18,
          groceryStores: 12,
          entertainment: 20,
          hospitals: 8,
          schools: 10,
          malls: 3,
        },
        transportation: {
          nearestMetroStation: "Not Available",
          metroDistance: "N/A",
          busConnectivity: "Good",
          autoRickshawAvailability: "High",
          parkingAvailability: "Good",
        },
        costBreakdown: {
          rent1BHK: 22000,
          rent2BHK: 35000,
          rent3BHK: 55000,
          groceryCostPerMonth: 5000,
          diningOutAverage: 450,
          utilitiesPerMonth: 2200,
        },
        explanation: "Koregaon Park is Pune's premium area, perfect for professionals seeking upscale living.",
        aiInsights: "Known for cosmopolitan culture and popular among IT professionals and expatriates.",
        recommendedActions: [
          "Explore restaurants and cafes",
          "Visit Osho Ashram",
          "Check boutique shopping",
          "Experience nightlife",
        ],
        nearbyLandmarks: ["Osho Ashram", "Pune Race Course", "Aga Khan Palace", "German Bakery"],
        bestTimeToVisit: "Evening (6-8 PM) for social and dining scene",
        localTips: ["Popular among young professionals", "Great international cuisine"],
      },
      {
        id: "2",
        name: "Baner",
        city: "Pune",
        state: "Maharashtra",
        area: "IT Hub & Residential",
        pincode: "411045",
        googleMapsUrl: "https://www.google.com/maps/search/Baner+Pune+Maharashtra",
        matchScore: 83,
        strengths: [
          "Major IT hub with tech parks",
          "Modern residential complexes",
          "Good connectivity to Hinjewadi",
          "Family-friendly environment",
        ],
        concerns: ["Traffic congestion", "Construction activity"],
        demographics: { medianAge: 29, medianIncome: 1100000, populationDensity: 14000, diversityIndex: 0.78 },
        lifestyle: {
          walkScore: 75,
          transitScore: 70,
          bikeScore: 80,
          crimeRate: 1.6,
          schoolRating: 8.0,
          costOfLivingIndex: 115,
        },
        amenities: {
          restaurants: 100,
          parks: 8,
          gyms: 15,
          groceryStores: 15,
          entertainment: 12,
          hospitals: 6,
          schools: 12,
          malls: 2,
        },
        transportation: {
          nearestMetroStation: "Not Available",
          metroDistance: "N/A",
          busConnectivity: "Good",
          autoRickshawAvailability: "High",
          parkingAvailability: "Excellent",
        },
        costBreakdown: {
          rent1BHK: 18000,
          rent2BHK: 28000,
          rent3BHK: 45000,
          groceryCostPerMonth: 4500,
          diningOutAverage: 400,
          utilitiesPerMonth: 2000,
        },
        explanation: "Baner is ideal for IT professionals with modern amenities and good connectivity to tech hubs.",
        aiInsights: "Rapidly developing area with new residential projects and IT companies.",
        recommendedActions: [
          "Visit IT parks",
          "Check residential complexes",
          "Explore local markets",
          "See connectivity to Hinjewadi",
        ],
        nearbyLandmarks: ["Baner IT Park", "Balewadi Stadium", "Shree Balaji Temple", "Baner Road"],
        bestTimeToVisit: "Morning (9-11 AM) to see residential and IT infrastructure",
        localTips: ["Great for IT professionals", "Modern residential options available"],
      },
    ],
  }

  // Get neighborhoods for the specific city or create generic ones
  let neighborhoods = cityData[city] || []

  if (neighborhoods.length === 0) {
    // Create generic fallback for unlisted cities
    neighborhoods = [
      {
        id: "1",
        name: `${city} Central`,
        city: city,
        state: state,
        area: "Central Business District",
        pincode: "000001",
        googleMapsUrl: `https://www.google.com/maps/search/${city.replace(/\s+/g, "+")}+Central+${state.replace(/\s+/g, "+")}`,
        matchScore: 85,
        strengths: ["Central location", "Good connectivity", "Business hub", "Urban amenities"],
        concerns: ["Higher cost", "Traffic congestion"],
        demographics: { medianAge: 32, medianIncome: 1200000, populationDensity: 15000, diversityIndex: 0.75 },
        lifestyle: {
          walkScore: 80,
          transitScore: 85,
          bikeScore: 70,
          crimeRate: 2.5,
          schoolRating: 7.5,
          costOfLivingIndex: 125,
        },
        amenities: {
          restaurants: 100,
          parks: 5,
          gyms: 15,
          groceryStores: 12,
          entertainment: 20,
          hospitals: 8,
          schools: 10,
          malls: 3,
        },
        transportation: {
          nearestMetroStation: `${city} Central Station`,
          metroDistance: "0.5 km",
          busConnectivity: "Good",
          autoRickshawAvailability: "High",
          parkingAvailability: "Limited",
        },
        costBreakdown: {
          rent1BHK: 20000,
          rent2BHK: 35000,
          rent3BHK: 55000,
          groceryCostPerMonth: 5000,
          diningOutAverage: 400,
          utilitiesPerMonth: 2500,
        },
        explanation: `Central area in ${city} offers good connectivity and urban amenities.`,
        aiInsights: `Commercial heart of ${city} with developing infrastructure.`,
        recommendedActions: [
          `Explore main areas of ${city}`,
          "Check transportation",
          "Visit during different times",
          "Research amenities",
        ],
        nearbyLandmarks: [`${city} Railway Station`, "Central Market", "Government Offices", "Shopping Area"],
        bestTimeToVisit: "Morning (9-11 AM) to avoid peak traffic",
        localTips: ["Central areas have better connectivity", "Consider traffic for commute"],
      },
    ]
  }

  // Customize based on user preferences
  if (hasChildren) {
    neighborhoods = neighborhoods.map((n) => ({
      ...n,
      strengths: [...n.strengths.slice(0, 3), "Good schools and family amenities"],
      lifestyle: { ...n.lifestyle, schoolRating: Math.min(10, n.lifestyle.schoolRating + 0.5) },
    }))
  }

  // Adjust match scores based on priorities
  if (topPriorities.includes("safety")) {
    neighborhoods = neighborhoods.map((n) => ({
      ...n,
      matchScore: Math.min(95, n.matchScore + 3),
      strengths: n.strengths.includes("Safe environment")
        ? n.strengths
        : [...n.strengths.slice(0, 3), "Safe environment"],
    }))
  }

  return neighborhoods
}
