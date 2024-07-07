import { User } from '@prisma/client';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { ContactService } from './contact.service';
import {
  ContactResponse,
  CreateContactRequest,
  UpdateContactRequest,
} from '../model/contact.model';
import { Auth } from '../common/auth.decorator';
import { WebResponse } from '../model/web.model';

@Controller('/api/contacts')
export class ContactController {
  constructor(private contactService: ContactService) {}

  @Post()
  @HttpCode(200)
  async create(
    @Auth() user: User,
    @Body() request: CreateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.create(user, request);
    return {
      data: result,
    };
  }

  @Get(':/contactId')
  @HttpCode(200)
  async get(
    @Auth() user: User,
    @Param('contactId') contactId: string,
  ): Promise<WebResponse<ContactResponse>> {
    const result = await this.contactService.get(user, contactId);
    return {
      data: result,
    };
  }

  @Put()
  @HttpCode(200)
  async update(
    @Auth() user: User,
    @Param('contactId') contactId: string,
    @Body() request: UpdateContactRequest,
  ): Promise<WebResponse<ContactResponse>> {
    request.id = contactId;
    const result = await this.contactService.update(user, request);
    return {
      data: result,
    };
  }
}
