import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PurchaseRequestsService } from './purchase-requests.service';
import { PrismaService } from '../../database/prisma.service';

describe('PurchaseRequestsService', () => {
  let service: PurchaseRequestsService;
  const prisma = {
    purchaseRequest: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<PurchaseRequestsService>(PurchaseRequestsService);
  });

  const baseDto = {
    organizationId: 'org-1',
    storeId: 'store-1',
    requestNo: 'PR-001',
    requestBy: 'user-1',
    items: [{ variantId: 'v-1', unitId: 'u-1', quantity: 5 }],
  };

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('scopes findAll by organization/store and excludes soft-deleted rows', () => {
    prisma.purchaseRequest.findMany.mockResolvedValue([]);
    service.findAll({ organizationId: 'org-1', storeId: 'store-1' });
    expect(prisma.purchaseRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org-1', deletedAt: null, storeId: 'store-1' },
      }),
    );
  });

  it('rejects a request with no items', async () => {
    await expect(
      service.create({ ...baseDto, items: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('defaults status to DRAFT on create', async () => {
    prisma.purchaseRequest.create.mockResolvedValue({ id: 'pr-1' });
    await service.create(baseDto);
    expect(prisma.purchaseRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'DRAFT' }),
      }),
    );
  });

  it('throws NotFoundException when a request is missing', async () => {
    prisma.purchaseRequest.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('soft-deletes by setting deletedAt only', async () => {
    prisma.purchaseRequest.findFirst.mockResolvedValue({ id: 'pr-1' });
    await service.remove('pr-1');
    expect(prisma.purchaseRequest.update).toHaveBeenCalledWith({
      where: { id: 'pr-1' },
      data: { deletedAt: expect.any(Date) },
    });
  });
});
