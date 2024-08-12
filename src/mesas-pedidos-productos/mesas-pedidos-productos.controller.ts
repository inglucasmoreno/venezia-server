import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { MesasPedidosProductosService } from './mesas-pedidos-productos.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MesasPedidosProductosDTO } from './dto/mesas-pedidos-productos.dto';
import { MesasPedidosProductosUpdateDTO } from './dto/mesas-pedidos-productos-update.dto';

@Controller('mesas-pedidos-productos')
export class MesasPedidosProductosController {

  constructor(private mesasPedidosProductosService: MesasPedidosProductosService) { }

  // Relacion por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getRelacion(@Res() res, @Param('id') relacionID) {
    const relacion = await this.mesasPedidosProductosService.getRelacion(relacionID);
    res.status(HttpStatus.OK).json({
      message: 'Relacion obtenida correctamente',
      relacion
    });
  }

  // Listar relaciones
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarRelaciones(@Res() res, @Query() querys) {
    const relaciones = await this.mesasPedidosProductosService.listarRelaciones(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de relaciones correcto',
      relaciones
    });
  }

  // Crear relacion
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearRelacion(@Res() res, @Body() mesasPedidosProductosDTO: MesasPedidosProductosDTO) {
    const relacion = await this.mesasPedidosProductosService.crearRelacion(mesasPedidosProductosDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Relacion creada correctamente',
      relacion
    });
  }

  // Actualizar relacion
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarRelacion(@Res() res, @Body() mesasPedidosProductosUpdateDTO: MesasPedidosProductosUpdateDTO, @Param('id') relacionID) {
    const relacion = await this.mesasPedidosProductosService.actualizarRelacion(relacionID, mesasPedidosProductosUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Relacion actualizada correctamente',
      relacion
    });
  }

  // Eliminar relacion
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async eliminarRelacion(@Res() res, @Param('id') relacionID) {
    const relacion = await this.mesasPedidosProductosService.eliminarRelacion(relacionID);
    res.status(HttpStatus.OK).json({
      message: 'Relacion eliminada correctamente',
      relacion
    });
  }

}
