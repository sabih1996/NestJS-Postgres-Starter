import { Injectable } from "@nestjs/common";
import { ESources } from "../enum/webhook.enum";
import { WebhookManagerInterface } from "../interfaces/webhook.interface";
import { BoxWebhookManager } from "../managers/providers/box.webhook.service";
const WebhookManagerError = Error;
@Injectable()
export class WebhookManagerFactory {
  constructor(public boxWebhookManager: BoxWebhookManager) {}
  getWebhookManagerForType(source: string): WebhookManagerInterface {
    if (source === ESources.TEST) {
      return this.boxWebhookManager;
    }

    throw new WebhookManagerError("Webhoook Not Supported");
  }
}
