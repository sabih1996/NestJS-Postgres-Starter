import { Module } from "@nestjs/common";
import { SharedModule } from "src/shared/modules/shared.module";
import { WebhookService } from "./webhook.service";
import { WebhookController } from "./webhook.controller";
import { WebhookManagerFactory } from "./util/webhook.manager.factory";
import { TestWebhookManager } from "./managers/providers/box.webhook.service";
import { WebhookTypeManager } from "./webhook.type.manager";

@Module({
  imports: [SharedModule],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    WebhookManagerFactory,
    TestWebhookManager,
    WebhookTypeManager,
  ],
  exports: [WebhookService],
})
export class WebhookModule {}
