import { WebhookBody } from "@/common/types/webhook.types";
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Param,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { from } from "rxjs";
import { WebhookService } from "./webhook.service";

@Controller("webhook")
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post("/:source")
  @UseInterceptors(ClassSerializerInterceptor)
  public boxWebhook(
    @Param("source") source: string,
    @Body() body: WebhookBody
  ) {
    return from(this.webhookService.webhook(body, source));
  }
}
