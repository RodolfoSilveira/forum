import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from 'generated/prisma/client'
import { Env } from '../../env/env'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly configService: ConfigService<Env, true>) {
    const dbUrl = configService.getOrThrow('DATABASE_URL', { infer: true })
    const schema = new URL(dbUrl).searchParams.get('schema') ?? undefined
    const adapter = new PrismaPg({ connectionString: dbUrl }, { schema })

    super({ adapter, log: ['warn', 'error'] })
  }
  
  onModuleInit() {
    return this.$connect()
  }

  onModuleDestroy() {
    return this.$disconnect()
  }
}
