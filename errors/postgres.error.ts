import { HttpException, HttpStatus } from '@nestjs/common'

export const PostgresError = (error: any) => {
   console.log(error)

   if (error.code === 'P2002') {
      throw new HttpException(
         'Resource already exists (unique constraint failed)',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2003') {
      throw new HttpException(
         'Foreign key constraint failed',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2004') {
      throw new HttpException(
         'Constraint failed on the database',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2005') {
      throw new HttpException(
         'Invalid value for a field',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2006') {
      throw new HttpException(
         'Invalid data type provided',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2007') {
      throw new HttpException('Data validation error', HttpStatus.BAD_REQUEST)
   } else if (error.code === 'P2008') {
      throw new HttpException(
         'Failed to parse the query',
         HttpStatus.INTERNAL_SERVER_ERROR,
      )
   } else if (error.code === 'P2009') {
      throw new HttpException(
         'Failed to validate the query',
         HttpStatus.INTERNAL_SERVER_ERROR,
      )
   } else if (error.code === 'P2010') {
      throw new HttpException(
         'Raw query failed',
         HttpStatus.INTERNAL_SERVER_ERROR,
      )
   } else if (error.code === 'P2011') {
      throw new HttpException(
         'Null constraint violation',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2012') {
      throw new HttpException('Missing required value', HttpStatus.BAD_REQUEST)
   } else if (error.code === 'P2013') {
      throw new HttpException(
         'Missing return value for query',
         HttpStatus.INTERNAL_SERVER_ERROR,
      )
   } else if (error.code === 'P2014') {
      throw new HttpException(
         'Nested write failed due to a relation constraint',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2015') {
      throw new HttpException('Record not found', HttpStatus.NOT_FOUND)
   } else if (error.code === 'P2016') {
      throw new HttpException('Query returned no data', HttpStatus.NOT_FOUND)
   } else if (error.code === 'P2017') {
      throw new HttpException('Invalid relational path', HttpStatus.BAD_REQUEST)
   } else if (error.code === 'P2018') {
      throw new HttpException(
         'Required connected records not found',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2019') {
      throw new HttpException(
         'Input error for database',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2020') {
      throw new HttpException('Value out of range', HttpStatus.BAD_REQUEST)
   } else if (error.code === 'P2021') {
      throw new HttpException(
         'Table or view not found in the database',
         HttpStatus.INTERNAL_SERVER_ERROR,
      )
   } else if (error.code === 'P2022') {
      throw new HttpException(
         'Column not found in the database',
         HttpStatus.INTERNAL_SERVER_ERROR,
      )
   } else if (error.code === 'P2023') {
      throw new HttpException(
         'Incomplete data sent to the database',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2024') {
      throw new HttpException('Operation timed out', HttpStatus.REQUEST_TIMEOUT)
   } else if (error.code === 'P2025') {
      throw new HttpException(
         'Record to update/delete not found',
         HttpStatus.NOT_FOUND,
      )
   } else if (error.code === 'P2026') {
      throw new HttpException(
         'Operation failed due to incorrect parameters',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.code === 'P2027') {
      throw new HttpException(
         'Transaction error',
         HttpStatus.INTERNAL_SERVER_ERROR,
      )
   } else if (error.response.statusCode === 404) {
      throw new HttpException('Resource not found', HttpStatus.NOT_FOUND)
   } else if (error.response.statusCode === 403) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN)
   } else if (error.response.statusCode === 400) {
      throw new HttpException(
         'Invalid request parameters',
         HttpStatus.BAD_REQUEST,
      )
   } else if (error.response.statusCode === 401) {
      throw new HttpException(
         'Authentication is required',
         HttpStatus.UNAUTHORIZED,
      )
   } else if (error.response.statusCode === 402) {
      throw new HttpException(
         'Payment is required to proceed',
         HttpStatus.PAYMENT_REQUIRED,
      )
   } else if (error.response.statusCode === 405) {
      throw new HttpException(
         'HTTP method not allowed for this endpoint',
         HttpStatus.METHOD_NOT_ALLOWED,
      )
   } else if (error.response.statusCode === 406) {
      throw new HttpException(
         'Request format not acceptable',
         HttpStatus.NOT_ACCEPTABLE,
      )
   } else if (error.response.statusCode === 408) {
      throw new HttpException(
         'Request timed out, try again',
         HttpStatus.REQUEST_TIMEOUT,
      )
   } else if (error.response.statusCode === 409) {
      throw new HttpException(
         'Conflict with existing data',
         HttpStatus.CONFLICT,
      )
   } else if (error.response.statusCode === 410) {
      throw new HttpException(
         'The requested resource is no longer available',
         HttpStatus.GONE,
      )
   } else if (error.response.statusCode === 411) {
      throw new HttpException(
         'Content length is required but missing',
         HttpStatus.LENGTH_REQUIRED,
      )
   } else if (error.response.statusCode === 412) {
      throw new HttpException(
         'Precondition failed, check the headers or parameters',
         HttpStatus.PRECONDITION_FAILED,
      )
   } else if (error.response.statusCode === 413) {
      throw new HttpException(
         'Request payload is too large',
         HttpStatus.PAYLOAD_TOO_LARGE,
      )
   } else if (error.response.statusCode === 414) {
      throw new HttpException(
         'Request URI is too long',
         HttpStatus.URI_TOO_LONG,
      )
   } else if (error.response.statusCode === 415) {
      throw new HttpException(
         'Unsupported media type in request',
         HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      )
   } else {
      throw new HttpException(
         'An unknown error occurred',
         HttpStatus.INTERNAL_SERVER_ERROR,
      )
   }
}
