import { OrderStatus, PaymentMethod } from "@prisma/client";


export const OrderStatusList = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
    OrderStatus.SHIPPED,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED
]

export const PaymentMethodList = [
    PaymentMethod.CASH,
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.PAYPAL,
    PaymentMethod.GOOGLE_PAY,
    PaymentMethod.APPLE_PAY,
    PaymentMethod.AMAZON_PAY,
    PaymentMethod.BITCOIN
]