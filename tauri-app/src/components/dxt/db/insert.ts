import { insertManifest } from "./create";

export async function insertOne(manifestObj: object) {
  try {
    await insertManifest(manifestObj);
  } catch (e) {
    console.error(e);
  }
}
