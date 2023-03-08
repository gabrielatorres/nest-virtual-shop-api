import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { GetUser, RoleProtected, Auth } from './decorators';
import { GetRawHeaders } from 'src/common/decorators/get-raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';

import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Get('check-token')
  @Auth()
  checkAuthStatus(@GetUser() user: User) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @RoleProtected(ValidRoles.admin)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute(
    // @Req() request: Express.Request
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @GetUser('fullName') fullName: string,
    @GetRawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'protected',
      user,
      userEmail,
      fullName,
      rawHeaders,
    };
  }

  @Get('private2')
  @Auth()
  composeDecorators(
    // @Req() request: Express.Request
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @GetUser('fullName') fullName: string,
    @GetRawHeaders() rawHeaders: string[],
  ) {
    return {
      ok: true,
      message: 'protected',
      user,
      userEmail,
      fullName,
      rawHeaders,
    };
  }
}
