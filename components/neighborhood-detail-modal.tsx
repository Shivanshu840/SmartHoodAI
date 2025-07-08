"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  Star,
  DollarSign,
  Navigation,
  Coffee,
  ArrowRight,
  ExternalLink,
  Home,
  Utensils,
  Lightbulb,
  Clock,
  Phone,
  Building,
  ShoppingBag,
  Train,
  Bus,
  Bike,
  ParkingCircle,
} from "lucide-react"

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

interface NeighborhoodDetailModalProps {
  neighborhood: NeighborhoodMatch | null
  isOpen: boolean
  onClose: () => void
}

export function NeighborhoodDetailModal({ neighborhood, isOpen, onClose }: NeighborhoodDetailModalProps) {
  if (!neighborhood) return null

  const openGoogleMaps = () => {
    if (neighborhood.googleMapsUrl) {
      window.open(neighborhood.googleMapsUrl, "_blank")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-800 mb-2">{neighborhood.name}</DialogTitle>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {neighborhood.city}, {neighborhood.state}
                  </span>
                </div>
                {neighborhood.pincode && (
                  <Badge variant="outline" className="text-xs">
                    PIN: {neighborhood.pincode}
                  </Badge>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{neighborhood.matchScore}% Match</span>
                </div>
              </div>
              {neighborhood.area && <p className="text-sm text-gray-500 mt-1">{neighborhood.area}</p>}
            </div>
            <Button onClick={openGoogleMaps} className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>View on Maps</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI Insights */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                <span>AI Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700 leading-relaxed">{neighborhood.explanation}</p>
              <div className="bg-white/60 p-3 rounded-lg">
                <p className="text-blue-800 text-sm font-medium">{neighborhood.aiInsights}</p>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          {neighborhood.costBreakdown && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span>Cost Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {neighborhood.costBreakdown.rent1BHK && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Home className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-800">
                        ₹{neighborhood.costBreakdown.rent1BHK.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">1 BHK Rent/month</div>
                    </div>
                  )}
                  {neighborhood.costBreakdown.rent2BHK && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Home className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-800">
                        ₹{neighborhood.costBreakdown.rent2BHK.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">2 BHK Rent/month</div>
                    </div>
                  )}
                  {neighborhood.costBreakdown.rent3BHK && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Home className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-800">
                        ₹{neighborhood.costBreakdown.rent3BHK.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">3 BHK Rent/month</div>
                    </div>
                  )}
                  {neighborhood.costBreakdown.groceryCostPerMonth && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <ShoppingBag className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-800">
                        ₹{neighborhood.costBreakdown.groceryCostPerMonth.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Groceries/month</div>
                    </div>
                  )}
                  {neighborhood.costBreakdown.diningOutAverage && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Utensils className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-800">
                        ₹{neighborhood.costBreakdown.diningOutAverage}
                      </div>
                      <div className="text-xs text-gray-600">Avg meal cost</div>
                    </div>
                  )}
                  {neighborhood.costBreakdown.utilitiesPerMonth && (
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <Building className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                      <div className="text-lg font-bold text-gray-800">
                        ₹{neighborhood.costBreakdown.utilitiesPerMonth.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">Utilities/month</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transportation */}
          {neighborhood.transportation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="h-5 w-5 text-purple-600" />
                  <span>Transportation & Connectivity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {neighborhood.transportation.nearestMetroStation && (
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                      <Train className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold text-gray-800">
                          {neighborhood.transportation.nearestMetroStation}
                        </div>
                        <div className="text-sm text-gray-600">{neighborhood.transportation.metroDistance} away</div>
                      </div>
                    </div>
                  )}
                  {neighborhood.transportation.busConnectivity && (
                    <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <Bus className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Bus Connectivity</div>
                        <div className="text-sm text-gray-600">{neighborhood.transportation.busConnectivity}</div>
                      </div>
                    </div>
                  )}
                  {neighborhood.transportation.autoRickshawAvailability && (
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <Bike className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Auto Rickshaw</div>
                        <div className="text-sm text-gray-600">
                          {neighborhood.transportation.autoRickshawAvailability} availability
                        </div>
                      </div>
                    </div>
                  )}
                  {neighborhood.transportation.parkingAvailability && (
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <ParkingCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-800">Parking</div>
                        <div className="text-sm text-gray-600">{neighborhood.transportation.parkingAvailability}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strengths and Concerns */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-green-800 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Key Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {neighborhood.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-green-700">
                      <ArrowRight className="h-3 w-3 mt-1 text-green-600 flex-shrink-0" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span>Considerations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {neighborhood.concerns.map((concern, i) => (
                    <li key={i} className="flex items-start space-x-2 text-sm text-orange-700">
                      <ArrowRight className="h-3 w-3 mt-1 text-orange-600 flex-shrink-0" />
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coffee className="h-5 w-5 text-purple-600" />
                <span>Nearby Amenities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4 text-center">
                {[
                  { label: "Restaurants", count: neighborhood.amenities.restaurants, icon: "🍽️" },
                  { label: "Parks", count: neighborhood.amenities.parks, icon: "🌳" },
                  { label: "Gyms", count: neighborhood.amenities.gyms, icon: "💪" },
                  { label: "Grocery", count: neighborhood.amenities.groceryStores, icon: "🛒" },
                  { label: "Entertainment", count: neighborhood.amenities.entertainment, icon: "🎭" },
                  { label: "Hospitals", count: neighborhood.amenities.hospitals || 0, icon: "🏥" },
                  { label: "Schools", count: neighborhood.amenities.schools || 0, icon: "🏫" },
                  { label: "Malls", count: neighborhood.amenities.malls || 0, icon: "🏬" },
                ].map((amenity, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-2xl mb-1">{amenity.icon}</div>
                    <div className="text-lg font-bold text-gray-800">{amenity.count}</div>
                    <div className="text-xs text-gray-600">{amenity.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nearby Landmarks */}
          {neighborhood.nearbyLandmarks && neighborhood.nearbyLandmarks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <span>Nearby Landmarks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {neighborhood.nearbyLandmarks.map((landmark, i) => (
                    <Badge key={i} variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                      {landmark}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Local Tips and Best Time to Visit */}
          <div className="grid md:grid-cols-2 gap-6">
            {neighborhood.bestTimeToVisit && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Best Time to Visit</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-700 text-sm">{neighborhood.bestTimeToVisit}</p>
                </CardContent>
              </Card>
            )}

            {neighborhood.localTips && neighborhood.localTips.length > 0 && (
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800 flex items-center space-x-2">
                    <Lightbulb className="h-5 w-5" />
                    <span>Local Tips</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {neighborhood.localTips.map((tip, i) => (
                      <li key={i} className="text-purple-700 text-sm flex items-start space-x-2">
                        <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommended Actions */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
            <CardHeader>
              <CardTitle className="text-indigo-800 flex items-center space-x-2">
                <Phone className="h-5 w-5" />
                <span>Recommended Next Steps</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {neighborhood.recommendedActions.map((action, i) => (
                  <div key={i} className="flex items-start space-x-2 text-sm text-indigo-700 p-2 bg-white/60 rounded">
                    <ArrowRight className="h-3 w-3 mt-1 text-indigo-600 flex-shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
