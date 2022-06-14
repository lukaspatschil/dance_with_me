import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

// Stryker disable all
@Injectable()
export class IdentityProviderGuard extends AuthGuard(['google', 'facebook']) {
  private readonly logger = new Logger(IdentityProviderGuard.name);
  // Stryker restore all

  override canActivate(
    context: ExecutionContext,
  ): Observable<boolean> | Promise<boolean> | boolean {
    const { provider } = context.switchToHttp().getRequest().params;

    if (provider !== 'google' && provider !== 'facebook') {
      this.logger.error(`Provider ${provider} is not supported`);
      // Stryker disable all
      throw new ForbiddenException({ error: 'provider_not_supported' });
      // Stryker restore all
    }

    const Guard = AuthGuard(provider);

    this.logger.log(`Handing over to passport using provider: ${provider}`);
    return new Guard(provider).canActivate(context);
  }
}
