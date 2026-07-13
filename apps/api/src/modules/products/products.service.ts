import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filter: {
    organizationId: string;
    categoryId?: string;
    brandId?: string;
    status?: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Record<string, unknown>[];
    meta: Record<string, unknown>;
  }> {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ProductWhereInput = {
      organizationId: filter.organizationId,
      deletedAt: null,
    };

    if (filter.categoryId) {
      whereClause.categoryId = filter.categoryId;
    }

    if (filter.brandId) {
      whereClause.brandId = filter.brandId;
    }

    if (filter.status) {
      whereClause.status = filter.status;
    }

    if (filter.search) {
      whereClause.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { code: { contains: filter.search, mode: 'insensitive' } },
        { sku: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: whereClause,
        orderBy: [{ createdAt: 'desc' }],
        skip,
        take: limit,
        include: {
          category: true,
          brand: true,
          unit: true,
          tax: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          variants: {
            where: { status: 'ACTIVE' },
            include: {
              barcodes: true,
              prices: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where: whereClause }),
    ]);

    const mappedData = products.map((p) =>
      this.mapProductDecimals(p as unknown as Record<string, unknown>),
    );

    return {
      data: mappedData,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    const product = await this.prisma.product.findFirst({
      where: { id, organizationId, deletedAt: null },
      include: {
        category: true,
        brand: true,
        unit: true,
        tax: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        marketplaceMappings: true,
        variants: {
          include: {
            barcodes: true,
            prices: true,
            marketplaceMappings: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapProductDecimals(
      product as unknown as Record<string, unknown>,
    );
  }

  async create(
    dto: CreateProductDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Create product master
        const product = await tx.product.create({
          data: {
            organizationId,
            categoryId: dto.categoryId,
            brandId: dto.brandId || null,
            unitId: dto.unitId,
            taxId: dto.taxId || null,
            code: dto.code,
            sku: dto.sku || null,
            name: dto.name,
            shortName: dto.shortName,
            description: dto.description,
            status: dto.status || 'DRAFT',
            isActive: dto.isActive !== undefined ? dto.isActive : true,
            isSerialized: dto.isSerialized || false,
            allowBackorder: dto.allowBackorder || false,
            weight: dto.weight ? new Prisma.Decimal(dto.weight) : null,
            width: dto.width ? new Prisma.Decimal(dto.width) : null,
            height: dto.height ? new Prisma.Decimal(dto.height) : null,
            length: dto.length ? new Prisma.Decimal(dto.length) : null,
            slug: dto.slug,
            metaTitle: dto.metaTitle,
            metaKeyword: dto.metaKeyword,
            metaDescription: dto.metaDescription,
          },
        });

        // Create images if provided
        if (dto.images && dto.images.length > 0) {
          await tx.productImage.createMany({
            data: dto.images.map((img) => ({
              productId: product.id,
              url: img.url,
              sortOrder: img.sortOrder || 0,
              altText: img.altText,
            })),
          });
        }

        // Create product mappings if provided
        if (dto.marketplaceMappings && dto.marketplaceMappings.length > 0) {
          await tx.productMarketplace.createMany({
            data: dto.marketplaceMappings.map((m) => ({
              productId: product.id,
              marketplace: m.marketplace,
              externalProductId: m.externalProductId,
            })),
          });
        }

        // Create variants if provided
        if (dto.variants && dto.variants.length > 0) {
          for (const variantDto of dto.variants) {
            const variant = await tx.productVariant.create({
              data: {
                productId: product.id,
                sku: variantDto.sku,
                name: variantDto.name,
                weight: variantDto.weight
                  ? new Prisma.Decimal(variantDto.weight)
                  : null,
                status: variantDto.status || 'ACTIVE',
              },
            });

            // Create barcodes
            if (variantDto.barcodes && variantDto.barcodes.length > 0) {
              await tx.productBarcode.createMany({
                data: variantDto.barcodes.map((b) => ({
                  variantId: variant.id,
                  barcode: b.barcode,
                  isDefault: b.isDefault || false,
                })),
              });
            }

            // Create prices
            if (variantDto.prices && variantDto.prices.length > 0) {
              await tx.productPrice.createMany({
                data: variantDto.prices.map((p) => ({
                  variantId: variant.id,
                  priceType: p.priceType,
                  price: new Prisma.Decimal(p.price),
                  currency: p.currency || 'THB',
                  startDate: p.startDate ? new Date(p.startDate) : null,
                  endDate: p.endDate ? new Date(p.endDate) : null,
                })),
              });
            }

            // Create variant attribute linkages
            if (
              variantDto.attributeValueIds &&
              variantDto.attributeValueIds.length > 0
            ) {
              await tx.productVariantAttributeValue.createMany({
                data: variantDto.attributeValueIds.map((valId) => ({
                  variantId: variant.id,
                  attributeValueId: valId,
                })),
              });
            }

            // Create marketplace mappings for variant
            if (
              variantDto.marketplaceMappings &&
              variantDto.marketplaceMappings.length > 0
            ) {
              await tx.productMarketplace.createMany({
                data: variantDto.marketplaceMappings.map((m) => ({
                  variantId: variant.id,
                  marketplace: m.marketplace,
                  externalProductId: m.externalProductId,
                  externalVariantId: m.externalVariantId,
                })),
              });
            }
          }
        }

        return this.findOneInternal(product.id, tx);
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    await this.findOne(id, organizationId);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const updateData: Prisma.ProductUpdateInput = {
          code: dto.code,
          sku: dto.sku,
          name: dto.name,
          shortName: dto.shortName,
          description: dto.description,
          status: dto.status,
          isActive: dto.isActive,
          isSerialized: dto.isSerialized,
          allowBackorder: dto.allowBackorder,
          slug: dto.slug,
          metaTitle: dto.metaTitle,
          metaKeyword: dto.metaKeyword,
          metaDescription: dto.metaDescription,
        };

        if (dto.categoryId) {
          updateData.category = { connect: { id: dto.categoryId } };
        }
        if (dto.brandId !== undefined) {
          updateData.brand = dto.brandId
            ? { connect: { id: dto.brandId } }
            : { disconnect: true };
        }
        if (dto.unitId) {
          updateData.unit = { connect: { id: dto.unitId } };
        }
        if (dto.taxId !== undefined) {
          updateData.tax = dto.taxId
            ? { connect: { id: dto.taxId } }
            : { disconnect: true };
        }

        if (dto.weight !== undefined)
          updateData.weight = dto.weight
            ? new Prisma.Decimal(dto.weight)
            : null;
        if (dto.width !== undefined)
          updateData.width = dto.width ? new Prisma.Decimal(dto.width) : null;
        if (dto.height !== undefined)
          updateData.height = dto.height
            ? new Prisma.Decimal(dto.height)
            : null;
        if (dto.length !== undefined)
          updateData.length = dto.length
            ? new Prisma.Decimal(dto.length)
            : null;

        const product = await tx.product.update({
          where: { id },
          data: updateData,
        });

        // Replace images if provided
        if (dto.images !== undefined) {
          await tx.productImage.deleteMany({
            where: { productId: product.id },
          });
          if (dto.images.length > 0) {
            await tx.productImage.createMany({
              data: dto.images.map((img) => ({
                productId: product.id,
                url: img.url,
                sortOrder: img.sortOrder || 0,
                altText: img.altText,
              })),
            });
          }
        }

        // Replace product level mappings
        if (dto.marketplaceMappings !== undefined) {
          await tx.productMarketplace.deleteMany({
            where: { productId: product.id },
          });
          if (dto.marketplaceMappings.length > 0) {
            await tx.productMarketplace.createMany({
              data: dto.marketplaceMappings.map((m) => ({
                productId: product.id,
                marketplace: m.marketplace,
                externalProductId: m.externalProductId,
              })),
            });
          }
        }

        // Replace variants if provided
        if (dto.variants !== undefined) {
          // Soft delete old variants or cascade delete relations
          const oldVariants = await tx.productVariant.findMany({
            where: { productId: product.id },
          });
          for (const oldV of oldVariants) {
            await tx.productVariantAttributeValue.deleteMany({
              where: { variantId: oldV.id },
            });
            await tx.productBarcode.deleteMany({
              where: { variantId: oldV.id },
            });
            await tx.productPrice.deleteMany({ where: { variantId: oldV.id } });
            await tx.productMarketplace.deleteMany({
              where: { variantId: oldV.id },
            });
          }
          await tx.productVariant.deleteMany({
            where: { productId: product.id },
          });

          // Re-create new variants
          if (dto.variants.length > 0) {
            for (const variantDto of dto.variants) {
              const variant = await tx.productVariant.create({
                data: {
                  productId: product.id,
                  sku: variantDto.sku,
                  name: variantDto.name,
                  weight: variantDto.weight
                    ? new Prisma.Decimal(variantDto.weight)
                    : null,
                  status: variantDto.status || 'ACTIVE',
                },
              });

              if (variantDto.barcodes && variantDto.barcodes.length > 0) {
                await tx.productBarcode.createMany({
                  data: variantDto.barcodes.map((b) => ({
                    variantId: variant.id,
                    barcode: b.barcode,
                    isDefault: b.isDefault || false,
                  })),
                });
              }

              if (variantDto.prices && variantDto.prices.length > 0) {
                await tx.productPrice.createMany({
                  data: variantDto.prices.map((p) => ({
                    variantId: variant.id,
                    priceType: p.priceType,
                    price: new Prisma.Decimal(p.price),
                    currency: p.currency || 'THB',
                    startDate: p.startDate ? new Date(p.startDate) : null,
                    endDate: p.endDate ? new Date(p.endDate) : null,
                  })),
                });
              }

              if (
                variantDto.attributeValueIds &&
                variantDto.attributeValueIds.length > 0
              ) {
                await tx.productVariantAttributeValue.createMany({
                  data: variantDto.attributeValueIds.map((valId) => ({
                    variantId: variant.id,
                    attributeValueId: valId,
                  })),
                });
              }

              if (
                variantDto.marketplaceMappings &&
                variantDto.marketplaceMappings.length > 0
              ) {
                await tx.productMarketplace.createMany({
                  data: variantDto.marketplaceMappings.map((m) => ({
                    variantId: variant.id,
                    marketplace: m.marketplace,
                    externalProductId: m.externalProductId,
                    externalVariantId: m.externalVariantId,
                  })),
                });
              }
            }
          }
        }

        return this.findOneInternal(product.id, tx);
      });
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  async remove(
    id: string,
    organizationId: string,
  ): Promise<Record<string, unknown>> {
    await this.findOne(id, organizationId);

    const product = await this.prisma.product.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        deletedAt: new Date(),
      },
    });

    return this.mapProductDecimals(
      product as unknown as Record<string, unknown>,
    );
  }

  private async findOneInternal(
    id: string,
    tx: Prisma.TransactionClient,
  ): Promise<Record<string, unknown>> {
    const product = await tx.product.findFirst({
      where: { id, deletedAt: null },
      include: {
        category: true,
        brand: true,
        unit: true,
        tax: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        marketplaceMappings: true,
        variants: {
          include: {
            barcodes: true,
            prices: true,
            marketplaceMappings: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.mapProductDecimals(
      product as unknown as Record<string, unknown>,
    );
  }

  private mapProductDecimals(
    p: Record<string, unknown>,
  ): Record<string, unknown> {
    const pWeight = p.weight ? Number(p.weight) : null;
    const pWidth = p.width ? Number(p.width) : null;
    const pHeight = p.height ? Number(p.height) : null;
    const pLength = p.length ? Number(p.length) : null;

    const pTax = p.tax ? (p.tax as Record<string, unknown>) : null;
    const tax = pTax ? { ...pTax, rate: Number(pTax.rate) } : null;

    const pVariants = p.variants
      ? (p.variants as Record<string, unknown>[])
      : [];
    const variants = pVariants.map((v) => {
      const vWeight = v.weight ? Number(v.weight) : null;
      const pPrices = v.prices ? (v.prices as Record<string, unknown>[]) : [];
      const prices = pPrices.map((pr) => ({
        ...pr,
        price: Number(pr.price),
      }));
      return {
        ...v,
        weight: vWeight,
        prices,
      };
    });

    return {
      ...p,
      weight: pWeight,
      width: pWidth,
      height: pHeight,
      length: pLength,
      tax,
      variants,
    };
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Product code or slug already exists');
      }
      if (error.code === 'P2003') {
        throw new NotFoundException('Related foreign key reference not found');
      }
    }
    throw error;
  }
}
