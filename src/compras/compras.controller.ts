import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { ComprasService } from './compras.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ComprasDTO } from './dto/compras.dto';
import { ComprasUpdateDTO } from './dto/compras-update.dto';

@Controller('compras')
export class ComprasController {

  constructor(private comprasService: ComprasService) { }

  // Compra por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getCompra(@Res() res, @Param('id') compraID) {
    const compra = await this.comprasService.getCompra(compraID);
    res.status(HttpStatus.OK).json({
      message: 'Compra obtenida correctamente',
      compra
    });
  }

  // Completar compra
  @UseGuards(JwtAuthGuard)
  @Get('/completar/:id')
  async completarCompra(@Res() res, @Param('id') compraID) {
    const compra = await this.comprasService.completarCompra(compraID);
    res.status(HttpStatus.OK).json({
      message: 'Compra completada correctamente',
      compra
    });
  }

  // Listar compras
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarCompras(@Res() res, @Query() querys) {
    const compras = await this.comprasService.listarCompras(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de compras correcto',
      compras
    });
  }

  // Crear compra
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearCompra(@Res() res, @Body() comprasDTO: ComprasDTO) {
    const compra = await this.comprasService.crearCompra(comprasDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Compra creada correctamente',
      compra
    });
  }

  // Actualizar compra
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarCompra(@Res() res, @Body() comprasUpdateDTO: ComprasUpdateDTO, @Param('id') compraID) {
    const compra = await this.comprasService.actualizarCompra(compraID, comprasUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Compra actualizado correctamente',
      compra
    });
  }

}
