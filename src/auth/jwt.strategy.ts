import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from '@prisma/client';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload) {
    if (!payload) {
      throw new UnauthorizedException('Invalid token');
    }
    return {
      userId: payload.id,
      mobile: payload.mobile,
      role: payload.role === 'ADMIN' ? Role.SUPER_ADMIN : payload.role,
    };
  }
}
