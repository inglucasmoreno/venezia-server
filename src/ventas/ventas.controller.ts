import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { VentasUpdateDTO } from './dto/ventas-update.dto';
import { VentasDTO } from './dto/ventas.dto';
import { VentasService } from './ventas.service';

@Controller('ventas')
export class VentasController {
  
  constructor( private ventasService: VentasService ){}

  // Venta por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getVenta(@Res() res, @Param('id') ventaID) {
      const respuesta = await this.ventasService.getVentas(ventaID);
      res.status(HttpStatus.OK).json({
          message: 'Venta obtenida correctamente',
          venta: respuesta.venta,
          productos: respuesta.productos
      });
  }

  // Listar ventas
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarVentas(@Res() res, @Query() querys) {
      const ventas = await this.ventasService.listarVentas(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de ventas correcto',
          ventas
      });
  }

  // Crear venta
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearVenta(@Res() res, @Body() ventasDTO: VentasDTO ) {
      const venta = await this.ventasService.crearVenta(ventasDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Venta creada correctamente',
          venta
      });
  }
    
  // Actualizar venta
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarVenta(@Res() res, @Body() ventasUpdateDTO: VentasUpdateDTO, @Param('id') ventaID ) {
      
      const venta = await this.ventasService.actualizarVenta(ventaID, ventasUpdateDTO);

      res.status(HttpStatus.OK).json({
          message: 'Venta actualizada correctamente',
          venta
      });

  }  

}
