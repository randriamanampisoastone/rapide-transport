export interface EstimatedPrice {
   lower: number
   upper: number
}

export interface RidePrices {
   moto: EstimatedPrice
   liteCar: EstimatedPrice
   premiumCar: EstimatedPrice
}
