import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaClient } from '@prisma/client';
import { number } from 'joi';
import { RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('OrdersService');

  async onModuleInit() {
    const reset = '\x1b[33m';
    const start = Date.now();
    await this.$connect();
    const end = Date.now();
    const duration = end - start;
    this.logger.log(`OrdersService connected to database ${reset}${duration}ms`);
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({ data: createOrderDto });
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {

    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    });

    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;

    return {
      meta: {
        page: currentPage,
        totalItems: totalPages,
        lastPages: Math.ceil(totalPages / perPage),
      },
      data: await this.order.findMany({
        skip: perPage * (currentPage - 1),
        take: perPage,
        where: {
          status: orderPaginationDto.status
        },
      })
    }
  }

  async findOne(id: string) {
    const order = await this.order.findUnique({ where: { id } });
    if (!order) {
      throw new RpcException({
        message:`Order with id: ➡${id}⬅ not found.`,
        status: HttpStatus.BAD_REQUEST
      });
    }
    return order;
  }

  async changeOrderStatus(changeOrderStatusDto: ChangeOrderStatusDto) {
    const { id, status } = changeOrderStatusDto;

    const order = await this.order.findUnique({ where: { id:id.toString() } });
    if(order.status === status) { return order; }
    
    return await this.order.update({
      where: { id: id.toString() },
      data: { status }
    });
  }
}
