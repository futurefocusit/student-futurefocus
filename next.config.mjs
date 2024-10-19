module.exports = {
    swcMinify: false,
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Disable minimization
        config.optimization.minimize = false;

        // Optionally, you can remove the Terser plugin entirely
        config.optimization.minimizer = config.optimization.minimizer.filter(
            minimizer => minimizer.constructor.name !== 'TerserPlugin'
        );

        return config;
    },
}