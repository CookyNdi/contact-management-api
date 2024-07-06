import { Logger } from 'winston';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import { User } from '@prisma/client';

import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  LoginUserRequest,
  RegisterUserRequest,
  UpdateUserRequest,
  UserResponse,
} from '../model/user.model';
import { UserValidation } from './user.validation';

@Injectable()
export class UserService {
  constructor(
    private validationService: ValidationService,
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async register(request: RegisterUserRequest): Promise<UserResponse> {
    this.logger.debug(
      `UserService.register :  Register new user ${JSON.stringify(request)}`,
    );
    const registerRequest: RegisterUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const totalUserWithSameUsername = await this.prismaService.user.count({
      where: { username: registerRequest.username },
    });

    if (totalUserWithSameUsername !== 0) {
      throw new HttpException('Username already registered', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });

    return {
      username: user.username,
      name: user.name,
    };
  }

  async login(request: LoginUserRequest): Promise<UserResponse> {
    this.logger.debug(
      `UserService.login : Login user ${JSON.stringify(request)}`,
    );

    const loginRequest: LoginUserRequest = this.validationService.validate(
      UserValidation.LOGIN,
      request,
    );

    const existingUser = await this.prismaService.user.findUnique({
      where: {
        username: loginRequest.username,
      },
    });

    if (!existingUser) {
      throw new HttpException('Username or Password invalid', 401);
    }

    const isPasswordValid = await bcrypt.compare(
      loginRequest.password,
      existingUser.password,
    );

    if (!isPasswordValid) {
      throw new HttpException('Username or Password invalid', 401);
    }

    const user = await this.prismaService.user.update({
      where: { username: existingUser.username },
      data: { token: uuid() },
    });

    return {
      name: user.name,
      username: user.username,
      token: user.token,
    };
  }

  async get(user: User): Promise<UserResponse> {
    return {
      name: user.name,
      username: user.username,
    };
  }

  async update(user: User, request: UpdateUserRequest): Promise<UserResponse> {
    this.logger.debug(
      `UserService.update : update user (${JSON.stringify(user)}, ${JSON.stringify(request)})`,
    );

    const updateRequest: UpdateUserRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request,
    );

    if (updateRequest.name) {
      user.name = updateRequest.name;
    }

    if (updateRequest.password) {
      user.password = await bcrypt.hash(updateRequest.password, 10);
    }

    const result = await this.prismaService.user.update({
      where: { username: user.username },
      data: user,
    });

    return {
      username: result.username,
      name: result.name,
    };
  }
}
