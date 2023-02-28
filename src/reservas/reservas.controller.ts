import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
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
    const reserva = await this.reservasService.getReserva(reservaID);
    res.status(HttpStatus.OK).json({
      message: 'Reserva obtenida correctamente',
      reserva
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

  // Actualizar reserva
  @Put('/:id')
  async actualizarReserva(@Res() res, @Body() reservasUpdateDTO: ReservasUpdateDTO, @Param('id') reservaID) {
    const reserva = await this.reservasService.actualizarReserva(reservaID, reservasUpdateDTO);
    res.status(HttpStatus.OK).json({
      message: 'Reserva actualizada correctamente',
      reserva
    });
  }

}
