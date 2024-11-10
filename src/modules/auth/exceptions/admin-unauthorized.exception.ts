import { UnauthorizedException } from '@nestjs/common';

export class AdminUnauthorizedException extends UnauthorizedException {
  constructor() {
    super('errors.adminUnauthorized');
  }
}
