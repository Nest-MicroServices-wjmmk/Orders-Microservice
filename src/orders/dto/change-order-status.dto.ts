import { OrderStatus } from "@prisma/client";
import { IsEnum, IsUUID } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";


export class ChangeOrderStatusDto { 
    
    @IsUUID(4)
    id: number;

    @IsEnum(
        OrderStatusList,
        { message: `Status must be one of the following values: ${OrderStatusList.join(', ')}` }
    )
    status: OrderStatus;
}