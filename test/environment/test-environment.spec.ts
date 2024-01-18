/**
 * @jest-environment ./libs/test/test-environment.ts
 * @jest-environment-options {"features": ["postgres"], "env": "test-env-tests"}
 */

import { Client } from "pg";

describe("Test Environment", () => {
  it("PG Connection should be defined", () => {
    expect(process.env.DATABASE_URL).toBeDefined();
    expect(new URL(process.env.DATABASE_URL as string)).toBeDefined();
  });

  it("PG Connection should be valid", async () => {
    const url = new URL(process.env.DATABASE_URL as string);
    const config = {
      host: url.hostname,
      port: Number(url.port || 5432),
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      connectionTimeoutMillis: 4000,
    };
    const client = new Client(config);
    await expect(client.connect()).resolves;

    await client.end();
  });
});
