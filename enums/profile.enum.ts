export enum UserRole {
   CLIENT = "CLIENT",	                  // Accéder aux services (Food, Mart, Ride, Express), passer des commandes, suivre les livraisons.
   DRIVER = "DRIVER",	                  // Accepter et gérer les courses Ride, Mart, Express.
   ADMIN = "ADMIN",	                     // Gestion complète du système (accès à tout).
   SUPER_ADMIN = "SUPER_ADMIN",	         // Accès total avec gestion des administrateurs et des autorisations.
   FOOD_MANAGER = "FOOD_MANAGER",      	// Gère les restaurants partenaires et les commandes Food.
   MART_MANAGER = "MART_MANAGER",	      // Gère les magasins partenaires et les commandes Mart.
   HUMAN_RESOURCES = "HUMAN_RESOURCES",   // Gère la relation trene rapide et l'exterieure
   FINANCE_MANAGER = "FINANCE_MANAGER",   // Gère les paiements, commissions et remboursements.
   FLEET_MANAGER = "FLEET_MANAGER",      	// Supervise la flotte de véhicules (maintenance, attribution).
   ORDER_MANAGER = "ORDER_MANAGER",       // Gérer les commandes et les livraisons. Assure la bonne fonctinnaliter des commandes.
}

export enum GenderType {
   MALE = 'MALE',
   FEMALE = 'FEMALE',
   OTHER = 'OTHER',
}
