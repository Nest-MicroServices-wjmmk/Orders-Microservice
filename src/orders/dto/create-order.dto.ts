import { OrderStatus, PaymentMethod } from "@prisma/client";
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsPositive } from "class-validator";
import { OrderStatusList, PaymentMethodList } from "../enum/order.enum";

export class CreateOrderDto {

    @IsNumber()
    @IsPositive()
    totalAmount: number;

    @IsNumber()
    @IsPositive()
    totalItems: number;

    @IsEnum(
        OrderStatusList,
        { message: `status must be one of the following values: ${OrderStatusList}` }
    )
    @IsOptional()
    status: OrderStatus = OrderStatus.PENDING;

    @IsOptional()
    @IsBoolean()
    paid: boolean = false;

    @IsEnum(
        PaymentMethodList,
        { message: `paymentMethod must be one of the following values: ${PaymentMethodList}` }
    )
    @IsOptional()
    paymentMethod: PaymentMethod = PaymentMethod.CASH;
}
