import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { Webhook } from "./webhook.entity";

@Entity()
export class WebhookHistory {
  @PrimaryColumn({
    type: "varchar",
    primaryKeyConstraintName: "WEBHOOK_HISTORY_ID",
  })
  id: string;

  @Column({ type: "varchar" })
  type: string;

  @Column({ type: "varchar" })
  webhookId: object;

  @Column({ type: "timestamptz", nullable: true, default: null })
  createdAt: Date | null;

  @Index("IDX_WEBHOOK_ID")
  @ManyToOne(() => Webhook, (webhook) => webhook.history, {
    onDelete: "CASCADE",
  })
  @JoinColumn({
    foreignKeyConstraintName: "FK_WEBHOOK_ID",
  })
  webhook: Webhook;
}
