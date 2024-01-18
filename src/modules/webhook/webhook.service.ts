import { Injectable } from "@nestjs/common";
import { WebhookBody } from "@/common/types/webhook.types";
import { WebhookTypeManager } from "./webhook.type.manager";

@Injectable()
export class WebhookService {
  constructor(private webhookTypeManager: WebhookTypeManager) {}
  async webhook(body: WebhookBody, source: string): Promise<string> {
    return await this.webhookTypeManager.boxWebhook(body, source);
  }
}
