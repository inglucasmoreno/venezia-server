import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ProductosUpdateDTO } from './dto/productos-update.dto';
import { ProductosDTO } from './dto/productos.dto';
import { ProductosService } from './productos.service';

@Controller('productos')
export class ProductosController {

    constructor(private productosService: ProductosService) { }

    // Sincronizacion - Productos - Sucursal principal
    @UseGuards(JwtAuthGuard)
    @Get('/sincronizacion/productos')
    async sincronizacionProductos(@Res() res) {
        const producto = await this.productosService.sincronizacionProductos();
        res.status(HttpStatus.OK).json({
            producto
        });
    }

    // Copia - Productos - Sucursal principal
    @UseGuards(JwtAuthGuard)
    @Post('/copia/productos')
    async copiaProductos(@Res() res, @Body() data: any) {
        const producto = await this.productosService.copiaProductos(data);
        res.status(HttpStatus.OK).json({
            producto
        });
    }

    // Productos por ID
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getProducto(@Res() res, @Param('id') productoID) {
        const producto = await this.productosService.getProducto(productoID);
        res.status(HttpStatus.OK).json({
            message: 'Producto obtenido correctamente',
            producto
        });
    }

    // Productos por codigo
    @UseGuards(JwtAuthGuard)
    @Get('/buscar/parametro')
    async getProductoPorCodigo(@Res() res, @Query() querys) {
        const producto = await this.productosService.getProductoParametro(querys);
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

    // Crear producto
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async crearProducto(@Res() res, @Body() productoDTO: ProductosDTO) {
        const producto = await this.productosService.crearProducto(productoDTO);
        res.status(HttpStatus.CREATED).json({
            message: 'Producto creada correctamente',
            producto
        });
    }

    // Actualizar producto
    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async actualizarProducto(@Res() res, @Body() productosUpdateDTO: ProductosUpdateDTO, @Param('id') productoID) {

        const producto = await this.productosService.actualizarProducto(productoID, productosUpdateDTO);

        res.status(HttpStatus.OK).json({
            message: 'Producto actualizada correctamente',
            producto
        });

    }

}
