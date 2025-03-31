export enum UserRole {
   CLIENT = "CLIENT",	                  // Accéder aux services (Food, Mart, Ride, Express), passer des commandes, suivre les livraisons.
   DRIVER = "DRIVER",	                  // Accepter et gérer les courses Ride, Mart, Express.
   SUPER_ADMIN = "SUPER_ADMIN",	         // Accès total avec gestion des administrateurs et des autorisations.
   TREASURER = "TREASURER",
   DEPOSITOR = "DEPOSITOR",
   CALL_CENTER = "CALL_CENTER",
   MANAGER_HUB = "MANAGER_HUB",
   RIDER = "RIDER",
}

export enum GenderType {
   MALE = 'MALE',
   FEMALE = 'FEMALE',
   OTHER = 'OTHER',
}
