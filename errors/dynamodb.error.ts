import {
   ConditionalCheckFailedException,
   ProvisionedThroughputExceededException,
   ResourceNotFoundException,
   InternalServerError,
   ItemCollectionSizeLimitExceededException,
   TransactionConflictException,
   LimitExceededException,
} from '@aws-sdk/client-dynamodb'
import { HttpException, HttpStatus } from '@nestjs/common'

export const DynamoDBError = (error: any) => {
   console.log(error)

   // ConditionalCheckFailedException - Thrown when a condition in a conditional write fails
   if (error instanceof ConditionalCheckFailedException) {
      throw new HttpException(
         'Condition check failed for the item',
         HttpStatus.BAD_REQUEST,
      )
   }

   // ProvisionedThroughputExceededException - Thrown when throughput limits are exceeded
   if (error instanceof ProvisionedThroughputExceededException) {
      throw new HttpException(
         'Provisioned throughput exceeded. Please try again later.',
         HttpStatus.TOO_MANY_REQUESTS,
      )
   }

   // ResourceNotFoundException - Thrown when the requested resource (table, item, etc.) is not found
   if (error instanceof ResourceNotFoundException) {
      throw new HttpException(
         'Requested resource not found',
         HttpStatus.NOT_FOUND,
      )
   }

   // InternalServerErrorException - Thrown when DynamoDB experiences an internal server error
   if (error instanceof InternalServerError) {
      throw new HttpException(
         'Internal server error occurred with DynamoDB',
         HttpStatus.INTERNAL_SERVER_ERROR,
      )
   }

   // ItemCollectionSizeLimitExceededException - Thrown when the item collection size limit is exceeded
   if (error instanceof ItemCollectionSizeLimitExceededException) {
      throw new HttpException(
         'Item collection size limit exceeded',
         HttpStatus.BAD_REQUEST,
      )
   }

   // TransactionConflictException - Thrown when there is a conflict in a transactional request
   if (error instanceof TransactionConflictException) {
      throw new HttpException(
         'Conflict occurred in the transaction',
         HttpStatus.CONFLICT,
      )
   }

   // LimitExceededException - Thrown when a limit is exceeded (e.g., size, number of requests)
   if (error instanceof LimitExceededException) {
      throw new HttpException(
         'Request limit exceeded. Please try again later.',
         HttpStatus.TOO_MANY_REQUESTS,
      )
   }

   // General fallback for any other unknown DynamoDB-related errors
   throw new HttpException(
      'Internal server error with DynamoDB',
      HttpStatus.INTERNAL_SERVER_ERROR,
   )
}
