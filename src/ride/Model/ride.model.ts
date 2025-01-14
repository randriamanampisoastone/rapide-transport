import { Schema } from 'dynamoose'
import { VehicleType } from 'enums/vehicle.enum'
import { RideStatus } from 'interfaces/ride.interface'
import { ModelDefinition } from 'nestjs-dynamoose'

// Définition des différents statuts possibles pour une course

// Schéma DynamoDB pour le modèle "Ride"
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
      vehicleType: {
         type: String,
         enum: Object.values(VehicleType),
         required: true,
      },
      distanceMeters: {
         type: Number,
         required: true,
         validate: (value: number) => value > 0, // Distance doit être positive
      },
      encodedPolyline: {
         type: String,
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
      estimatedDuration: {
         type: Number,
         required: true,
         validate: (value: number) => value >= 0, // Durée estimée positive ou nulle
      },
      realDuration: {
         type: Number,
         required: false,
         validate: (value: number) => value >= 0, // Durée réelle positive ou nulle
         default: 0,
      },
      driverProfileId: {
         type: String,
         required: false,
      },
      vehicleId: {
         type: String,
         required: false,
      },
      status: {
         type: String,
         enum: Object.values(RideStatus),
         default: RideStatus.FINDING_DRIVER,
      },
      realPrice: {
         type: Number,
         required: false, // Champ facultatif
         validate: (value: number) => value >= 0, // Prix réel positif ou nul
         default: 0,
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
      startTime: {
         type: Number,
         required: false,
      },
      endTime: {
         type: Number,
         required: false,
      },
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
