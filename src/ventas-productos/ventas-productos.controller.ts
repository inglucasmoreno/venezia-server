import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasProductosUpdateDTO } from './dto/ventas-productos-update.dto';
import { VentasProductosDTO } from './dto/ventas-productos.dto';
import { VentasProductosService } from './ventas-productos.service';

@Controller('ventas-productos')
export class VentasProductosController {

    constructor( private ventasProductosService: VentasProductosService ){}

    // Producto por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getProducto(@Res() res, @Param('id') productoID) {
        const producto = await this.ventasProductosService.getVentasProducto(productoID);
        res.status(HttpStatus.OK).json({
            message: 'Producto obtenido correctamente',
            producto
        });
    }
  
    // Listar productos
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async listarProductos(@Res() res, @Query() querys) {
        const productos = await this.ventasProductosService.listarProductos(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de productos correcto',
            productos
        });
    }
  
    // Crear producto
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async crearProducto(@Res() res, @Body() ventasProductosDTO: VentasProductosDTO ) {
        const producto = await this.ventasProductosService.crearProducto(ventasProductosDTO);        
        res.status(HttpStatus.CREATED).json({
            message: 'Productos creada correctamente',
            producto
        });
    }
      
    // Actualizar producto
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async actualizarProducto(@Res() res, @Body() ventasProductosUpdateDTO: VentasProductosUpdateDTO, @Param('id') productoID ) {
        
        const producto = await this.ventasProductosService.actualizarProducto(productoID, ventasProductosUpdateDTO);
  
        res.status(HttpStatus.OK).json({
            message: 'Producto actualizado correctamente',
            producto
        });
  
    }  
  
}
