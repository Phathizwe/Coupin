// JavaScript wrapper to run the TypeScript script
require('ts-node').register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs'
  }
});

// Now require the TypeScript file
require('./deleteOldPricingPlans.ts');