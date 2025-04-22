"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"

const subscriptionSettingsSchema = z.object({
  freeTierEnabled: z.boolean(),
  premiumPrice: z.string().regex(/^\d+(\.\d{1,2})?$/, {
    message: "Please enter a valid price (e.g., 9.99).",
  }),
  trialPeriod: z.string().regex(/^\d+$/, {
    message: "Please enter a valid number of days.",
  }),
})

export function PlatformSettings() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Subscription settings form
  const subscriptionSettingsForm = useForm<z.infer<typeof subscriptionSettingsSchema>>({
    resolver: zodResolver(subscriptionSettingsSchema),
    defaultValues: {
      freeTierEnabled: true,
      premiumPrice: "9.99",
      trialPeriod: "14",
    },
  })

  function onSubscriptionSettingsSubmit(values: z.infer<typeof subscriptionSettingsSchema>) {
    setIsLoading(true)

    // This would be replaced with your actual settings update logic
    setTimeout(() => {
      toast({
        title: "Settings updated",
        description: "Subscription settings have been updated.",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-white">Subscription Settings</CardTitle>
          <CardDescription className="text-white">Configure subscription plans and pricing</CardDescription>
        </CardHeader>
        <Form {...subscriptionSettingsForm}>
          <form onSubmit={subscriptionSettingsForm.handleSubmit(onSubscriptionSettingsSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={subscriptionSettingsForm.control}
                name="freeTierEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-white">Free Tier</FormLabel>
                      <FormDescription className="text-white">
                        Enable or disable the free tier subscription
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={subscriptionSettingsForm.control}
                name="premiumPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Premium Tier Price ($)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription className="text-white">
                      Monthly subscription price for the premium tier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={subscriptionSettingsForm.control}
                name="trialPeriod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Trial Period (days)</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription className="text-white">Number of days for the free trial period</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="text-white">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
