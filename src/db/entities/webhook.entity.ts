import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { WebhookHistory } from "./webhook-history.entity";

@Entity()
export class Webhook {
  @PrimaryColumn({
    type: "varchar",
    primaryKeyConstraintName: "WEBHOOK_ID",
  })
  id: string;

  @Column({ type: "varchar" })
  source: string;

  @Column({ type: "varchar" })
  type: string;

  @Column("jsonb", { nullable: false, default: {} })
  payload: object;

  @Column({ type: "timestamptz", nullable: true, default: null })
  public receivedAt: Date | null;

  @Column({ type: "timestamptz", nullable: true, default: null })
  public completedAt: Date | null;

  @OneToMany(() => WebhookHistory, (history) => history.webhook, {
    cascade: true,
  })
  history: WebhookHistory[];
}
