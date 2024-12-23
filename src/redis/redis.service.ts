import { Injectable, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleInit {
   private client: Redis
   private REDIS_GEO_TTL_SECONDS: number
   private REDIS_TTL_SECONDS: number

   constructor(private readonly configService: ConfigService) {}

   onModuleInit() {
      this.client = new Redis({
         host: this.configService.get<string>('REDIS_HOST'),
         port: this.configService.get<number>('REDIS_PORT'),
      })
      this.REDIS_GEO_TTL_SECONDS = this.configService.get<number>(
         'REDIS_GEO_TTL_SECONDS',
      )
   }

   async addGeoLocation(
      key: string,
      longitude: number,
      latitude: number,
      member: string,
   ): Promise<void> {
      await this.client.geoadd(key, longitude, latitude, member)
      await this.client.expire(key, this.REDIS_GEO_TTL_SECONDS)
   }

   async getNearbyMembers(
      key: string,
      longitude: number,
      latitude: number,
      radius: number,
      unit: 'm' | 'km' | 'mi' | 'ft' = 'km',
   ): Promise<any> {
      return await this.client.georadius(
         key,
         longitude,
         latitude,
         radius,
         unit,
         'WITHDIST',
         'WITHCOORD',
      )
   }

   async getMemberLocation(key: string, member: string): Promise<any> {
      return await this.client.geopos(key, member)
   }

   async getDistance(
      key: string,
      member1: string,
      member2: string,
   ): Promise<string> {
      return await this.client.geodist(key, member1, member2)
   }

   async get(key: string) {
      return await this.client.get(key)
   }
   async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
      await this.client.set(
         key,
         value,
         'EX',
         ttlSeconds ?? this.REDIS_TTL_SECONDS,
      )
   }
}
