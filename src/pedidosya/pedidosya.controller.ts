import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PedidosYaUpdateDTO } from './dto/pedidosya-update.dto';
import { PedidosYaDTO } from './dto/pedidosya.dto';
import { PedidosyaService } from './pedidosya.service';

@Controller('pedidosya')
export class PedidosyaController {
  constructor( private pedidosYaService: PedidosyaService ){}

  // PedidoYa por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getPedido(@Res() res, @Param('id') pedidoID) {
      const pedido = await this.pedidosYaService.getPedidosYa(pedidoID);
      res.status(HttpStatus.OK).json({
          message: 'Pedido obtenido correctamente',
          pedido
      });
  }

  // Listar pedidos
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarPedidos(@Res() res, @Query() querys) {
      const pedidos = await this.pedidosYaService.listarPedidosYa(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de pedidos correcto',
          pedidos
      });
  }

  // Crear pedido
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearPedido(@Res() res, @Body() pedidosYaDTO: PedidosYaDTO ) {
      const pedido = await this.pedidosYaService.crearPedido(pedidosYaDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Pedido creado correctamente',
          pedido
      });
  }
    
  // Actualizar pedido
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarPedido(@Res() res, @Body() pedidosYaUpdateDTO: PedidosYaUpdateDTO, @Param('id') pedidoID ) {
      const pedidos = await this.pedidosYaService.actualizarPedidos(pedidoID, pedidosYaUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Pedidos actualizados correctamente',
          pedidos
      });
  }
}
