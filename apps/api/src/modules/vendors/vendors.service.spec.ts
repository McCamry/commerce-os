import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { VendorsService } from './vendors.service';
import { PrismaService } from '../../database/prisma.service';

describe('VendorsService', () => {
  let service: VendorsService;
  let prisma: {
    vendor: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      vendor: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [VendorsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<VendorsService>(VendorsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('scopes by organizationId and excludes soft-deleted rows', () => {
      prisma.vendor.findMany.mockResolvedValue([]);

      service.findAll({ organizationId: 'org-1' });

      expect(prisma.vendor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-1', deletedAt: null },
        }),
      );
    });

    it('applies the optional status filter', () => {
      prisma.vendor.findMany.mockResolvedValue([]);

      service.findAll({ organizationId: 'org-1', status: 'INACTIVE' });

      expect(prisma.vendor.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId: 'org-1',
            deletedAt: null,
            status: 'INACTIVE',
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when missing', async () => {
      prisma.vendor.findFirst.mockResolvedValue(null);

      await expect(service.findOne('missing', 'org-1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('defaults creditDays to 0 and status to ACTIVE', async () => {
      prisma.vendor.create.mockResolvedValue({ id: 'v-1' });

      await service.create(
        {
          code: 'VEND001',
          name: 'Supplier Co',
        },
        'org-1',
      );

      expect(prisma.vendor.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ creditDays: 0, status: 'ACTIVE' }),
        }),
      );
    });

    it('maps a unique-constraint violation to ConflictException', async () => {
      prisma.vendor.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.create({ code: 'VEND001', name: 'A' }, 'org-1'),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft-deletes by setting status INACTIVE and deletedAt', async () => {
      prisma.vendor.findFirst.mockResolvedValue({ id: 'v-1' });
      prisma.vendor.update.mockResolvedValue({ id: 'v-1' });

      await service.remove('v-1', 'org-1');

      expect(prisma.vendor.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'v-1' },
          data: expect.objectContaining({
            status: 'INACTIVE',
            deletedAt: expect.any(Date),
          }),
        }),
      );
    });
  });
});
