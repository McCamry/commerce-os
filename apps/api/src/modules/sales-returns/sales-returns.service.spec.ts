import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SalesReturnsService } from './sales-returns.service';
import { PrismaService } from '../../database/prisma.service';

describe('SalesReturnsService', () => {
  let service: SalesReturnsService;
  const prisma = {
    salesReturn: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const baseDto = {
    salesOrderId: 'so-1',
    returnNo: 'SRET-001',
    items: [{ variantId: 'v-1', unitId: 'u-1', quantity: 1 }],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesReturnsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<SalesReturnsService>(SalesReturnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects a return with no items', async () => {
    await expect(
      service.create({ ...baseDto, items: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('defaults status to COMPLETED on create', async () => {
    prisma.salesReturn.create.mockResolvedValue({ id: 'sr-1' });
    await service.create(baseDto);
    expect(prisma.salesReturn.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'COMPLETED' }),
      }),
    );
  });

  it('throws NotFoundException when a return is missing', async () => {
    prisma.salesReturn.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 'org-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('soft-deletes by setting deletedAt only', async () => {
    prisma.salesReturn.findFirst.mockResolvedValue({ id: 'sr-1' });
    await service.remove('sr-1', 'org-1');
    expect(prisma.salesReturn.update).toHaveBeenCalledWith({
      where: { id: 'sr-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
