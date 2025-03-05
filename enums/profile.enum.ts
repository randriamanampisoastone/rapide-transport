export enum UserRole {
   CLIENT = 'CLIENT',	// Accéder aux services (Food, Mart, Ride, Express), passer des commandes, suivre les livraisons.
   DRIVER = 'DRIVER',	// Accepter et gérer les courses Ride, Mart, Express.
   ADMIN = 'ADMIN',	// Gestion complète du système (accès à tout).
   SUPER_ADMIN = 'SUPER_ADMIN',	// Accès total avec gestion des administrateurs et des autorisations.
   RIDE_MANAGER = 'RIDE_MANAGER',	// Supervise le service Ride (gestion des chauffeurs, suivi des courses).
   FOOD_MANAGER = 'FOOD_MANAGER',	// Gère les restaurants partenaires et les commandes Food.
   MART_MANAGER = 'MART_MANAGER',	// Gère les magasins partenaires et les commandes Mart.
   EXPRESS_MANAGER = 'EXPRESS_MANAGER',	// Gère le service Express (suivi des livraisons, gestion des livreurs).
   DRIVER_MANAGER = 'DRIVER_MANAGER',	// Supervise les chauffeurs, gère les inscriptions et les suspensions.
   CUSTOMER_SUPPORT = 'CUSTOMER_SUPPORT',	// Gestion des réclamations et assistance des clients.
   FINANCE_MANAGER = 'FINANCE_MANAGER',	// Gère les paiements, commissions et remboursements.
   PROMOTION_MANAGER = 'PROMOTION_MANAGER',	// Gère les campagnes promotionnelles, les remises et les offres.
   FLEET_MANAGER = 'FLEET_MANAGER',	// Supervise la flotte de véhicules (maintenance, attribution).
   DISPUTE_MANAGER = 'DISPUTE_MANAGER',	// Traite les litiges entre clients, chauffeurs et partenaires.
   OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',	// Supervise toutes les opérations des services.
   PARTNER_MANAGER = 'PARTNER_MANAGER',	// Gère les relations avec les restaurants, magasins et partenaires.
   COMPLIANCE_MANAGER = 'COMPLIANCE_MANAGER',	// Vérifie les documents des chauffeurs, livreurs et partenaires.
   TECH_SUPPORT = 'TECH_SUPPORT',	// Gère les problèmes techniques et les bugs du système.
}

export enum GenderType {
   MALE = 'MALE',
   FEMALE = 'FEMALE',
   OTHER = 'OTHER',
}
