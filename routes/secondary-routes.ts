// client - request
export const ROUTE_SEND_CLIENT_REQUEST = 'send-client-request'
export const ROUTE_ANSWER_CLIENT_REQUEST = 'answer-client-request'
export const ROUTE_GET_CLIENT_REQUESTS_BY_CLIENT_REQUEST_ID =
   'get-client-requests-by-client-request-id'
export const ROUTE_GET_CLIENT_REQUESTS = 'get-client-request'
export const ROUTE_REMOVE_CLIENT_REQUEST = 'remove-client-request'

// historical
export const ROUTE_GET_ALL_HISTORICAL = 'get-all-historical'
export const ROUTE_GET_CLIENT_HISTORICAL = 'get-client-historical'
export const ROUTE_GET_CLIENT_HISTORICAL_BY_ADMIN =
   'get-client-historical-by-admin'
export const ROUTE_GET_DRIVER_HISTORICAL = 'get-driver-historical'
export const ROUTE_GET_DRIVER_HISTORICAL_BY_ADMIN =
   'get-driver-historical-by-admin'

// transaction
export const ROUTE_DEPOSITE = 'deposite'
export const ROUTE_GET_TRANSACTIONS = 'get-transactions'
export const ROUTE_GET_USER_TRANSACTIONS = 'get-user-transactions'
export const ROUTE_GET_USER_TRANSACTIONS_BY_ADMIN =
   'get-user-transactions-by-admin'
export const ROUTE_USER_SEARCH_TRANSACTIONS_DATA_BY_REFERENCE =
   'user-search-transactions-data-by-reference'
export const ROUTE_ADMIN_SEARCH_TRANSACTIONS_DATA_BY_REFERENCE =
   'admin-search-transactions-data-by-reference'

// transfer
export const ROUTE_START_TRANSFER = 'start-transfer'
export const ROUTE_CONFIRM_TRANSFER = 'confirm-transfer'
export const ROUTE_RESEND_CONFIRM_TRANSFER = 'resend-confirm-transfer'

// payment-ride
export const ROUTE_START_PAYMENT_WITH_RAPIDE_WALLET =
   'start-payment-with-rapide-wallet'
export const ROUTE_CONFIRM_PAYMENT_WITH_RAPIDE_WALLET =
   'confirm-payment-with-rapide-wallet'

// password
export const ROUTE_SET_ADMIN_PASSWORD = 'set-admin-password'
export const ROUTE_CLIENT_CHANGE_PASSWORD = 'client-change-password'
export const ROUTE_RESET_CLIENT_PASSWORD = 'reset-client-password'

// rapide-wallet
export const ROUTE_RESET_DRIVER_BALANCE = 'reset-driver-balance'
export const ROUTE_GET_RAPIDE_BALANCE = 'get-rapide-balance'
export const ROUTE_GET_SOLDE = 'get-solde'
export const ROUTE_SET_RAPIDE_WALLET_INFORMATION =
   'set-rapide-wallet-information'
export const ROUTE_CONFIRM_RAPIDE_WALLET_INFORMATION =
   'confirm-rapide-wallet-information'
export const ROUTE_RESEND_CONFIRM_RAPIDE_WALLET_INFORMATION =
   'resend-confirm-rapide-wallet-information'
export const ROUTE_UPDATE_RAPIDE_WALLET_STATUS = 'update-rapide-wallet-status'
export const ROUTE_GET_RAPIDE_WALLET = 'get-rapide-wallet'


// invoice-ride
export const ROUTE_GET_CLIENT_INVOICE = 'get-client-invoice'


