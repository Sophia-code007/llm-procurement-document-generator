import { createServer } from "vite";

const server = await createServer({
  server: { port: 5173 },
});

await server.listen();
server.printUrls();

process.once("SIGINT", async () => {
  await server.close();
  process.exit(0);
});
process.once("SIGTERM", async () => {
  await server.close();
  process.exit(0);
});
