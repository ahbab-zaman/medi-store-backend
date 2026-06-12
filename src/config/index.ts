import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
    reset_secret: process.env.JWT_RESET_SECRET ?? process.env.JWT_SECRET,
    reset_expires_in: process.env.JWT_RESET_EXPIRES_IN ?? "1h",
  },
  frontend_url: process.env.FRONTEND_URL ?? "http://localhost:3000",
  stripe_secret_key: process.env.STRIPE_SECRET_KEY,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS ?? process.env.EMAIL_PASSWORD,
  openrouter_api_key: process.env.OPENROUTER_API_KEY,
  hf_api_key: process.env.HF_API_KEY,
  redis: {
    url: process.env.REDIS_URL,
    cache_ttl_seconds: process.env.REDIS_CACHE_TTL_SECONDS,
    cache_key_prefix: process.env.RAG_CACHE_KEY_PREFIX,
    connect_timeout_ms: process.env.REDIS_CONNECT_TIMEOUT_MS,
  },
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  },
};
