import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get('JWT_KEY'),
          signOptions: { expiresIn: config.get('JWT_EXPIRES') }
        }
      }
    })
  ],
  exports: [
    JwtModule
  ]
})
export class SharedModule {}
