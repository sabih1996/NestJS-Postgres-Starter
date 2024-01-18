import { WebhookBody } from "@/common/types/webhook.types";

export interface WebhookManagerInterface {
  boxWebhook(body: WebhookBody, source: string): Promise<string>;
}
