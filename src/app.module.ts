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
    SocketModule, UnidadMedidaModule, ProductosModule, VentasModule, VentasProductosModule, AfipModule, CajasModule, IngresosGastosModule, PedidosyaModule, VentasMayoristasModule, VentasMayoristasProductosModule,          // Para trabajar con WebSocket
    
  ],
  
  controllers: [AppController],
  
  providers: [AppService]

})
export class AppModule {}
