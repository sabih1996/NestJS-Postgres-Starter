/**
 * @jest-environment ../test/environment/test-environment.ts
 **/
import { TestingModule, Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

import { DatabaseModule } from "../../../db/db.module";
import { SharedModule } from "../../../shared/modules/shared.module";
import { WebhookManagerFactory } from "./webhook.manager.factory";
import { WebhookService } from "../webhook.service";
import { BoxWebhookManager } from "../managers/providers/box.webhook.service";
import { WebhookTypeManager } from "../webhook.type.manager";

describe("Box Webhook Factory", () => {
  let webhookManagerFactory: WebhookManagerFactory;
  let module: TestingModule;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, SharedModule],
      providers: [
        WebhookService,
        WebhookManagerFactory,
        BoxWebhookManager,
        WebhookTypeManager,
      ],
    }).compile();
    webhookManagerFactory = module.get<WebhookManagerFactory>(
      WebhookManagerFactory
    );
  });

  afterAll(async () => {
    await module.close();
  });

  describe("Get Webhook manager for type", () => {
    it("should throw error if implementation of an webhook is not supported", () => {
      try {
        webhookManagerFactory.getWebhookManagerForType("unsupported");
      } catch (err) {
        expect(err["message"]).toEqual("Webhoook Not Supported");
      }
    });

    it("should return correct implementation on correct source", async () => {
      const boxWebhookSpy = jest.spyOn(
        module.get<BoxWebhookManager>(BoxWebhookManager),
        "boxWebhook"
      );
      boxWebhookSpy.mockImplementation(() => {
        return new Promise((resolve, reject) => {
          resolve("box");
        });
      });

      const result = await webhookManagerFactory
        .getWebhookManagerForType("box")
        .boxWebhook(
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
      expect(result).toEqual("box");
    });
  });
});
