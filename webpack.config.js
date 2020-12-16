const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = async function (env, argv) {
  env["offline"] = true;
  const config = await createExpoWebpackConfigAsync(env,argv);
  // Customize the config before returning it.
  /*if (config.mode === 'production') {
    config.optimization.minimize=true
    config.optimization.minimizer = [new TerserPlugin()];
  }*/
  return config;
};
