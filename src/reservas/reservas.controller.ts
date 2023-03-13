import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ReservasUpdateDTO } from './dto/reservas-update.dto';
import { ReservasService } from './reservas.service';

@Controller('reservas')
export class ReservasController {

  constructor(private reservasService: ReservasService) { }

  // Reserva por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getReserva(@Res() res, @Param('id') reservaID) {
    const { reserva, productos } = await this.reservasService.getReserva(reservaID);
    res.status(HttpStatus.OK).json({
      message: 'Reserva obtenida correctamente',
      reserva,
      productos
    });
  }

  // Listar reservas
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarReservas(@Res() res, @Query() querys) {
    const { reservas, totalItems } = await this.reservasService.listarReservas(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de reservas correcto',
      reservas,
      totalItems
    });
  }

  // Reservas por vencer
  @UseGuards(JwtAuthGuard)
  @Get('/parametro/vencer')
  async reservasPorVencer(@Res() res, @Query() querys) {
    const reservas = await this.reservasService.reservasPorVencer(querys);
    res.status(HttpStatus.OK).json({
      message: 'Listado de reservas por vencer correcto',
      reservas,
    });
  }

  // Crear reserva
  @Post('/')
  async crearReserva(@Res() res, @Body() reservasDTO: any) {
    const reserva = await this.reservasService.crearReserva(reservasDTO);
    res.status(HttpStatus.CREATED).json({
      message: 'Reserva creada correctamente',
      reserva
    });
  }

  // Generar comprobante
  @Post('/comprobante')
  async generarComprobante(@Res() res, @Body() data: any) {
    await this.reservasService.generaraComprobante(data);
    res.status(HttpStatus.CREATED).json({
      message: 'Comprobante generado correctamente',
    });
  }

  // Actualizar reserva
  @Put('/:id')
  async actualizarReserva(@Res() res, @Body() reservasUpdateDTO: ReservasUpdateDTO, @Param('id') reservaID) {
    const reserva = await this.reservasService.actualizarReserva(reservaID, reservasUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Reserva actualizada correctamente',
      reserva
    });
  }

  // Eliminar reserva
  @Delete('/:id')
  async eliminarReserva(@Res() res, @Param('id') reservaID) {
    await this.reservasService.eliminarReserva(reservaID);
    res.status(HttpStatus.OK).json({
      message: 'Reserva eliminada correctamente',
    });
  }

}
