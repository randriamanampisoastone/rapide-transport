export interface PaymentRideWalletInterface {
   from: string
   to?: string
   code: string
   rideId?: string
   isValided: boolean
   attempt: number
}
