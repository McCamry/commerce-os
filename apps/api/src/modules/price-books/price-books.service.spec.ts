import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PriceBooksService } from './price-books.service';
import { PrismaService } from '../../database/prisma.service';

describe('PriceBooksService', () => {
  let service: PriceBooksService;
  const prisma = {
    priceBook: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    priceBookItem: { deleteMany: jest.fn() },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PriceBooksService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = module.get<PriceBooksService>(PriceBooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('scopes findAll by organizationId and excludes soft-deleted rows', () => {
    prisma.priceBook.findMany.mockResolvedValue([]);
    service.findAll({ organizationId: 'org-1', status: 'ACTIVE' });
    expect(prisma.priceBook.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { organizationId: 'org-1', deletedAt: null, status: 'ACTIVE' },
      }),
    );
  });

  it('throws NotFoundException when a price book is missing', async () => {
    prisma.priceBook.findFirst.mockResolvedValue(null);
    await expect(service.findOne('missing', 'org-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('defaults currency to THB and status to ACTIVE on create', async () => {
    prisma.priceBook.create.mockResolvedValue({ id: 'pb-1' });
    await service.create({ organizationId: 'org-1', code: 'PB1', name: 'Std' });
    expect(prisma.priceBook.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ currency: 'THB', status: 'ACTIVE' }),
      }),
    );
  });

  it('maps a unique-constraint violation to ConflictException', async () => {
    prisma.priceBook.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      service.create({ organizationId: 'org-1', code: 'PB1', name: 'Std' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('soft-deletes by setting status INACTIVE and deletedAt', async () => {
    prisma.priceBook.findFirst.mockResolvedValue({ id: 'pb-1' });
    prisma.priceBook.update.mockResolvedValue({ id: 'pb-1' });
    await service.remove('pb-1', 'org-1');
    expect(prisma.priceBook.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'INACTIVE',
          deletedAt: expect.any(Date),
        }),
      }),
    );
  });
});
