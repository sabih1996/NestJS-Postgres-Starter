import { Inject, Module, OnModuleInit } from "@nestjs/common";
import {
  TypeOrmOptionsFactory,
  TypeOrmModuleOptions,
  TypeOrmModule,
} from "@nestjs/typeorm";
import { join } from "node:path";

import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
class TypeOrmConfigService implements TypeOrmOptionsFactory {
  dbConnectionUrl = new URL(process.env.DATABASE_URL);
  databaseName = this.dbConnectionUrl.pathname.substring(1);

  initDB = async () => {
    const connection = new DataSource({
      type: "postgres",
      url: `postgres://${this.dbConnectionUrl.username}:${
        this.dbConnectionUrl.password
      }@${this.dbConnectionUrl.hostname}:${this.dbConnectionUrl.port || 5432}`,
    });

    await connection.connect();

    const queryResult = await connection.query(
      `SELECT 1 FROM pg_database WHERE datname='${this.databaseName}';`
    );
    if (queryResult.length === 0) {
      try {
        await connection.query(`CREATE DATABASE "${this.databaseName}";`);
      } catch (err) {
        if (
          (err as { constraint: string })?.constraint !=
          "pg_database_datname_index"
        ) {
          throw err;
        }
      }
    }
    await connection.destroy();
  };

  public async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    await this.initDB();
    return {
      type: "postgres",
      url: this.dbConnectionUrl.toString(),
      entities: [join(__dirname, "**", "*.entity.{ts,js}")],
      synchronize: true,
      migrations: ["dist/**/migrations/*.{ts,js}"],
      migrationsRun: true,
      logging: process.env.NODE_ENV == "development",
      namingStrategy: new SnakeNamingStrategy(),
    };
  }
}

@Module({
  imports: [TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService })],
  controllers: [],
  providers: [],
})
export class DatabaseModule implements OnModuleInit {
  @Inject() datasource!: DataSource;
  constructor() {
    console.log("Connecting to DB ", process.env.DATABASE_URL);
  }
  async onModuleInit() {
    const databaseUpQueries = (
      await this.datasource.driver.createSchemaBuilder().log()
    ).upQueries;
    if (databaseUpQueries.length > 0) {
      console.error(
        "Outstanding database migrations\n",
        databaseUpQueries.map((query) => "\t" + query.query).join("\n")
      );
      throw new Error("Outstanding database migrations");
    }
  }
}
