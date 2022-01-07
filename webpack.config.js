const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const TerserPlugin = require("terser-webpack-plugin");

module.exports = async function (env, argv) {
  //env["offline"] = false;
  const config = await createExpoWebpackConfigAsync(env,argv);
  // Customize the config before returning it.
  if (config.mode === 'production') {
    //env["offline"] = true;
    const config2 = await createExpoWebpackConfigAsync(env,argv);
    config2.optimization.minimize=true
    //config.optimization.minimizer = [new TerserPlugin()];
    return config2;
  }
  return config;
};
