import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('customerGroupId') customerGroupId?: string,
    @Query('status') status?: 'ACTIVE' | 'INACTIVE',
  ) {
    return this.customersService.findAll({
      organizationId,
      customerGroupId,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.customersService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.customersService.create(dto, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.customersService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.customersService.remove(id, organizationId);
  }
}
