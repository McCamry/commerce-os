import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PurchaseReturnsService } from './purchase-returns.service';
import { PrismaService } from '../../database/prisma.service';

describe('PurchaseReturnsService', () => {
  let service: PurchaseReturnsService;
  const prisma = {
    purchaseReturn: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const baseDto = {
    vendorId: 'vendor-1',
    returnNo: 'RET-001',
    items: [{ variantId: 'v-1', unitId: 'u-1', quantity: 2 }],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseReturnsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<PurchaseReturnsService>(PurchaseReturnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects a return with no items', async () => {
    await expect(
      service.create({ ...baseDto, items: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('defaults status to DRAFT on create', async () => {
    prisma.purchaseReturn.create.mockResolvedValue({ id: 'pr-1' });
    await service.create(baseDto);
    expect(prisma.purchaseReturn.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DRAFT' }),
      }),
    );
  });

  it('throws NotFoundException when a return is missing', async () => {
    prisma.purchaseReturn.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('soft-deletes by setting deletedAt only', async () => {
    prisma.purchaseReturn.findFirst.mockResolvedValue({ id: 'pr-1' });
    await service.remove('pr-1');
    expect(prisma.purchaseReturn.update).toHaveBeenCalledWith({
      where: { id: 'pr-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
