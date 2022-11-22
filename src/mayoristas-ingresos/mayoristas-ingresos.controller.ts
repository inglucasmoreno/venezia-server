import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MayoristasIngresosUpdateDTO } from './dto/mayoristas-ingresos-update.dto';
import { MayoristasIngresosDTO } from './dto/mayoristas-ingresos.dto';
import { MayoristasIngresosService } from './mayoristas-ingresos.service';

@Controller('mayoristas-ingresos')
export class MayoristasIngresosController {

  constructor(private ingresosService: MayoristasIngresosService) { }

  // Ingreso por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getIngreso(@Res() res, @Param('id') ingresoID) {
    const ingreso = await this.ingresosService.getIngreso(ingresoID);
    res.status(HttpStatus.OK).json({
      message: 'Ingreso obtenido correctamente',
      ingreso
    });
  }

  // Listar ingresos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarIngresos(@Res() res, @Query() querys) {
    const { ingresos, totalItems, montoTotal } = await this.ingresosService.listarIngresos(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de ingresos correcto',
      ingresos,
      totalItems,
      montoTotal
    });
  }

  // Crear ingreso
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearIngreso(@Res() res, @Body() ingresosDTO: MayoristasIngresosDTO) {
    const ingreso = await this.ingresosService.crearIngreso(ingresosDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Ingreso creado correctamente',
      ingreso
    });
  }

  // Actualizar ingreso
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarIngreso(@Res() res, @Body() ingresosUpdateDTO: MayoristasIngresosUpdateDTO, @Param('id') ingresoID) {
    const ingreso = await this.ingresosService.actualizarIngreso(ingresoID, ingresosUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Ingreso actualizado correctamente',
      ingreso
    });
  }

  // Eliminar ingreso
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async eliminarIngreso(@Res() res, @Param('id') ingresoID) {
    const ingreso = await this.ingresosService.eliminarIngreso(ingresoID);
    res.status(HttpStatus.OK).json({
      message: 'Ingreso eliminado correctamente',
      ingreso
    });
  }

}
