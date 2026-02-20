import createNextIntlPlugin from "next-intl/plugin";
import { routing } from "./i18n/routing.js";

const withNextIntl = createNextIntlPlugin(routing);

const nextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "**",
            },
        ],
    },
    env: {
        NEXT_PUBLIC_API_BASE: process.env.STAGING === 'true' ? 'https://staging-api.modifold.com' : (process.env.NEXT_PUBLIC_API_BASE || 'https://api.modifold.com')
    }
};

export default withNextIntl(nextConfig);