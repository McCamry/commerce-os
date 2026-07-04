import { Injectable } from "@nestjs/common";
import { PrismaService } from "./database/prisma.service";

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: "ok",
      database: "connected",
      version: "0.1.0",
    };
  }
}