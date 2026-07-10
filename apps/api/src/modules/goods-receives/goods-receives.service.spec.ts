import { Test, TestingModule } from '@nestjs/testing';
import { GoodsReceivesService } from './goods-receives.service';
import { PrismaService } from '../../database/prisma.service';

describe('GoodsReceivesService', () => {
  let service: GoodsReceivesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoodsReceivesService,
        { provide: PrismaService, useValue: { $transaction: jest.fn() } },
      ],
    }).compile();

    service = module.get<GoodsReceivesService>(GoodsReceivesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
