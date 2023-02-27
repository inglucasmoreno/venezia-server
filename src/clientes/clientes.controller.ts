import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ClientesService } from './clientes.service';
import { ClientesUpdateDTO } from './dto/clientes-update.dto';

@Controller('clientes')
export class ClientesController {
  constructor(private clientesService: ClientesService) { }

  // Cliente por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getCliente(@Res() res, @Param('id') clienteID) {
    const cliente = await this.clientesService.getCliente(clienteID);
    res.status(HttpStatus.OK).json({
      message: 'Cliente obtenido correctamente',
      cliente
    });
  }

  // Cliente por identificacion
  @UseGuards(JwtAuthGuard)
  @Get('/identificacion/:id')
  async getClientePorIdentificacion(@Res() res, @Param('id') identificacion) {
    const cliente = await this.clientesService.getClientePorIdentificacion(identificacion);
    res.status(HttpStatus.OK).json({
      message: 'Cliente obtenido correctamente',
      cliente
    });
  }

  // Crear cliente
  @Post('/')
  async crearCliente(@Res() res, @Body() clientesDTO: any) {
    const cliente = await this.clientesService.crearCliente(clientesDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Cliente creado correctamente',
      cliente
    });
  }

  // Listar clientes
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarClientes(@Res() res, @Query() querys) {
    const { clientes, totalItems } = await this.clientesService.listarClientes(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de clientes correcto',
      clientes,
      totalItems
    });
  }

  // Actualizar cliente
  @Put('/:id')
  async actualizarCliente(@Res() res, @Body() clientesUpdateDTO: ClientesUpdateDTO, @Param('id') clienteID) {
    const cliente = await this.clientesService.actualizarCliente(clienteID, clientesUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Cliente actualizado correctamente',
      cliente
    });
  }
}
