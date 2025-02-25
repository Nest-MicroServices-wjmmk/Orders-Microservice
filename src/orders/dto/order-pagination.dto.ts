import { IsEnum, IsOptional } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";
import { PaginationDto } from "src/common";
import { OrderStatus } from "@prisma/client";



export class OrderPaginationDto extends PaginationDto {
    
    @IsOptional()
    @IsEnum(
        OrderStatusList,
        { message: `Status must be one of the following values: ${OrderStatusList.join(', ')}` }
    )
    status?: OrderStatus;

}