import { Controller, Post, Body, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

class LoginDto {
  email!: string;
  password!: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login (demo)' })
  async login(@Body() dto: LoginDto) {
    if (dto.email === 'admin@grent.com' && dto.password === 'admin123') {
      const token = this.jwtService.sign({
        sub: 'admin-001',
        email: dto.email,
        role: 'admin',
      });
      this.logger.log(`Admin login: ${dto.email}`);
      return { access_token: token, user: { email: dto.email, role: 'admin' } };
    }

    this.logger.warn(`Failed login attempt: ${dto.email}`);
    return { error: 'Invalid credentials' };
  }
}
