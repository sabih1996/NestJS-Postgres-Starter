import * as Docker from "dockerode";
import * as portFinder from "portfinder";
import { TestEnvironment as NodeEnvironment } from "jest-environment-node";
import { EnvironmentContext, JestEnvironmentConfig } from "@jest/environment";
import { Client } from "pg";

type PostgresEnvironment = {
  port: number;
  host: string;
  password: string;
};

export default class DockerEnvironment extends NodeEnvironment {
  constructor(config: JestEnvironmentConfig, context: EnvironmentContext) {
    super(config, context);
  }

  async setup() {
    await super.setup();

    try {
      let url;
      if (process.env.DATABASE_URL) {
        url = await this.startWithExistingDB();
      } else {
        url = await this.checkOrStartDockerDB();
      }

      const dbName = await createRandomDatabase(url);
      this.global.originalDatabaseUrl = url.toString();
      url.pathname = `/${dbName}`;
      this.global.databaseUrl = url.toString();

      console.log("DB Connection ", url.toString());
    } catch (err) {
      console.error(err);
    }
  }

  private async checkOrStartDockerDB() {
    const startTime = process.hrtime();
    const docker = new Docker();
    const { host, password, port } = await startPostgres(
      docker,
      `postgres-${this.global.env || "testenv"}`
    );
    const url = `postgres://postgres:${password}@${host}:${port}/postgres`;
    const startedTime = process.hrtime(startTime);
    console.log(
      `Postgres started in ${startedTime[0]}.${Math.round(
        startedTime[1] / 1000000
      )}s`
    );

    return new URL(url);
  }

  private async startWithExistingDB() {
    const connectionUrl = new URL(process.env.DATABASE_URL || "");
    console.log(`Using existing postgres DB [${connectionUrl.toString()}]`);

    return connectionUrl;
  }

  async teardown() {
    const urlString = this.global.databaseUrl as string | undefined;
    if (urlString) {
      const client = new Client({
        connectionString: this.global.originalDatabaseUrl as string,
      });
      await client.connect();
      const dbName = new URL(urlString).pathname.substring(1);
      try {
        await client.query(`drop database "${dbName}" WITH (FORCE)`, []);
      } catch (_) {}
      await client.end();
    }
    await super.teardown();
  }

  getVmContext() {
    const ctx = super.getVmContext();
    if (ctx) {
      ctx.process.env["DATABASE_URL"] = this.global.databaseUrl;
    }
    return ctx;
  }
}

const createRandomDatabase = async (url: URL) => {
  const client = new Client({ connectionString: url.toString() });
  await client.connect();
  const dbName = `${Math.round(
    Math.random() * Number.MAX_SAFE_INTEGER
  ).toString(16)}-testenv`;
  await client.query(`create database "${dbName}"`, []);
  await client.end();
  return dbName;
};

async function startPostgres(
  docker: Docker,
  name: string
): Promise<PostgresEnvironment> {
  let container;

  try {
    container = await docker.getContainer(name);
    if (container) {
      try {
        await container.inspect();
      } catch (ee) {
        container = null;
      }
    }
  } catch (_) {}

  if (!container) {
    container = await createPostgresContainer(name, docker);
  }

  const { port, password } = await getConfigFromContainer(container);

  if ((await container.inspect()).State.Status !== "running")
    await container.start();

  await waitForContainerHealthy(container);

  const host = "127.0.0.1";
  return { port, password, host };
}

const getPostgresConfig = (
  password: string,
  port: number,
  name: string
): Docker.ContainerCreateOptions => {
  const config: Docker.ContainerCreateOptions = {
    Image: "postgres:15",
    name,
    Env: [`POSTGRES_PASSWORD=${password}`],
    Healthcheck: {
      Test: ["CMD", "pg_isready"],
      Interval: 500000000,
      Timeout: 200000000,
      Retries: 100,
    },
    HostConfig: {
      PortBindings: { "5432/tcp": [{ HostPort: `${port}` }] },
    },
    ExposedPorts: {},
    AttachStdout: true,
    AttachStderr: true,
  };
  (config.ExposedPorts as { [port: string]: object })[`${port}/tcp`] = {};
  return config;
};

const rndString = (): string =>
  (Math.random() * Number.MAX_SAFE_INTEGER).toString(16);

const waitForContainerHealthy = async (
  container: Docker.Container
): Promise<void> => {
  while (true) {
    const status = (await container.inspect()).State.Health?.Status;
    if (status === "healthy") break;
    else if (status !== "starting") {
      const logs = await container.logs({ stdout: true, stderr: true });
      console.error(logs.toString());
      throw new Error(`Cannot start Postgres [${status}]`);
    }
    await new Promise((r) => setTimeout(r, 150));
  }
};
const createPostgresContainer = async (name: string, docker: Docker) => {
  const port = await portFinder.getPortPromise({
    port: 10000 + Math.round(Math.random() * (32768 - 10000)),
  });
  const password = rndString();
  const config = getPostgresConfig(password, port, name);
  return docker.createContainer(config);
};

const getConfigFromContainer = async (container: Docker.Container) => {
  const inspect = await container.inspect();
  const port = Object.keys(inspect.Config.ExposedPorts).map((port) =>
    Number(port.split("/")[0] || 5432)
  )[0];

  const password =
    inspect.Config.Env.map((env: string) => env.split("=")).find(
      (env) => env && env[0] === "POSTGRES_PASSWORD"
    )?.[1] || "mysecretpassword";
  return { port, password };
};
