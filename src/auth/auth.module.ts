import {MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtConfig } from 'src/jwt.config';
import {UniqueIdService} from "../crypto/unique-id.service";
import { BearerMiddleware } from './bearer.middleware';
import {ProfileService} from "../profile/profile.service";
import {ProfileController} from "../profile/profile.controller";
import {OrganizationService} from "../organizations/organization.service";
import {OrganizationController} from "../organizations/organization.controller";


@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    JwtModule.register({
      secret: JwtConfig.user_secret,
      signOptions: {
        expiresIn: JwtConfig.user_expired,
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, UniqueIdService, ProfileService],
  controllers: [AuthController, ProfileController]
})
// export class AuthModule { }
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
        .apply(BearerMiddleware)
        .forRoutes('profiles');
  }
}