/**
 * @jest-environment ../test/environment/test-environment.ts
 **/
import { TestingModule, Test } from "@nestjs/testing";
import { ConfigModule } from "@nestjs/config";

import { BoxWebhookManager } from "./box.webhook.service";
import { DatabaseModule } from "@/db/db.module";
import { SharedModule } from "@/shared/modules/shared.module";
import { WebhookService } from "../../webhook.service";
import { WebhookManagerFactory } from "../../util/webhook.manager.factory";
import { WebhookTypeManager } from "../../webhook.type.manager";

describe("Box Webhook Factory", () => {
  let boxWebhookManager: BoxWebhookManager;
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
    boxWebhookManager = module.get<BoxWebhookManager>(BoxWebhookManager);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("Get Webhook manager for type", () => {
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

      const result = await boxWebhookManager.boxWebhook(
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
