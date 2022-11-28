import { Body, Controller, Get, HttpStatus, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CuentasCorrientesMayoristasService } from './cuentas-corrientes-mayoristas.service';
import { CuentasCorrientesMayoristasUpdateDTO } from './dto/cuentas-corrientes-mayoristas-update.dto';
import { CuentasCorrientesMayoristasDTO } from './dto/cuentas-corrientes-mayoristas.dto';

@Controller('cuentas-corrientes-mayoristas')
export class CuentasCorrientesMayoristasController {

  constructor( private cuentasCorrientesService: CuentasCorrientesMayoristasService ){}

  // Inicializar cuentas corrientes
  @UseGuards(JwtAuthGuard)
  @Get('/inicializar/cuentas')
  async inicializarCuentasCorrientes(@Res() res, @Query() querys) {
      await this.cuentasCorrientesService.inicializarCuentasCorrientes(querys);
      res.status(HttpStatus.OK).json({
          message: 'inicializacion correcta',
      });
  }

  // Cuenta corriente por ID
  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async getCuentaCorriente(@Res() res, @Param('id') cuentaCorrienteID) {
      const cuenta_corriente = await this.cuentasCorrientesService.getCuentaCorriente(cuentaCorrienteID);
      res.status(HttpStatus.OK).json({
          message: 'Cuenta corriente obtenida correctamente',
          cuenta_corriente
      });
  }

// Cuenta corriente por mayorista
@UseGuards(JwtAuthGuard)
@Get('/parametro/mayorista/:mayorista')
async getCuentaCorrientePorMayorista(@Res() res, @Param('mayorista') mayoristaID) {
    const cuenta_corriente = await this.cuentasCorrientesService.getCuentaCorrientePorMayorista(mayoristaID);
    res.status(HttpStatus.OK).json({
        message: 'Cuenta corriente obtenida correctamente',
        cuenta_corriente
    });
}

  // Listar cuentas corrientes
  @UseGuards(JwtAuthGuard)
  @Get('/')
  async listarCuentasCorrientes(@Res() res, @Query() querys) {
      const cuentas_corrientes = await this.cuentasCorrientesService.listarCuentasCorrientes(querys);
      res.status(HttpStatus.OK).json({
          message: 'Listado de cuentas corrientes correcto',
          cuentas_corrientes
      });
  }

  // Crear cuenta corriente
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async crearCuentaCorriente(@Res() res, @Body() cuentasCorrientesDTO: CuentasCorrientesMayoristasDTO ) {
      const cuenta_corriente = await this.cuentasCorrientesService.crearCuentaCorriente(cuentasCorrientesDTO);        
      res.status(HttpStatus.CREATED).json({
          message: 'Cuenta corriente creada correctamente',
          cuenta_corriente
      });
  }
    
  // Actualizar cuenta corriente
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  async actualizarCuentaCorriente(@Res() res, @Body() cuentasCorrientesUpdateDTO: CuentasCorrientesMayoristasUpdateDTO, @Param('id') cuentaCorrienteID ) {
      const cuenta_corriente = await this.cuentasCorrientesService.actualizarCuentaCorriente(cuentaCorrienteID, cuentasCorrientesUpdateDTO);
      res.status(HttpStatus.OK).json({
          message: 'Cuenta corriente actualizada correctamente',
          cuenta_corriente
      });
  }

}
