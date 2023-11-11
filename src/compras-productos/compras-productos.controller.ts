import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ComprasProductosService } from './compras-productos.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ComprasProductosDTO } from './dto/compras-productos.dto';
import { ComprasProductosUpdateDTO } from './dto/compras-productos-update.dto';

@Controller('compras-productos')
export class ComprasProductosController {

  constructor(private comprasProductosService: ComprasProductosService) { }

  // Compra-Producto por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getCompraProducto(@Res() res, @Param('id') compraProductoID) {
    const compraProducto = await this.comprasProductosService.getCompraProducto(compraProductoID);
    res.status(HttpStatus.OK).json({
      message: 'Producto obtenido correctamente',
      compraProducto
    });
  }

  // Listar compras-productos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarComprasProductos(@Res() res, @Query() querys) {
    const comprasProductos = await this.comprasProductosService.listarComprasProductos(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de productos correcto',
      comprasProductos
    });
  }

  // Crear compra-producto
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearCompraProducto(@Res() res, @Body() comprasProductosDTO: ComprasProductosDTO) {
    const compraProducto = await this.comprasProductosService.crearCompraProducto(comprasProductosDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Producto creado correctamente',
      compraProducto
    });
  }

  // Crear Multiples - compra-producto
  @UseGuards(JwtAuthGuard)
  @Post('/multi')
  async crearMultiCompraProducto(@Res() res, @Body() data: any) {
    await this.comprasProductosService.crearMultiCompraProducto(data);
    res.status(HttpStatus.CREATED).json({
      message: 'Productos creados correctamente',
    });
  }

  // Actualizar compra-producto
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarCompraProducto(@Res() res, @Body() comprasProductosUpdateDTO: ComprasProductosUpdateDTO, @Param('id') compraProductoID) {
    const compraProducto = await this.comprasProductosService.actualizarCompraProducto(compraProductoID, comprasProductosUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Producto actualizado correctamente',
      compraProducto
    });
  }

  // Eliminar compra-producto
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async eliminarCompraProducto(@Res() res, @Param('id') compraProductoID) {
    const compraProducto = await this.comprasProductosService.eliminarCompraProducto(compraProductoID);
    res.status(HttpStatus.OK).json({
      message: 'Producto eliminado correctamente',
      compraProducto
    });
  }

}
