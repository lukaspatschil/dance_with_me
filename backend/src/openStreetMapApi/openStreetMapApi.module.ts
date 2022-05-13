import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OpenStreetMapApiService } from './openStreetMapApi.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [OpenStreetMapApiService],
  exports: [OpenStreetMapApiService],
})
export class OpenStreetMapApiModule {}
