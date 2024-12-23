import {
   NotAuthorizedException,
   InvalidParameterException,
   InvalidPasswordException,
   LimitExceededException,
   ResourceNotFoundException,
   UserNotFoundException,
   TooManyRequestsException,
   CodeDeliveryFailureException,
   UnauthorizedException,
   MFAMethodNotFoundException,
   ExpiredCodeException,
   UsernameExistsException,
   CodeMismatchException,
   UserNotConfirmedException,
} from '@aws-sdk/client-cognito-identity-provider'
import { HttpException, HttpStatus } from '@nestjs/common'

export const CognitoError = (error: any) => {
   console.log(error)
   // NotAuthorizedException - Typically used for incorrect credentials (username/password)
   if (error instanceof NotAuthorizedException) {
      throw new HttpException(
         'Incorrect username or password',
         HttpStatus.UNAUTHORIZED,
      )
   }

   // InvalidParameterException - Typically thrown when parameters passed are invalid
   if (error instanceof InvalidParameterException) {
      throw new HttpException(
         'Invalid parameters provided',
         HttpStatus.BAD_REQUEST,
      )
   }

   // InvalidPasswordException - Thrown when a password does not meet the required criteria
   if (error instanceof InvalidPasswordException) {
      throw new HttpException(
         'The provided password is invalid',
         HttpStatus.BAD_REQUEST,
      )
   }

   // LimitExceededException - Thrown when a request exceeds a limit
   if (error instanceof LimitExceededException) {
      throw new HttpException(
         'Request limit exceeded. Please try again later.',
         HttpStatus.TOO_MANY_REQUESTS,
      )
   }

   // ResourceNotFoundException - Thrown when a requested resource is not found
   if (error instanceof ResourceNotFoundException) {
      throw new HttpException(
         'Requested resource not found',
         HttpStatus.NOT_FOUND,
      )
   }

   // UserNotFoundException - Thrown when the specified user is not found
   if (error instanceof UserNotFoundException) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND)
   }

   // TooManyRequestsException - Thrown when too many requests are made in a short period
   if (error instanceof TooManyRequestsException) {
      throw new HttpException(
         'Too many requests. Please wait before trying again.',
         HttpStatus.TOO_MANY_REQUESTS,
      )
   }

   // CodeDeliveryFailureException - Thrown when there is a failure in delivering a verification code
   if (error instanceof CodeDeliveryFailureException) {
      throw new HttpException(
         'Failed to deliver the verification code',
         HttpStatus.BAD_REQUEST,
      )
   }

   // UnauthorizedClientException - Thrown when the client is not authorized
   if (error instanceof UnauthorizedException) {
      throw new HttpException(
         'Client is not authorized to perform this action',
         HttpStatus.FORBIDDEN,
      )
   }

   // MfaMethodNotFoundException - Thrown when MFA method is not found
   if (error instanceof MFAMethodNotFoundException) {
      throw new HttpException('MFA method not found', HttpStatus.BAD_REQUEST)
   }

   // ExpiredCodeException - Thrown when the verification code has expired
   if (error instanceof ExpiredCodeException) {
      throw new HttpException(
         'The verification code has expired',
         HttpStatus.BAD_REQUEST,
      )
   }

   // General fallback for any other unknown Cognito-related errors
   if (error.code === 'ETIMEDOUT') {
      throw new HttpException('Request timed out', HttpStatus.REQUEST_TIMEOUT)
   }

   // UsernameExistsException - Thrown when the username already exists
   if (error instanceof UsernameExistsException) {
      throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST)
   }

   // CodeMismatchException - Thrown when the verification code is incorrect
   if (error instanceof CodeMismatchException) {
      throw new HttpException(
         'The verification code is incorrect',
         HttpStatus.BAD_REQUEST,
      )
   }

   // UserNotConfirmedException - Thrown when the user is not confirmed
   if (error instanceof UserNotConfirmedException) {
      throw new HttpException('User is not confirmed', HttpStatus.BAD_REQUEST)
   }

   // General fallback for any other unknown Cognito-related errors
   throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
   )
}
