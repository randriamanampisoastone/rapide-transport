import { Schema } from 'dynamoose';
import { ModelDefinition } from 'nestjs-dynamoose';

const GeolocationSchema = new Schema(
  {
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
);

export const GeolocationModel: ModelDefinition = {
  name: 'Geolocation',
  schema: GeolocationSchema,
  options: {
    tableName: 'Geolocation',
    create: true,
  },
};

export interface GeolocationData {
  userId: string;
  userGroup: string;
  location: {
    longitude: number;
    latitude: number;
  };
}
