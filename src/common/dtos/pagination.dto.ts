import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive } from "class-validator";


export class PaginationDto {

    @IsPositive()
    @IsOptional()
    @IsInt()
    @Type( () => Number)
    page?: number = 1;

    @IsPositive()
    @IsOptional()
    @IsInt()
    @Type( () => Number)
    limit?: number = 10;
}