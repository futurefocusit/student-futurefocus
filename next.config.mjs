/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.optimization.minimize = false; // Disable Terser
        return config;
    },
};

export default nextConfig;
