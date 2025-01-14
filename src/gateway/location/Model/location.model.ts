import { Schema } from 'dynamoose'
import { ModelDefinition } from 'nestjs-dynamoose'

const LocationSchema = new Schema(
   {
      geolocationId: {
         type: String,
         hashKey: true,
         required: true,
         default: () => crypto.randomUUID(),
      },
      userId: {
         type: String,
         required: true,
      },
      userGroup: {
         type: String,
         required: true,
      },
      location: {
         type: Object,
         schema: {
            longitude: {
               type: Number,
               required: true,
            },
            latitude: {
               type: Number,
               required: true,
            },
         },
         required: true,
      },
   },
   {
      timestamps: true,
   },
)

export const LocationModel: ModelDefinition = {
   name: 'Location',
   schema: LocationSchema,
   options: {
      tableName: 'Location',
      create: true,
   },
}
