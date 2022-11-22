import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MayoristasGastosUpdateDTO } from './dto/mayoristas-gastos-update.dto';
import { MayoristasGastosDTO } from './dto/mayoristas-gastos.dto';
import { MayoristasGastosService } from './mayoristas-gastos.service';

@Controller('mayoristas-gastos')
export class MayoristasGastosController {

  constructor(private gastosService: MayoristasGastosService) { }

  // Gasto por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getGasto(@Res() res, @Param('id') gastoID) {
    const gasto = await this.gastosService.getGasto(gastoID);
    res.status(HttpStatus.OK).json({
      message: 'Gasto obtenido correctamente',
      gasto
    });
  }

  // Listar gastos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarGastos(@Res() res, @Query() querys) {
    const { gastos, totalItems, montoTotal } = await this.gastosService.listarGastos(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de gastos correcto',
      gastos,
      totalItems,
      montoTotal
    });
  }

  // Crear gasto
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearGasto(@Res() res, @Body() gastosDTO: MayoristasGastosDTO) {
    const gasto = await this.gastosService.crearGasto(gastosDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Gasto creado correctamente',
      gasto
    });
  }

  // Actualizar gasto
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarGasto(@Res() res, @Body() gastosUpdateDTO: MayoristasGastosUpdateDTO, @Param('id') gastoID) {
    const gasto = await this.gastosService.actualizarGasto(gastoID, gastosUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Gasto actualizado correctamente',
      gasto
    });
  }

  // Eliminar gasto
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async eliminarGasto(@Res() res, @Param('id') gastoID) {
    const gasto = await this.gastosService.eliminarGasto(gastoID);
    res.status(HttpStatus.OK).json({
      message: 'Gasto eliminado correctamente',
      gasto
    });
  }

}
