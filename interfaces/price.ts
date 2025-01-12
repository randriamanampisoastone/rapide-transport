export interface EstimatedPrice {
   lower: number
   upper: number
}

export interface VehiclePrices {
   moto: EstimatedPrice
   liteCar: EstimatedPrice
   premiumCar: EstimatedPrice
}
