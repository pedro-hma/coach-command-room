import { createServerFn } from "@tanstack/react-start";

export const checarSincroniaGithub = createServerFn({ method: "GET" }).handler(async () => {
  const { verificarSincronia } = await import("./github-sync.server");
  return verificarSincronia();
});
