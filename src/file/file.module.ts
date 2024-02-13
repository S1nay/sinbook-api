import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FileController } from './file.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getJWTConfig } from 'src/config/jwt.config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getJWTConfig,
    }),
  ],
  providers: [FileService, JwtService],
  exports: [FileService],
  controllers: [FileController],
})
export class FileModule {}
