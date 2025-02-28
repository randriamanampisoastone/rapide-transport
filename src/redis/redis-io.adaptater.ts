import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { ServerOptions } from 'socket.io'
import { createClient } from 'redis'

export class RedisIoAdapter extends IoAdapter {
   private adapterConstructor: ReturnType<typeof createAdapter>
   async connectToRedis(): Promise<void> {
      const pubClient = createClient({
         url: process.env.REDIS_URL,
         socket: {
            tls: true,
         },
      })
      const subClient = pubClient.duplicate()

      try {
         await Promise.all([pubClient.connect(), subClient.connect()])
         this.adapterConstructor = createAdapter(pubClient, subClient)
      } catch (error) {
         console.error('Error connecting to Redis:', error)
         throw error
      }
   }

   createIOServer(port: number, options?: ServerOptions): any {
      const server = super.createIOServer(port, options)
      console.log('Setting up Redis adapter...')
      server.adapter(this.adapterConstructor)
      console.log('Redis adapter set up successfully.')
      return server
   }
}
