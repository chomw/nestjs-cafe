import { Controller, Get, Post, Body, Patch, Param, Delete, Logger, UseFilters, UseInterceptors, UseGuards } from '@nestjs/common';
import { CafeService } from './cafe.service';
import { CreateCafeDto } from './dto/create-cafe.dto';
import { UpdateCafeDto } from './dto/update-cafe.dto';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('api/cafe')
export class CafeController {
  private readonly logger = new Logger(CafeController.name);

  constructor(private readonly cafeService: CafeService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(TransformInterceptor)
  @UseFilters(HttpExceptionFilter)
  create(@GetUser() user: any, @Body() createCafeDto: CreateCafeDto) {
    this.logger.debug('create() : ' + JSON.stringify(createCafeDto) + ', user: ' + JSON.stringify(user));
    return this.cafeService.create(createCafeDto);
  }

  // @Get()
  // findAll() {
  //   return this.cafeService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.cafeService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCafeDto: UpdateCafeDto) {
  //   return this.cafeService.update(+id, updateCafeDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.cafeService.remove(+id);
  // }
}
