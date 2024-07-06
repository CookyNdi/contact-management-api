import { User } from '@prisma/client';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { ContactResponse, CreateContactRequest } from '../model/contact.model';
import { ContactValidation } from './contact.validation';

@Injectable()
export class ContactService {
  constructor(
    private validationService: ValidationService,
    private prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  async create(
    user: User,
    request: CreateContactRequest,
  ): Promise<ContactResponse> {
    this.logger.debug(
      `ContactService.create :  Create new new contact ${JSON.stringify(request)} from ${user}`,
    );
    const createRequest: CreateContactRequest = this.validationService.validate(
      ContactValidation.CREATE,
      request,
    );
    const contact = await this.prismaService.contact.create({
      data: {
        ...createRequest,
        ...{ username: user.username },
      },
    });
    return {
      ...contact,
    };
  }
}
