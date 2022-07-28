import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AfipService } from './afip.service';
import { AfipFacturaDTO } from './dto/afip-factura';
import { AfipInfoComprobanteDTO } from './dto/afip-info-comprobante';
import { AfipUltimoNumeroComprobanteDTO } from './dto/afip-ultimo-numero-comprobante';

@Controller('afip')
export class AfipController {

  constructor( private afipService: AfipService ){}

  // Datos de contribuyente

  // Alcance 4
  @UseGuards(JwtAuthGuard)
  @Get('/contribuyente/alcance4/:cuit')
  async contribuyenteA4(@Res() res, @Param() params) {
    const { cuit } = params;
    const contribuyente = await this.afipService.getContribuyenteA4(cuit);
    res.status(HttpStatus.OK).json({
        message: 'Datos de contribuyentes obtenidos correctamente',
        contribuyente
    });
  }

  // Alcance 5
  @UseGuards(JwtAuthGuard)
  @Get('/contribuyente/alcance5/:cuit')
  async contribuyenteA5(@Res() res, @Param() params) {
    const { cuit } = params;
    const contribuyente = await this.afipService.getContribuyenteA5(cuit);
    res.status(HttpStatus.OK).json({
        message: 'Datos de contribuyentes obtenidos correctamente',
        contribuyente
    });
  }

  // Alcance 10
  @UseGuards(JwtAuthGuard)
  @Get('/contribuyente/alcance10/:cuit')
  async contribuyenteA10(@Res() res, @Param() params) {
    const { cuit } = params;
    const contribuyente = await this.afipService.getContribuyenteA10(cuit);
    res.status(HttpStatus.OK).json({
        message: 'Datos de contribuyentes obtenidos correctamente',
        contribuyente
    });
  }

  // Alcance 13
  @UseGuards(JwtAuthGuard)
  @Get('/contribuyente/alcance13/:cuit')
  async contribuyenteA13(@Res() res, @Param() params) {
    const { cuit } = params;
    const contribuyente = await this.afipService.getContribuyenteA13(cuit);
    res.status(HttpStatus.OK).json({
        message: 'Datos de contribuyentes obtenidos correctamente',
        contribuyente
    });
  }

  // Tipos de comprobantes
  @UseGuards(JwtAuthGuard)
  @Get('/tipos/comprobantes')
  async tiposComprobantes(@Res() res) {
      const comprobantes = await this.afipService.tiposComprobantes();
      res.status(HttpStatus.OK).json({
          message: 'Tipos de comprobantes obtenidos correctamente',
          comprobantes
      });
  }

  // Tipos de conceptos
  @UseGuards(JwtAuthGuard)
  @Get('/tipos/conceptos')
  async tiposConceptos(@Res() res) {
      const conceptos = await this.afipService.tiposConceptos();
      res.status(HttpStatus.OK).json({
          message: 'Tipos de conceptos obtenidos correctamente',
          conceptos
      });
  }

  // Tipos de documentos
  @UseGuards(JwtAuthGuard)
  @Get('/tipos/documentos')
  async tiposDocumentos(@Res() res) {
      const documentos = await this.afipService.tiposDocumentos();
      res.status(HttpStatus.OK).json({
          message: 'Tipos de documentos obtenidos correctamente',
          documentos
      });
  }

  // Ultimo numero de comprobante
  @UseGuards(JwtAuthGuard)
  @Post('/info/ultimo-numero-comprobante')
  async ultimoNumeroComprobante(@Res() res, @Body() data: AfipUltimoNumeroComprobanteDTO) {
      const numero = await this.afipService.ultimoNroComprobante(data);
      res.status(HttpStatus.OK).json({
          message: 'Ultimo numero de comprobante obtenido correctamente',
          numero
      });
  }

  // Informacion de comprobante
  @UseGuards(JwtAuthGuard)
  @Post('/info/comprobante')
  async infoComprobante(@Res() res, @Body() data: AfipInfoComprobanteDTO) {
      const comprobante = await this.afipService.infoComprobante(data);
      res.status(HttpStatus.OK).json({
          message: 'Informacion de comprobante obtenida correctamente',
          comprobante
      });
  }

  // Factura electronica
  @UseGuards(JwtAuthGuard)
  @Post('/factura-electronica')
  async facturaElectronica(@Res() res, @Body() data: AfipFacturaDTO) {
      const factura = await this.afipService.facturaElectronica(data);
      if(!factura['CAE'] || factura['CAE'] === null) throw new NotFoundException('Error al realizar la facturacion');  

  }

  // Ajustar fecha
  @UseGuards(JwtAuthGuard)
  @Post('/ajustar/fecha')
  async ajustarFecha(@Res() res, @Body() data) {
    const fecha = await this.afipService.ajustarFecha(data);
    res.status(HttpStatus.OK).json({
        message: 'Ajuste de fecha obtenido correctamente',
        fecha
    });
  }

}
