import { Schema } from 'dynamoose'
import { PaymentMethodType } from 'enums/payment.enum'
import { RideStatus } from 'enums/ride.enum'
import { VehicleType } from 'enums/vehicle.enum'
import { ModelDefinition } from 'nestjs-dynamoose'

const RideSchema = new Schema(
   {
      rideId: {
         type: String,
         hashKey: true,
         required: true,
      },
      clientProfileId: {
         type: String,
         required: true,
      },
      driverProfileId: {
         type: String,
         required: false,
      },
      vehicleType: {
         type: String,
         enum: Object.values(VehicleType),
         required: true,
      },
      vehicleId: {
         type: String,
         required: false,
      },
      paymentMethodType: {
         type: String,
         enum: Object.values(PaymentMethodType),
         required: true,
      },
      pickUpLocation: {
         type: Object,
         schema: {
            latitude: {
               type: Number,
               required: true,
               validate: (value: number) => value >= -90 && value <= 90, // Latitude valide
            },
            longitude: {
               type: Number,
               required: true,
               validate: (value: number) => value >= -180 && value <= 180, // Longitude valide
            },
         },
         required: true,
      },
      dropOffLocation: {
         type: Object,
         schema: {
            latitude: {
               type: Number,
               required: true,
               validate: (value: number) => value >= -90 && value <= 90, // Latitude valide
            },
            longitude: {
               type: Number,
               required: true,
               validate: (value: number) => value >= -180 && value <= 180, // Longitude valide
            },
         },
         required: true,
      },
      encodedPolyline: {
         type: String,
         required: true,
      },
      distanceMeters: {
         type: Number,
         required: true,
         validate: (value: number) => value > 0, // Distance doit être positive
      },
      estimatedDuration: {
         type: Number,
         required: true,
         validate: (value: number) => value >= 0, // Durée estimée positive ou nulle
      },
      estimatedPrice: {
         type: Object,
         schema: {
            lower: {
               type: Number,
               required: true, // Prix inférieur requis
               validate: (value: number) => value >= 0, // Prix inférieur positif ou nul
            },
            upper: {
               type: Number,
               required: true, // Prix supérieur requis
               validate: (value: number) => value >= 0, // Prix supérieur positif ou nul
            },
         },
         required: true, // Champ estimé obligatoire
      },
      realDuration: {
         type: Number,
         required: false,
         validate: (value: number) => value >= 0, // Durée réelle positive ou nulle
         default: 0,
      },
      realPrice: {
         type: Number,
         required: false, // Champ facultatif
         validate: (value: number) => value >= 0, // Prix réel positif ou nul
         default: 0,
      },
      status: {
         type: String,
         required: true,
         enum: Object.values(RideStatus),
      },
      note: {
         type: Number,
         required: false,
      },
      review: {
         type: String,
         required: false,
      },
      startTime: {
         type: Number,
         required: false,
      },
      endTime: {
         type: Number,
         required: false,
      },
      adminCheck: {
         type: Boolean,
         required: false,
         default: false,
      }
   },
   {
      timestamps: true,
   },
)

export const RideModel: ModelDefinition = {
   name: 'Ride',
   schema: RideSchema,
   options: {
      tableName: 'Ride',
      create: true,
   },
}