// ride
export const ROUTE_CREATE_ITINERARY = 'create-itinerary'
export const ROUTE_CREATE_RIDE = 'create-ride'
export const ROUTE_CANCELLED = 'cancelled'
export const ROUTE_DRIVER_ACCEPT = 'driver-accept'
export const ROUTE_DRIVER_ON_THE_WAY = 'driver-on-the-way'
export const ROUTE_STOPPED = 'stopped'
export const ROUTE_DRIVER_ARRIVED = 'driver-arrived'
export const ROUTE_CLIENT_NOT_FOUND = 'client-not-found'
export const ROUTE_START = 'start'
export const ROUTE_CLIENT_GIVE_UP = 'client-give-up'
export const ROUTE_ARRIVED_DESTINATION = 'arrived-destination'
export const ROUTE_COMPLETE = 'complete'
export const ROUTE_REVIEW = 'review'
export const ROUTE_FIND_RIDE_BY_ID_REDIS = 'find-ride-by-id-redis'
export const ROUTE_CHECK_CLIENT_RIDE = 'check-client-ride'
export const ROUTE_CHECK_DRIVER_RIDE = 'check-driver-ride'
export const ROUTE_ASSIGN_RIDE_TO_DRIVER = 'assign-ride-to-driver'
export const ROUTE_SEND_REVIEW = 'send-review'
export const ROUTE_DELETE_RIDE ='delete-ride'


// statistic-ride
export const ROUTE_GET_DRIVER_STATISTIC = 'get-driver-statistic'
export const ROUTE_GET_GLOBAL_STATISTIC = 'get-global-statistic'


// auth
export const ROUTE_SIGN_UP = 'signUp'
export const ROUTE_CONFIRM_SIGN_UP = 'confirmSignUp'
export const ROUTE_RESEND_CONFIRM_SIGN_UP = 'resendConfirmSignUp'
export const ROUTE_SIGN_IN = 'signIn'
export const ROUTE_CONFIRM_SIGN_IN = 'confirmSignIn'
export const ROUTE_RESEND_CONFIRM_SIGN_IN = 'resendConfirmSignIn'
export const ROUTE_GOOGLE_AUTH = 'googleAuth'


// delete-profile
export const ROUTE_BY_ADMIN = 'by-admin'
export const ROUTE_BY_CUSTOMER = 'by-customer'
export const ROUTE_CONFIRM_DELETE_INFORNATION = 'confirm-delete-infornation'
export const ROUTE_SEND_DELETE_CODE_CONFIRNATION = 'send-delete-code-confirnation'
export const ROUTE_CONFIRM_DELETE_PROFILE = 'confirm-delete-profile'
export const ROUTE_RESEND_CODE = 'resend-code'

// profile
export const ROUTE_GET_CLIENT_PROFILE = 'getClientProfile'
export const ROUTE_GET_DRIVER_PROFILE = 'getDriverProfile'
export const ROUTE_GET_ADMIN_PROFILE = 'getAdminProfile'
export const ROUTE_FIND_CLIENT_PROFILE = 'findClientProfile'
export const ROUTE_FIND_DRIVER_PROFILE = 'findDriverProfile'
export const ROUTE_GET_FULL_CLIENT_PROFILE = 'getFullClientProfile'
export const ROUTE_GET_CLIENTS = 'getClients'
export const ROUTE_SEARCH_CLIENT_BY_TERM = 'searchClientByTerm'
export const ROUTE_GET_FULL_DRIVER_PROFILE = 'getFullDriverProfile'
export const ROUTE_GET_DRIVERS = 'getDrivers'
export const ROUTE_SEARCH_DRIVER_BY_TERM = 'searchDriverByTerm'
export const ROUTE_GET_CLIENT_BY_IDS = 'getClientByIds'
export const ROUTE_GET_DRIVER_BY_IDS = 'getDriverByIds'
export const ROUTE_UPDATE_PROFILE = 'updateProfile'
export const ROUTE_UPDATE_PROFILE_BY_ADMIN = 'updateProfileByAdmin'
export const ROUTE_UPDATE_CLIENT_STATUS = 'udpateClientStatus'
export const ROUTE_UPDATE_DRIVER_STATUS = 'udpateDriverStatus'
export const ROUTE_GET_ADMINS = 'getAdmins'
export const ROUTE_UPDATE_ADMIN_STATUS = 'updateAdminStatus'
export const ROUTE_UPDATE_ADMIN_ROLE = 'updateAdminRole'


// vehicle
export const ROUTE_FINDING_DRIVER_NEAR_BY = 'finding-drivers-near-by'