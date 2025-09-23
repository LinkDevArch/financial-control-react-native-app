const { withAndroidManifest } = require('@expo/config-plugins');

const withForceDarkAllowed = (config) => {
  return withAndroidManifest(config, (config) => {
    const androidManifest = config.modResults;
    const application = androidManifest.manifest.application[0];
    
    // Add forceDarkAllowed="false" to application
    application.$['android:forceDarkAllowed'] = 'false';
    
    return config;
  });
};

module.exports = withForceDarkAllowed;
