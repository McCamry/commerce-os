import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: {
    organizationId: string;
    customerGroupId?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) {
    const whereClause: Prisma.CustomerWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.customerGroupId) {
      whereClause.customerGroupId = filter.customerGroupId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.customer.findMany({
      where: whereClause,
      orderBy: [{ name: 'asc' }],
      include: { customerGroup: true },
    });
  }

  async findOne(id: string, organizationId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: this.customerRelations(),
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(dto: CreateCustomerDto, organizationId: string) {
    try {
      return await this.prisma.customer.create({
        data: {
          organizationId,
          customerGroupId: dto.customerGroupId,
          code: dto.code,
          name: dto.name,
          taxId: dto.taxId,
          branch: dto.branch,
          contactPerson: dto.contactPerson,
          phone1: dto.phone1,
          phone2: dto.phone2,
          email: dto.email,
          creditDays: dto.creditDays ?? 0,
          creditLimit: dto.creditLimit,
          status: dto.status || 'ACTIVE',
        },
        include: this.customerRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateCustomerDto, organizationId: string) {
    await this.findOne(id, organizationId);

    try {
      return await this.prisma.customer.update({
        where: { id },
        data: {
          customerGroupId: dto.customerGroupId,
          code: dto.code,
          name: dto.name,
          taxId: dto.taxId,
          branch: dto.branch,
          contactPerson: dto.contactPerson,
          phone1: dto.phone1,
          phone2: dto.phone2,
          email: dto.email,
          creditDays: dto.creditDays,
          creditLimit: dto.creditLimit,
          status: dto.status,
        },
        include: this.customerRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.customer.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
  }

  private customerRelations() {
    return {
      customerGroup: true,
      addresses: true,
      contacts: true,
    } satisfies Prisma.CustomerInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Customer code already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related organization or customer group not found',
        );
      }
    }

    throw error;
  }
}
