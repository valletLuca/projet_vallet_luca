import { Server } from "node:http";
import { AddressInfo } from "node:net";
import app from "../src/app";
import db from "../src/models";

export interface TestApi {
  url: string;
  close: () => Promise<void>;
}

export async function startApi(): Promise<TestApi> {
  await db.sequelize.sync({ force: true });
  const server: Server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });
  const { port } = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${port}/api`,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      await db.sequelize.close();
    }
  };
}

export function postJson(url: string, body: unknown): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}
