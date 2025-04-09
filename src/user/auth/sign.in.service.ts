import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common'
import {SignInDto} from './dto/sign.in.dto'
import {PrismaService} from 'src/prisma/prisma.service'
import * as speakeasy from 'speakeasy'
import {SmsService} from 'src/sms/sms.service'
import {RedisService} from 'src/redis/redis.service'
import {ConfigService} from '@nestjs/config'
import {AUTH_SIGN_IN_PREFIX} from 'constants/redis.constant'

@Injectable()
export class SignInService {
    private AUTH_OTP_TTL = 0

    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
        private readonly smsService: SmsService,
        private readonly prismaService: PrismaService,
    ) {
    }

    onModuleInit() {
        this.AUTH_OTP_TTL = this.configService.get<number>('AUTH_OTP_TTL')
    }

    async signIn(signInDto: SignInDto) {
        try {
            const existingUser = await this.validateUser(signInDto.phoneNumber)
            const confirmationCode = this.generateConfirmationCode()
            await this.sendConfirmationCode(existingUser.phoneNumber, confirmationCode)
            await this.storeSignInAttempt({
                phoneNumber: existingUser.phoneNumber,
                role: existingUser.role,
                confirmationCode,
            })
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }
            throw new UnauthorizedException('Sign-in process failed')
        }
    }

    private async validateUser(phoneNumber: string) {
        const user = await this.prismaService.profile.findUnique({
            where: {phoneNumber},
        })

        if (!user) {
            throw new BadRequestException('User with this phone number doesn\'t exist')
        }

        return user
    }

    private generateConfirmationCode(): string {
        const secret = speakeasy.generateSecret({length: 20})
        return speakeasy.totp({
            secret: secret.base32,
            encoding: 'base32',
        })
    }

    private async sendConfirmationCode(phoneNumber: string, code: string): Promise<void> {
        await this.smsService.sendSMS(
            [phoneNumber],
            `Your Rapide App OTP Code is : ${code}`,
        )
    }

    private async storeSignInAttempt(data: {
        phoneNumber: string,
        role: string,
        confirmationCode: string,
    }): Promise<void> {
        const signInData = {
            attempt: 0,
            confirmationCode: data.confirmationCode,
            phoneNumber: data.phoneNumber,
            role: data.role,
        }

        await this.redisService.set(
            `${AUTH_SIGN_IN_PREFIX}${data.phoneNumber}`,
            JSON.stringify(signInData),
            this.AUTH_OTP_TTL,
        )
    }
}
