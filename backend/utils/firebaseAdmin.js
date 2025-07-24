import admin from "firebase-admin";
import {read, readFileSync} from "fs";

const serviceAccount = JSON.parse(
    readFileSync("config/firebase-service-account.json", "utf-8")
);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export default admin;