import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ReservasProductosUpdateDTO } from './dto/reservas-productos-update.dto';
import { ReservasProductosService } from './reservas-productos.service';

@Controller('reservas-productos')
export class ReservasProductosController {

  constructor(private reservasProductosService: ReservasProductosService) { }

  // Producto por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getReserva(@Res() res, @Param('id') productoID) {
    const producto = await this.reservasProductosService.getProducto(productoID);
    res.status(HttpStatus.OK).json({
      message: 'Producto obtenido correctamente',
      producto
    });
  }

  // Crear producto
  @Post('/')
  async crearProducto(@Res() res, @Body() reservasProductosDTO: any) {
    const producto = await this.reservasProductosService.crearProducto(reservasProductosDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Producto creado correctamente',
      producto
    });
  }

  // Listar productos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarProductos(@Res() res, @Query() querys) {
    const { productos, totalItems } = await this.reservasProductosService.listarProductos(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de productos correcto',
      productos,
      totalItems
    });
  }

  // Actualizar producto
  @Put('/:id')
  async actualizarProducto(@Res() res, @Body() reservasProductosUpdateDTO: ReservasProductosUpdateDTO, @Param('id') productoID) {
    const producto = await this.reservasProductosService.actualizarProducto(productoID, reservasProductosUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Producto actualizado correctamente',
      producto
    });
  }

}
