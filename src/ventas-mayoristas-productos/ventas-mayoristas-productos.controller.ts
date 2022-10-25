import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasMayoristasProductosUpdateDTO } from './dto/ventas-mayoristas-productos-update.dto';
import { VentasMayoristasProductosDTO } from './dto/ventas-mayoristas-productos.dto';
import { VentasMayoristasProductosService } from './ventas-mayoristas-productos.service';

@Controller('ventas-mayoristas-productos')
export class VentasMayoristasProductosController {
  
    constructor( private productosService: VentasMayoristasProductosService ){}

    // Producto por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getProductos(@Res() res, @Param('id') productoID) {
        const producto = await this.productosService.getProducto(productoID);
        res.status(HttpStatus.OK).json({
            message: 'Producto obtenido correctamente',
            producto
        });
    }

    // Listar productos
    @UseGuards(JwtAuthGuard)
    @Get('/')
    async listarProductos(@Res() res, @Query() querys) {
        const productos = await this.productosService.listarProductos(querys);
        res.status(HttpStatus.OK).json({
            message: 'Listado de productos correcto',
            productos
        });
    }

    // Crear productos
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async crearProductos(@Res() res, @Body() productosDTO: VentasMayoristasProductosDTO ) {
        const producto = await this.productosService.crearProducto(productosDTO);        
        res.status(HttpStatus.CREATED).json({
            message: 'Productos creado correctamente',
            producto
        });
    }
        
    // Actualizar producto
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async actualizarProducto(@Res() res, @Body() productoUpdateDTO: VentasMayoristasProductosUpdateDTO, @Param('id') productoID ) {
        
        const producto = await this.productosService.actualizarProducto(productoID, productoUpdateDTO);

        res.status(HttpStatus.OK).json({
            message: 'Producto actualizado correctamente',
            producto
        });

    }

    // Eliminar producto
    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async eliminarProducto(@Res() res, @Param('id') productoID ) {
        
        const producto = await this.productosService.eliminarProducto(productoID);

        res.status(HttpStatus.OK).json({
            message: 'Producto eliminado correctamente',
            producto
        });

    }

    // Generacion - Detalles de productos pendientes - PDF
    @UseGuards(JwtAuthGuard)
    @Get('/productos-pendientes/pdf')
    async generarDetallesPDF(@Res() res) {
        await this.productosService.generarProductosPDF();
        res.status(HttpStatus.OK).json({
            message: 'PDF generado correctamente'
        });
    }

}

