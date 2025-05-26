// Re-export handlers from the auth configuration
import { handlers } from "@/lib/auth-config";

export const { GET, POST } = handlers;
