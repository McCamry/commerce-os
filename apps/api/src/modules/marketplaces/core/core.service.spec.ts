import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { CoreService } from './core.service';
import { PrismaService } from '../../../database/prisma.service';

describe('CoreService', () => {
  let service: CoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreService,
        { provide: PrismaService, useValue: {} },
        {
          provide: getQueueToken('marketplace_sync'),
          useValue: { add: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CoreService>(CoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
