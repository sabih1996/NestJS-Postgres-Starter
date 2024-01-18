import { WebhookBody } from "@/common/types/webhook.types";
import { Injectable } from "@nestjs/common";
import { WebhookManagerInterface } from "./interfaces/webhook.interface";
import { WebhookManagerFactory } from "./util/webhook.manager.factory";
@Injectable()
export class WebhookTypeManager implements WebhookManagerInterface {
  constructor(private webhookManagerFactory: WebhookManagerFactory) {}
  boxWebhook(body: WebhookBody, source: string): Promise<string> {
    return this.webhookManagerFactory
      .getWebhookManagerForType(source)
      .boxWebhook(body, source);
  }
}
