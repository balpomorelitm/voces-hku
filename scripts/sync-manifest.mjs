import { copyFile } from "node:fs/promises";

await copyFile("app/issues.json", "public/issues.json");
console.log("Synced app/issues.json to public/issues.json.");
