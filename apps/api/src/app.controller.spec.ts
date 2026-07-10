import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const appService = { getHello: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{ provide: AppService, useValue: appService }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('returns the health payload from the service', async () => {
      const payload = { success: true, database: 'connected' };
      appService.getHello.mockResolvedValue(payload);

      await expect(appController.getHello()).resolves.toBe(payload);
      expect(appService.getHello).toHaveBeenCalledTimes(1);
    });
  });
});
