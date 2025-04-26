"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/hooks/use-toast"
import { saveInstagramCalculation, getInstagramCalculationHistory } from "@/app/calculators/instagram/actions"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  followers: z.string().regex(/^\d+$/, {
    message: "Please enter a valid number of followers.",
  }),
  scope: z.enum(["small", "large"]),
  minReach: z.string().regex(/^\d+$/, {
    message: "Please enter a valid percentage.",
  }),
  maxReach: z.string().regex(/^\d+$/, {
    message: "Please enter a valid percentage.",
  }),
  engagement: z.string().regex(/^\d+$/, {
    message: "Please enter a valid percentage.",
  }),
  licenseDays: z.string().regex(/^\d+$/, {
    message: "Please enter a valid number of days.",
  }),
  hasDiscount: z.enum(["yes", "no"]),
})

type CalculationHistory = {
  id: string
  name: string
  followers: number
  scope?: string
  minReach?: number
  maxReach?: number
  engagement?: number
  licenseDays?: number
  estimated_value: number
  created_at: string
}

export function InstagramCalculator() {
  const { toast } = useToast()
  const router = useRouter()
  const [result, setResult] = useState<number | null>(null)
  const [reelsValue, setReelsValue] = useState<number | null>(null)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [loading, setLoading] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<CalculationHistory[]>([])
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        setUserId(data.user.id)
        loadHistory(data.user.id)
      }
    }

    checkUser()
  }, [])

  const loadHistory = async (uid: string) => {
    const result = await getInstagramCalculationHistory(uid)
    if (result.success && result.data) {
      setHistory(result.data as CalculationHistory[])
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      followers: "",
      scope: "small",
      minReach: "5",
      maxReach: "50",
      engagement: "0",
      licenseDays: "1",
      hasDiscount: "no",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Convert string values to numbers
    const followers = Number.parseInt(values.followers)
    const minReach = Number.parseInt(values.minReach)
    const maxReach = Number.parseInt(values.maxReach)
    const engagement = Number.parseInt(values.engagement)
    const licenseDays = Number.parseInt(values.licenseDays)
    const scope = values.scope
    const hasDiscount = values.hasDiscount

    // Calculate base value
    const ratePerFollower = scope === "small" ? 0.014 : 0.008
    const baseValue = followers * ratePerFollower

    // Calculate min reach value
    const minReachValue = (followers * (minReach / 100) * 8) / 1000

    // Calculate max reach value
    const maxReachValue = (followers * (maxReach / 100) * 10) / 1000

    // Calculate license value
    const baseRate = 13.32
    const followersInUnits = followers / 50000
    const licenseValue = baseRate * followersInUnits * licenseDays

    // Calculate total value
    const totalValue = baseValue + minReachValue + maxReachValue + licenseValue

    // Apply discount if needed
    const finalValue = hasDiscount === "yes" ? totalValue * 0.9 : totalValue
    const finalReelsValue = hasDiscount === "yes" ? totalValue * 2 * 0.9 : totalValue * 2

    setResult(finalValue)
    setReelsValue(finalReelsValue)

    toast({
      title: "Calculation complete",
      description: "Your calculation has been processed.",
    })
  }

  const showSavePrompt = () => {
    setShowSaveDialog(true)
    setSaveName("")
  }

  const cancelSave = () => {
    setShowSaveDialog(false)
    setSaveName("")
  }

  const saveCalculation = async () => {
    if (!saveName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this calculation",
        variant: "destructive",
      })
      return
    }

    if (!userId || !result) {
      toast({
        title: "Error",
        description: "You need to be logged in to save calculations",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const values = form.getValues()

      // Create FormData to send to the server
      const formData = new FormData()
      formData.append("name", saveName)
      formData.append("followers", values.followers)
      formData.append("scope", values.scope)
      formData.append("minReach", values.minReach)
      formData.append("maxReach", values.maxReach)
      formData.append("engagement", values.engagement)
      formData.append("licenseDays", values.licenseDays)
      formData.append("hasDiscount", values.hasDiscount)

      const response = await saveInstagramCalculation(formData)

      if (response.success) {
        setShowSaveDialog(false)
        setLastSavedAt(new Date().toLocaleTimeString())
        toast({
          title: "Calculation saved",
          description: "Your calculation has been saved successfully.",
        })

        // Reload history
        if (userId) {
          loadHistory(userId)
        }
      } else {
        throw new Error(response.error || "Error saving calculation")
      }
    } catch (error) {
      console.error("Error saving calculation", error)
      toast({
        title: "Error",
        description: "Failed to save calculation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleHistory = () => {
    setShowHistory(!showHistory)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" size="sm" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-6">Instagram Calculator</h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="followers"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Followers</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Scope</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="small" />
                          </FormControl>
                          <FormLabel className="font-normal">Small (Local/Regional)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="large" />
                          </FormControl>
                          <FormLabel className="font-normal">Large (National/International)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="minReach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Reach (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxReach"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Reach (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="engagement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Engagement Rate (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Duration (days)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hasDiscount"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Apply Discount?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="yes" />
                          </FormControl>
                          <FormLabel className="font-normal">Yes (10% discount)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="no" />
                          </FormControl>
                          <FormLabel className="font-normal">No</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Calculate
              </Button>
            </form>
          </Form>

          {result !== null && (
            <div className="mt-8 p-4 border rounded-md bg-muted">
              <h3 className="text-xl font-semibold mb-2">Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Feed Post Value:</p>
                  <p className="text-2xl font-bold">${result.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reels Value:</p>
                  <p className="text-2xl font-bold">${reelsValue?.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <Button onClick={showSavePrompt} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Calculation
                </Button>

                {lastSavedAt && <p className="text-sm text-muted-foreground">Last saved at: {lastSavedAt}</p>}
              </div>
            </div>
          )}

          {userId && (
            <div className="mt-6">
              <Button variant="outline" onClick={toggleHistory} className="w-full">
                {showHistory ? "Hide History" : "Show Calculation History"}
              </Button>

              {showHistory && (
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Your Saved Calculations</h3>
                  {history.length > 0 ? (
                    <div className="space-y-2">
                      {history.map((item) => (
                        <div key={item.id} className="p-3 border rounded-md">
                          <div className="flex justify-between">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-sm">Followers: {item.followers.toLocaleString()}</p>
                          <p className="font-semibold mt-1">Value: ${item.estimated_value.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No saved calculations yet.</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Calculation</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="save-name">Name for this calculation</Label>
            <Input
              id="save-name"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. Client A Campaign"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelSave} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={saveCalculation} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
