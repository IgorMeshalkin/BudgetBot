import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { UserCreateDto } from '@dto/user/user.create.dto';
import { UserDto } from '@dto/user/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {
  }

  @Post('login')
  async login(@Body() user: UserCreateDto): Promise<UserDto | null> {
    try {
      return await this.userService.login(user);
    } catch (e) {
      console.error(`Failed to check user exist: ${e}`);
      return null;
    }
  }
}