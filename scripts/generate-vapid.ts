import { generateVapidKeys } from "@mmmike/web-push/vapid";

console.log("start");

const keys = await generateVapidKeys();

console.log("keys:", keys);
console.log("VAPID_PUBLIC_KEY=", keys.publicKey);
console.log("VAPID_PRIVATE_KEY=", keys.privateKey);