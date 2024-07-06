import { User } from '@prisma/client';
import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { ContactService } from './contact.service';
import { ContactResponse, CreateContactRequest } from '../model/contact.model';
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
}
