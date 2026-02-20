import { app } from "./app";
import { env } from "./config/env";
import { seedAdmin } from "./bootstrap/seedAdmin";

const start = async (): Promise<void> => {
  await seedAdmin();
  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
};

start().catch((error: unknown) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
