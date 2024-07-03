// import { Module } from '@nestjs/common';
// import { AuthService } from './auth.service';
// import { AuthController } from './auth.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { User } from 'src/user/entities/user.entity';
// import { JwtModule } from '@nestjs/jwt';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { EnvironmentVariables } from 'src/environment-variables';
// import { UserModule } from 'src/user/user.module';
// import { plainToInstance } from 'class-transformer';
// import { validateSync } from 'class-validator';

// @Module({
//   imports: [
//     UserModule,
//     // ConfigModule.forRoot(),
//     ConfigModule.forRoot({
//       envFilePath: '.env',
//       isGlobal: true,
//       validate: (rawConfig) => {
//         const config = plainToInstance(EnvironmentVariables, rawConfig, {
//           enableImplicitConversion: true,
//         });

//         const errors = validateSync(config);
//         if (errors.length > 0) {
//           throw new Error(errors.toString());
//         }
//         return config;
//       },
//     }),
//     JwtModule.registerAsync({
//       imports: [ConfigModule],
//       useFactory: async (
//         configService: ConfigService<EnvironmentVariables, true>,
//       ) => ({
//         global: true,
//         secret: configService.get<string>('JWT_SECRET'),
//         // secret:
//         //   '7A38BFCDA6C7A7E6611DCBFBC4604ABC527ED47CF360518C7E1C7EDE4F549357',
//         signOptions: { expiresIn: '60d' },
//       }),
//       inject: [ConfigService],
//     }),
//     TypeOrmModule.forFeature([User]),
//   ],
//   controllers: [AuthController],
//   providers: [AuthService, UserModule],
// })
// export class AuthModule {}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
    TypeOrmModule.forFeature([User]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService],
})
export class AuthModule {}
