import { CommonModule } from "@angular/common";
import { ErrorHandler, NgModule } from "@angular/core";
import { GlobalErrorHandler } from "./errors/global.error.handler";
import { LoggerService } from "./logger/logger.service";
import { AuthModule } from "./auth/auth.module";

@NgModule({
  imports: [CommonModule, AuthModule],
  providers: [
    LoggerService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    }
  ],
})
export class CoreModule {}
