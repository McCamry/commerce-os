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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(
    @CurrentUser('organizationId') organizationId: string,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll({ organizationId, search });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.usersService.findOne(id, organizationId);
  }

  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.usersService.create(dto, organizationId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.usersService.update(id, dto, organizationId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('organizationId') organizationId: string,
  ) {
    return this.usersService.remove(id, organizationId);
  }
}
