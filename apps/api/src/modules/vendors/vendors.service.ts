import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filter: { organizationId: string; status?: 'ACTIVE' | 'INACTIVE' }) {
    const whereClause: Prisma.VendorWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.status) {
      whereClause.status = filter.status;
    }

    return this.prisma.vendor.findMany({
      where: whereClause,
      orderBy: [{ name: 'asc' }],
    });
  }

  async findOne(id: string, organizationId: string) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: this.vendorRelations(),
    });

    if (!vendor) {
      throw new NotFoundException('Vendor not found');
    }

    return vendor;
  }

  async create(dto: CreateVendorDto) {
    try {
      return await this.prisma.vendor.create({
        data: {
          organizationId: dto.organizationId,
          code: dto.code,
          name: dto.name,
          taxId: dto.taxId,
          branch: dto.branch,
          contactPerson: dto.contactPerson,
          phone1: dto.phone1,
          phone2: dto.phone2,
          email: dto.email,
          website: dto.website,
          creditDays: dto.creditDays ?? 0,
          creditLimit: dto.creditLimit,
          paymentTerm: dto.paymentTerm,
          status: dto.status || 'ACTIVE',
        },
        include: this.vendorRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateVendorDto, organizationId: string) {
    await this.findOne(id, organizationId);

    try {
      return await this.prisma.vendor.update({
        where: { id },
        data: {
          code: dto.code,
          name: dto.name,
          taxId: dto.taxId,
          branch: dto.branch,
          contactPerson: dto.contactPerson,
          phone1: dto.phone1,
          phone2: dto.phone2,
          email: dto.email,
          website: dto.website,
          creditDays: dto.creditDays,
          creditLimit: dto.creditLimit,
          paymentTerm: dto.paymentTerm,
          status: dto.status,
        },
        include: this.vendorRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string, organizationId: string) {
    await this.findOne(id, organizationId);

    return this.prisma.vendor.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
  }

  private vendorRelations() {
    return {
      addresses: true,
      contacts: true,
      priceLists: true,
    } satisfies Prisma.VendorInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Vendor code already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException('Related organization not found');
      }
    }

    throw error;
  }
}
