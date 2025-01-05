import { Schema } from 'dynamoose'
import { ModelDefinition } from 'nestjs-dynamoose'

// Définition des différents statuts possibles pour une course
export enum RideStatus {
   PENDING = 'PENDING', // En attente de confirmation ou de réservation
   DRIVER_ACCEPTED = 'DRIVER_ACCEPTED', // Conducteur a accepté la demande
   DRIVER_ON_THE_WAY = 'DRIVER_ON_THE_WAY', // Conducteur en route pour le lieu de prise en charge
   ONGOING = 'ONGOING', // Course en cours (conducteur et passager ensemble)
   COMPLETED = 'COMPLETED', // Course terminée avec succès
   CANCELLED = 'CANCELLED', // Course annulée par une des parties
   DRIVER_ARRIVED = 'DRIVER_ARRIVED', // Conducteur arrivé au point de prise en charge
}

// Définition des types de véhicules disponibles
export enum VehicleType {
   MOTO = 'MOTO', // Moto
   LITE_CAR = 'LITE_CAR', // Voiture légère
   PREMIUM_CAR = 'PREMIUM_CAR', // Voiture premium
}

// Schéma DynamoDB pour le modèle "Ride"
const RideSchema = new Schema(
   {
      rideId: {
         type: String,
         hashKey: true,
         required: true,
      },
      clientId: {
         type: String,
         required: true,
      },
      vehicleType: {
         type: String,
         enum: Object.values(VehicleType),
         required: true,
      },
      price: {
         type: Number,
         required: true,
         validate: (value: number) => value > 0, // Validation pour un prix positif
      },
      distanceMeters: {
         type: Number,
         required: true,
         validate: (value: number) => value > 0, // Distance doit être positive
      },
      encodedPolylines: {
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
      },
      driverId: {
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
         default: RideStatus.PENDING,
      },
   },
   {
      timestamps: true, // Ajout automatique des champs createdAt et updatedAt
   },
)

// Définition du modèle DynamoDB
export const RideModel: ModelDefinition = {
   name: 'Ride',
   schema: RideSchema,
   options: {
      tableName: 'Ride', // Nom de la table dans DynamoDB
      create: true, // Crée la table si elle n'existe pas
   },
}

// Interface TypeScript pour les données d'une course
export interface RideData {
   rideId: string // Identifiant de la course
   clientId: string // Identifiant du client
   vehicleType: VehicleType // Type de véhicule
   price: number // Prix de la course
   distanceMeters: number // Distance en mètres
   encodedPolylines: string // Polylignes encodées pour le trajet
   pickUpLocation: {
      latitude: number // Latitude du point de prise en charge
      longitude: number // Longitude du point de prise en charge
   }
   dropOffLocation: {
      latitude: number // Latitude du point de dépose
      longitude: number // Longitude du point de dépose
   }
   estimatedDuration: number // Durée estimée en secondes
   realDuration?: number // Durée réelle en secondes (facultatif)
   driverId?: string // Identifiant du conducteur (facultatif)
   vehicleId?: string // Identifiant du véhicule (facultatif)
   status?: RideStatus // Statut de la course
   createdAt?: string // Statut de la course
   updateAt?: string // Statut de la course
   receiptHandle?: string
}

export interface RideDataKey {
   rideId: string
}
