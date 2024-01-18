import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1690980939333 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "webhook_history" (
        "id" varchar NOT NULL, 
        "type" varchar NULL, 
        "webhook_id" varchar NOT NULL, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        PRIMARY KEY ("id"));`);

    await queryRunner.query(
      `CREATE INDEX "IDX_WEBHOOK_ID" ON "webhook_history" ("webhook_id");`
    );

    await queryRunner.query(
      `CREATE TABLE "webhook" (
        "id" varchar NOT NULL, 
        "source" varchar NULL, 
        "type" varchar NOT NULL, 
        "description" varchar NOT NULL, 
        "payload" jsonb NOT NULL DEFAULT '{}', 
        "receieved_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "completed_at" TIMESTAMP NOT NULL DEFAULT now(), 
        PRIMARY KEY ("id"));`
    );

    await queryRunner.query(
      `ALTER TABLE "webhook_history" 
        ADD CONSTRAINT "FK_WEBHOOK_ID" 
        FOREIGN KEY ("webhook_id") REFERENCES "webhook"("id") 
        ON DELETE CASCADE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "webhook_history"`);
    await queryRunner.query(`DROP TABLE "webhook"`);
  }
}
