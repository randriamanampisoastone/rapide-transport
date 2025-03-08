
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class StripeService {
    private readonly stripe: Stripe;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        this.stripe = new Stripe(configService.get('STRIPE_SECRET_KEY'), {
            // apiVersion: '2023-10-16', // Use the latest API version
        });
    }

    // Create a Connect account for a seller
    async createConnectAccount(userId: string, email: string) {
        const account = await this.stripe.accounts.create({
            type: 'express',
            email,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
        });

        // Save account info to database
        const stripeAccount = await this.prisma.stripeAccount.create({
            data: {
                userId,
                stripeAccountId: account.id,
                payoutEnabled: false,
            },
        });

        // Generate account link for onboarding
        const accountLink = await this.stripe.accountLinks.create({
            account: account.id,
            refresh_url: `${this.configService.get('FRONTEND_URL')}/seller/stripe/refresh`,
            return_url: `${this.configService.get('FRONTEND_URL')}/seller/stripe/success`,
            type: 'account_onboarding',
        });

        return {
            stripeAccount,
            accountLink: accountLink.url,
        };
    }

    // Process a payment for an order
    async createPaymentIntent(orderId: string, amount: number) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            throw new Error('Order not found');
        }

        // Group items by seller
        const sellerAmounts = {};
        for (const item of order.items) {
            const sellerId = item.product.sellerId;
            if (!sellerAmounts[sellerId]) {
                sellerAmounts[sellerId] = 0;
            }
            sellerAmounts[sellerId] += Number(item.priceAtPurchase) * item.quantity;
        }

        // Get platform fee (10% in this example)
        const platformFeePercentage = 0.1;
        const applicationFee = Math.round(amount * platformFeePercentage);

        // Create payment intent
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            payment_method_types: ['card'],
            metadata: {
                orderId,
            },
            application_fee_amount: applicationFee,
        });

        // Update payment record
        await this.prisma.payment.create({
            data: {
                orderId,
                paymentIntentId: paymentIntent.id,
                status: 'PENDING',
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
        };
    }

    // Create a payout to a seller
    async createPayout(stripeAccountId: string, amount: number) {
        const payout = await this.stripe.payouts.create(
            {
                amount,
                currency: 'usd',
            },
            {
                stripeAccount: stripeAccountId,
            }
        );

        // Save payout record
        return this.prisma.payout.create({
            data: {
                stripeAccountId,
                amount: amount / 100, // Convert from cents to dollars for DB
                status: 'PENDING',
            },
        });
    }
}