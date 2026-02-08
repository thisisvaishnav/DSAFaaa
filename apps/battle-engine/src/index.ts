import http from "http";
import express from "express";
import cors from "cors";

import { db } from "./core/database/db.client";
import { redis } from "./core/queue/redis.client";
import { socketManager } from "./core/socket/socket.manager";
import { corsConfig } from "./config/cors.config";
import { socketConfig } from "./config/socket.config";
import { authRouter } from "./features/auth/auth.routes";

const app = express();

app.use(cors(corsConfig));
app.use(authRouter);

const server = http.createServer(app);

export const io = socketManager.init(server);

server.listen(3000, () => {
  console.log(`Server running on http://localhost:3000`);
});
