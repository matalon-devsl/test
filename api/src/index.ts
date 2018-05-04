import * as winston from "winston";
import { createBasicApp } from "./httpd/app";
import { createRouter } from "./httpd/router";
import { RpcMultichainClient } from "./multichain";
import { randomString } from "./multichain/hash";
import { provisionBlockchain } from "./provisioning";

/*
 * Init the logs
 */
const winstonConsole = new winston.transports.Console();
winston.add(winstonConsole);

/*
 * Deal with the environment:
 */

const port: number = (process.env.PORT && parseInt(process.env.PORT)) || 8080;

const jwtSecret: string = process.env.JWT_SECRET || randomString(32);
if (jwtSecret.length < 32) {
  console.log("Warning: the JWT secret key should be at least 32 characters long.");
}
const rootSecret: string = process.env.ROOT_SECRET || randomString(32);
if (!process.env.ROOT_SECRET) {
  console.log(`Warning: root password not set; autogenerated to ${rootSecret}`);
}

/*
 * Initialize the components:
 */

const multichainClient = new RpcMultichainClient({
  protocol: "http",
  host: process.env.RPC_HOST || "localhost",
  port: parseInt(process.env.RPC_PORT || "8000", 10),
  username: process.env.RPC_USER || "multichainrpc",
  password: process.env.RPC_PASS || "s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j",
});

const app = createBasicApp(jwtSecret, rootSecret);
app.use("/", createRouter(multichainClient, jwtSecret, rootSecret));

/*
 * Run the app:
 */

app.listen(port, err => {
  if (err) {
    return console.log(err);
  }
  console.log("trigger deployment pipeline...");
  winston.info("Starting deployment pipeline...");
  provisionBlockchain(port, rootSecret, multichainClient)
    .then(() => console.log("Chain provisioned."))
    .catch(provisionError => console.log({ provisionError }));
  console.log(`server is listening on ${port}`);
});
