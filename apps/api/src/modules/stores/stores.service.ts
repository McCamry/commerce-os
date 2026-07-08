import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.store.findMany({
      where: { deletedAt: null },
      orderBy: [{ name: 'asc' }],
      include: this.storeRelations(),
    });
  }

  async findOne(id: string) {
    const store = await this.prisma.store.findFirst({
      where: { id, deletedAt: null },
      include: this.storeRelations(),
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    return store;
  }

  async create(dto: CreateStoreDto) {
    try {
      return await this.prisma.store.create({
        data: {
          organizationId: dto.organizationId,
          code: dto.code,
          name: dto.name,
          slug: dto.slug,
          taxId: dto.taxId,
          contactPerson: dto.contactPerson,
          phone1: dto.phone1,
          phone2: dto.phone2,
          email: dto.email,
          address1: dto.address1,
          address2: dto.address2,
          remark: dto.remark,
          countryId: dto.countryId,
          provinceId: dto.provinceId,
          districtId: dto.districtId,
          subdistrictId: dto.subdistrictId,
          timezone: dto.timezone,
          currency: dto.currency,
        },
        include: this.storeRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(id: string, dto: UpdateStoreDto) {
    await this.findOne(id);

    try {
      return await this.prisma.store.update({
        where: { id },
        data: dto,
        include: this.storeRelations(),
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.store.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
      include: this.storeRelations(),
    });
  }

  private storeRelations() {
    return {
      organization: true,
      country: true,
      province: true,
      district: true,
      subdistrict: true,
    } satisfies Prisma.StoreInclude;
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Store code or slug already exists');
      }

      if (error.code === 'P2003') {
        throw new NotFoundException(
          'Related organization or location not found',
        );
      }
    }

    throw error;
  }
}
