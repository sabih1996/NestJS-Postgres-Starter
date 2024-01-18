/**
 * @jest-environment ../test/environment/test-environment.ts
 **/
import { TestingModule, Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

import { DatabaseModule } from "../../db/db.module";
import { SharedModule } from "../../shared/modules/shared.module";
import { WebhookService } from "./webhook.service";
import { WebhookController } from "./webhook.controller";
import { WebhookManagerFactory } from "./util/webhook.manager.factory";
import { BoxWebhookManager } from "./managers/providers/box.webhook.service";
import { WebhookTypeManager } from "./webhook.type.manager";

describe("Box Webhook Factory", () => {
  let webhookService: WebhookService;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, SharedModule],
      controllers: [WebhookController],
      providers: [
        WebhookService,
        WebhookManagerFactory,
        BoxWebhookManager,
        WebhookTypeManager,
      ],
      exports: [WebhookService],
    }).compile();
    webhookService = module.get<WebhookService>(WebhookService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("Webhook", () => {
    it("should check correct calling of function with desired parameter", async () => {
      const boxWebhookSpy = jest.spyOn(
        module.get<WebhookService>(WebhookService),
        "webhook"
      );
      boxWebhookSpy.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve("box");
        });
      });

      await webhookService.webhook(
        {
          type: "FOLDER",
          trigger: "trigger_at",
          source: {
            id: "1232454",
            type: "folder",
            name: "file.png",
            trashed_at: null,
            purged_at: null,
          },
        },
        "box"
      );
      expect(boxWebhookSpy).toHaveBeenCalled();
      expect(boxWebhookSpy).toHaveBeenCalledWith(
        {
          type: "FOLDER",
          trigger: "trigger_at",
          source: {
            id: "1232454",
            type: "folder",
            name: "file.png",
            trashed_at: null,
            purged_at: null,
          },
        },
        "box"
      );
    });
  });
});
