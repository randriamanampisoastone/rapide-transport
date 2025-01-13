import { VehiclePrices } from 'interfaces/price'

export const calculateEstimatedPrices = (
   distance: number,
   estimatedTimeInMinutes: number,
): VehiclePrices => {
   const distanceInKm = distance / 1000

   const pricingRules = {
      moto: {
         baseFare: 1800,
         perKmRate: 1350,
         perMinuteRate: 540,
         minFare: 4000,
         peakHourRate: 1.05,
      },
      liteCar: {
         baseFare: 2500,
         perKmRate: 2300,
         perMinuteRate: 920,
         minFare: 6000,
         peakHourRate: 1.08,
      },
      premiumCar: {
         baseFare: 3000,
         perKmRate: 2500,
         perMinuteRate: 1000,
         minFare: 7000,
         peakHourRate: 1.1,
      },
   }
   const roundToNearestHundred = (value: number): number => {
      return Math.round(value / 100) * 100
   }

   const isPeakHour = () => {
      const now = new Date()
      const hour = now.getHours()
      return (
         (hour >= 7 && hour < 9) ||
         (hour >= 13 && hour < 14) ||
         (hour >= 16 && hour < 18)
      )
   }

   const calculateRange = (
      baseFare: number,
      perKmRate: number,
      perMinuteRate: number,
      minFare: number,
      peakRate: number,
   ) => {
      let lowerEstimate = Math.max(
         baseFare +
            perKmRate * distanceInKm +
            perMinuteRate * estimatedTimeInMinutes,
         minFare,
      )
      let upperEstimate = lowerEstimate * 1

      if (isPeakHour()) {
         lowerEstimate *= peakRate
         upperEstimate *= peakRate
      }

      return {
         lower: roundToNearestHundred(Math.round(lowerEstimate)),
         upper: roundToNearestHundred(Math.round(upperEstimate)),
      }
   }

   const prices = {
      moto: calculateRange(
         pricingRules.moto.baseFare,
         pricingRules.moto.perKmRate,
         pricingRules.moto.perMinuteRate,
         pricingRules.moto.minFare,
         pricingRules.moto.peakHourRate,
      ),
      liteCar: calculateRange(
         pricingRules.liteCar.baseFare,
         pricingRules.liteCar.perKmRate,
         pricingRules.liteCar.perMinuteRate,
         pricingRules.liteCar.minFare,
         pricingRules.liteCar.peakHourRate,
      ),
      premiumCar: calculateRange(
         pricingRules.premiumCar.baseFare,
         pricingRules.premiumCar.perKmRate,
         pricingRules.premiumCar.perMinuteRate,
         pricingRules.premiumCar.minFare,
         pricingRules.premiumCar.peakHourRate,
      ),
   }

   return prices
}

export const calculateRealTimeCostByTime = (
   startTime: number,
   pricing: { lower: number; upper: number },
   estimatedDuration: number,
): number => {
   const currentTime = Date.now()
   const timeElapsed = currentTime - startTime

   const perMinuteRate = (pricing.upper - pricing.lower) / estimatedDuration

   let cost = pricing.lower + perMinuteRate * timeElapsed

   cost = Math.max(pricing.lower, Math.min(pricing.upper, cost))

   return cost
}
