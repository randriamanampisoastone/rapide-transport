import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-streams-adapter'
import { ServerOptions } from 'socket.io'
import { createClient } from 'redis'

export class RedisIoAdapter extends IoAdapter {
   private adapterConstructor: ReturnType<typeof createAdapter>

   async connectToRedis(): Promise<void> {
      const redisClient = createClient({ url: process.env.REDIS_URL })

      redisClient.on('error', (err) =>
         console.error('Redis Client Error:', err),
      )

      await redisClient.connect()

      this.adapterConstructor = createAdapter(redisClient)
   }

   createIOServer(port: number, options?: ServerOptions): any {
      const server = super.createIOServer(port, options)
      console.log('Setting up Redis Streams adapter...')
      server.adapter(this.adapterConstructor)
      console.log('Redis Streams adapter set up successfully.')
      return server
   }
}
