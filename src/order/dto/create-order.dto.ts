export class CreateOrderDto {
  clientId: string;
  pickUpLocation: {
    longitude: number;
    latitude: number;
  };
  dropOffLocation: {
    longitude: number;
    latitude: number;
  };
}
