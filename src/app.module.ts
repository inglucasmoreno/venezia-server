import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { MongoModule } from './config/mongo.module';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './auth/constants';
import { InicializacionModule } from './inicializacion/inicializacion.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SocketModule } from './socket/socket.module';
import { ConfigModule } from '@nestjs/config';
import { UnidadMedidaModule } from './unidad-medida/unidad-medida.module';
import { ProductosModule } from './productos/productos.module';
import { VentasModule } from './ventas/ventas.module';
import { VentasProductosModule } from './ventas-productos/ventas-productos.module';
import { AfipModule } from './afip/afip.module';
import { CajasModule } from './cajas/cajas.module';
import { IngresosGastosModule } from './ingresos-gastos/ingresos-gastos.module';
import { PedidosyaModule } from './pedidosya/pedidosya.module';
import { VentasMayoristasModule } from './ventas-mayoristas/ventas-mayoristas.module';
import { VentasMayoristasProductosModule } from './ventas-mayoristas-productos/ventas-mayoristas-productos.module';
import { MayoristasModule } from './mayoristas/mayoristas.module';
import { RepartidoresModule } from './repartidores/repartidores.module';
import { MayoristasTiposGastosModule } from './mayoristas-tipos-gastos/mayoristas-tipos-gastos.module';
import { MayoristasGastosModule } from './mayoristas-gastos/mayoristas-gastos.module';
import { CajasMayoristasModule } from './cajas-mayoristas/cajas-mayoristas.module';
import { MayoristasTiposIngresosModule } from './mayoristas-tipos-ingresos/mayoristas-tipos-ingresos.module';
import { MayoristasIngresosModule } from './mayoristas-ingresos/mayoristas-ingresos.module';
import { CuentasCorrientesMayoristasModule } from './cuentas-corrientes-mayoristas/cuentas-corrientes-mayoristas.module';
import { CobrosMayoristasModule } from './cobros-mayoristas/cobros-mayoristas.module';
import { CobrosPedidosModule } from './cobros-pedidos/cobros-pedidos.module';
import { PaquetesModule } from './paquetes/paquetes.module';
import { ClientesModule } from './clientes/clientes.module';

@Module({
  imports: [
      
    // Directorio publico
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
  
    // Configuracion para variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  
    // Configuracion para JsonWebToken
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '12h' }
    }),
    
    // MongoDB
    MongoModule,
    
    // Modulos custom
    UsuariosModule, 
    AuthModule,
    InicializacionModule,  // Para inicializacion de tablas - Configurable en el controlador/servicio
    SocketModule, UnidadMedidaModule, ProductosModule, VentasModule, VentasProductosModule, AfipModule, CajasModule, IngresosGastosModule, PedidosyaModule, VentasMayoristasModule, VentasMayoristasProductosModule, MayoristasModule, RepartidoresModule, MayoristasTiposGastosModule, MayoristasGastosModule, CajasMayoristasModule, MayoristasTiposIngresosModule, MayoristasIngresosModule, CuentasCorrientesMayoristasModule, CobrosMayoristasModule, CobrosPedidosModule, PaquetesModule, ClientesModule,          // Para trabajar con WebSocket
    
  ],
  
  controllers: [AppController],
  
  providers: [AppService]

})
export class AppModule {}
