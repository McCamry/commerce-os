import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomersService } from './customers.service';
import { PrismaService } from '../../database/prisma.service';

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: {
    customer: {
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      customer: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('scopes by organizationId and excludes soft-deleted rows', () => {
      prisma.customer.findMany.mockResolvedValue([]);

      service.findAll({ organizationId: 'org-1' });

      expect(prisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { organizationId: 'org-1', deletedAt: null },
        }),
      );
    });

    it('applies optional customerGroupId and status filters', () => {
      prisma.customer.findMany.mockResolvedValue([]);

      service.findAll({
        organizationId: 'org-1',
        customerGroupId: 'grp-1',
        status: 'ACTIVE',
      });

      expect(prisma.customer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            organizationId: 'org-1',
            deletedAt: null,
            customerGroupId: 'grp-1',
            status: 'ACTIVE',
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the customer when found and scopes the query by organization', async () => {
      const customer = { id: 'c-1' };
      prisma.customer.findFirst.mockResolvedValue(customer);

      await expect(service.findOne('c-1', 'org-1')).resolves.toBe(customer);
      expect(prisma.customer.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c-1', organizationId: 'org-1', deletedAt: null },
        }),
      );
    });

    it('throws NotFoundException when the record belongs to another org', async () => {
      // Row exists but not under this org → scoped query returns null.
      prisma.customer.findFirst.mockResolvedValue(null);

      await expect(service.findOne('c-1', 'other-org')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('defaults creditDays to 0 and status to ACTIVE', async () => {
      prisma.customer.create.mockResolvedValue({ id: 'c-1' });

      await service.create({
        organizationId: 'org-1',
        code: 'CUST001',
        name: 'ACME',
      });

      expect(prisma.customer.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ creditDays: 0, status: 'ACTIVE' }),
        }),
      );
    });

    it('maps a unique-constraint violation to ConflictException', async () => {
      prisma.customer.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('duplicate', {
          code: 'P2002',
          clientVersion: 'test',
        }),
      );

      await expect(
        service.create({ organizationId: 'org-1', code: 'CUST001', name: 'A' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('remove', () => {
    it('soft-deletes by setting status INACTIVE and deletedAt', async () => {
      prisma.customer.findFirst.mockResolvedValue({ id: 'c-1' });
      prisma.customer.update.mockResolvedValue({ id: 'c-1' });

      await service.remove('c-1', 'org-1');

      expect(prisma.customer.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'c-1' },
          data: expect.objectContaining({
            status: 'INACTIVE',
            deletedAt: expect.any(Date),
          }),
        }),
      );
    });
  });
});
