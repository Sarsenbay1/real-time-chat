import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/environment-variables';
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService<EnvironmentVariables, true>,
  ) {}

  async signIn(
    username: string,
    pass: string,
  ): Promise<{ MediaKeySystemAccess_token: string }> {
    const user = await this.userRepository.findOneBy({ username: username });
    console.log(await bcrypt.compare(pass, user.password));
    if (await bcrypt.compare(pass, user.password)) {
      const payload = { sub: user.id, username };
      console.log(payload, this.configService.get<string>('JWT_SECRET'));
      console.log();

      // try {
      //   console.log('JWT Secret:', this.jwtService['options'].secret); // Вывод секретного ключа
      //   const token = await this.jwtService.signAsync(payload);
      //   console.log('Generated Token:', token);
      //   // return {
      //   //   access_token: token,
      //   // };
      // } catch {}

      // console.log(await this.jwtService.signAsync(payload));
      return {
        MediaKeySystemAccess_token: await this.jwtService.signAsync(payload),
      };
    } else {
      throw new UnauthorizedException();
    }
  }
}
// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from 'src/user/entities/user.entity';
// import * as bcrypt from 'bcrypt';

// @Injectable()
// export class AuthService {
//   constructor(
//     private jwtService: JwtService,
//     @InjectRepository(User)
//     private userRepository: Repository<User>,
//   ) {}

//   async signIn(username: string, pass: string) {
//     const user = await this.userRepository.findOneBy({ username: username });
//     console.log('User:', user);
//     if (await bcrypt.compare(pass, user.password)) {
//       const payload = { sub: user.id, username };
//       console.log('Payload:', payload);

//       try {
//         console.log(
//           'JWT Secret from JwtService:',
//           this.jwtService['options'].secret,
//         ); // Вывод секретного ключа
//         const token = await this.jwtService.signAsync(payload);
//         console.log('Generated Token:', token);
//         return {
//           access_token: token,
//         };
//       } catch (error) {
//         console.error('Error generating token:', error);
//         throw error;
//       }
//     } else {
//       throw new UnauthorizedException();
//     }
//   }
// }
