import dotenv from "dotenv";
dotenv.config();

const BACKEND_HOST = process.env.BACKEND_HOST;
const BACKEND_PORT = process.env.BACKEND_PORT;

export const url = `http://${BACKEND_HOST}:${BACKEND_PORT}/api`;