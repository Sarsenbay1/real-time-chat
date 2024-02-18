import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signIn(username: string, pass: string) {
    const user = await this.userRepository.findOneBy({ username: username });
    console.log(await bcrypt.compare(pass, user.password));
    if (await bcrypt.compare(pass, user.password)) {
      const payload = { sub: user.id, username };
      return {
        MediaKeySystemAccess_token: await this.jwtService.signAsync(payload),
      };
    } else {
      throw new UnauthorizedException();
    }
  }
}
