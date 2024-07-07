import { Contact, User } from '@prisma/client';
import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  ContactResponse,
  CreateContactRequest,
  SearchContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { ContactValidation } from './contact.validation';
import { WebResponse } from '../model/web.model';

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
    return this.toContactResponse(contact);
  }

  toContactResponse(contact: Contact): ContactResponse {
    return {
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone,
      id: contact.id,
    };
  }

  async checkContactMustExist(
    username: string,
    contactId: string,
  ): Promise<Contact> {
    const contact = await this.prismaService.contact.findFirst({
      where: {
        username: username,
        id: contactId,
      },
    });

    if (!contact) {
      throw new HttpException('Contact is not found!', 404);
    }
    return contact;
  }

  async get(user: User, contactId: string): Promise<ContactResponse> {
    const contact = await this.checkContactMustExist(user.username, contactId);
    return this.toContactResponse(contact);
  }

  async update(
    user: User,
    request: UpdateContactRequest,
  ): Promise<ContactResponse> {
    const updateRequest: UpdateContactRequest = this.validationService.validate(
      ContactValidation.UPDATE,
      request,
    );

    let contact = await this.checkContactMustExist(
      user.username,
      updateRequest.id,
    );

    contact = await this.prismaService.contact.update({
      where: {
        username: contact.username,
        id: contact.id,
      },
      data: updateRequest,
    });

    return this.toContactResponse(contact);
  }

  async remove(user: User, contactId: string): Promise<ContactResponse> {
    await this.checkContactMustExist(user.username, contactId);

    const contact = await this.prismaService.contact.delete({
      where: {
        username: user.username,
        id: contactId,
      },
    });

    return this.toContactResponse(contact);
  }

  async search(
    user: User,
    request: SearchContactRequest,
  ): Promise<WebResponse<ContactResponse[]>> {
    const searchRequest: SearchContactRequest = this.validationService.validate(
      ContactValidation.SEARCH,
      request,
    );

    const filters = [];

    if (searchRequest.name) {
      filters.push({
        OR: [
          {
            first_name: {
              contains: searchRequest.name,
            },
          },
          {
            last_name: {
              contains: searchRequest.name,
            },
          },
        ],
      });
    }

    if (searchRequest.email) {
      filters.push({
        email: {
          contains: searchRequest.email,
        },
      });
    }

    if (searchRequest.phone) {
      filters.push({
        phone: {
          contains: searchRequest.phone,
        },
      });
    }

    const skip = (searchRequest.page - 1) * searchRequest.size;

    const contacts = await this.prismaService.contact.findMany({
      where: {
        username: user.username,
        AND: filters,
      },
      take: searchRequest.size,
      skip: skip,
    });

    const total = await this.prismaService.contact.count({
      where: {
        username: user.username,
        AND: filters,
      },
    });

    return {
      data: contacts.map((contact) => this.toContactResponse(contact)),
      pagging: {
        current_page: searchRequest.page,
        size: searchRequest.size,
        total_page: Math.ceil(total / searchRequest.size),
      },
    };
  }
}
