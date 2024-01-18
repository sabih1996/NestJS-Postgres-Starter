import { WebhookBody } from "@/common/types/webhook.types";
import { Injectable } from "@nestjs/common";
import { WebhookManagerInterface } from "../../interfaces/webhook.interface";

@Injectable()
export class BoxWebhookManager implements WebhookManagerInterface {
  //   constructor() {}
  async boxWebhook(body: WebhookBody, source: string): Promise<string> {
    return source;
  }
}
