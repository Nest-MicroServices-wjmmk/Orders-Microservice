import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, OrderPaginationDto } from './dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('OrdersService');

  constructor(
    @Inject('NATS_SERVICE') private readonly client: ClientProxy
  ) {
    super();
  }

  async onModuleInit() {
    const reset = '\x1b[33m';
    const start = Date.now();
    await this.$connect();
    const end = Date.now();
    const duration = end - start;
    this.logger.log(`OrdersService connected to database ${reset}${duration}ms`);
  }

  async create(createOrderDto: CreateOrderDto) {

    try {
      // Validate "id" of each product in the order
      const productIds = createOrderDto.items.map(item => item.productId);
      const products: any[] = await firstValueFrom(this.client.send({ cmd: 'validate_products'}, productIds));

      // Relialize the calculation of the total amount of the order
      const totalAmount = createOrderDto.items.reduce((acc, orderItem) => {
        const priceByQuantity = products.find((product: { id: number; }) => product.id === orderItem.productId).price;
        return priceByQuantity * orderItem.quantity;
      }, 0);

      // Summation of the total amount of the order
      const totalItems = createOrderDto.items.reduce((acc, orderItem) => {
        return acc + orderItem.quantity;
      }, 0);

      // Create a transaction to save the order and update the stock of the products
      const order = await this.order.create({
        data: {
          totalAmount,
          totalItems,
          OrderItem: {
            createMany:{ 
              data: createOrderDto.items.map((orderItem) => {
                return {
                  price: products.find((product: { id: number; }) => product.id === orderItem.productId).price,
                  productId: orderItem.productId,
                  quantity: orderItem.quantity
                }
              }) 
            }
          }
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true
            }
          }
        }
      });

      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          productName: products.find((product: { id: number; }) => product.id === orderItem.productId).name
        }))
      };

    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST
      });
    }  
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
    const order = await this.order.findUnique({ 
      where: { id },
      include: {
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            productId: true
          }
        }
      }
    });

    if (!order) {
      throw new RpcException({
        message:`Order with id: ➡${id}⬅ not found.`,
        status: HttpStatus.BAD_REQUEST
      });
    }

    const productIds = order.OrderItem.map((item) => item.productId);
    const products: any[] = await firstValueFrom(this.client.send({ cmd: 'validate_products'}, productIds));

    return {
      ...order,
      OrderItem: order.OrderItem.map((orderItem) => ({
        ...orderItem,
        productName: products.find((product: { id: number; }) => product.id === orderItem.productId).name 
      }))
    };
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
