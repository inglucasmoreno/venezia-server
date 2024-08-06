import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { MesasPedidosService } from './mesas-pedidos.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { MesasPedidosDTO } from './dto/mesas-pedidos.dto';
import { MesasPedidosUpdateDTO } from './dto/mesas-pedidos-update.dto';

@Controller('mesas-pedidos')
export class MesasPedidosController {

  constructor(private mesasPedidosService: MesasPedidosService) { }

  // Pedido por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getPedido(@Res() res, @Param('id') pedidoID) {
    const pedido = await this.mesasPedidosService.getPedido(pedidoID);
    res.status(HttpStatus.OK).json({
      message: 'Pedido obtenido correctamente',
      pedido
    });
  }

  // Listar pedidos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarPedidos(@Res() res, @Query() querys) {
    const pedidos = await this.mesasPedidosService.listarPedidos(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de pedidos correcto',
      pedidos
    });
  }

  // Crear pedido
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearPedido(@Res() res, @Body() mesasPedidosDTO: MesasPedidosDTO) {
    const pedido = await this.mesasPedidosService.crearPedido(mesasPedidosDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Pedido creado correctamente',
      pedido
    });
  }

  // Actualizar pedido
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarPedido(@Res() res, @Body() mesasPedidosUpdateDTO: MesasPedidosUpdateDTO, @Param('id') pedidoID) {
    const pedido = await this.mesasPedidosService.actualizarPedido(pedidoID, mesasPedidosUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Pedido actualizado correctamente',
      pedido
    });
  }

}
