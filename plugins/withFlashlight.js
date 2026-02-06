module.exports = function withFlashlight(config) {
  if (!config.android) config.android = {};
  if (!config.android.permissions) config.android.permissions = [];
  
  const androidPermissions = [
    'android.permission.CAMERA',
    'android.permission.FLASHLIGHT',
  ];
  
  androidPermissions.forEach(permission => {
    if (!config.android.permissions.includes(permission)) {
      config.android.permissions.push(permission);
    }
  });

  if (!config.ios) config.ios = {};
  if (!config.ios.infoPlist) config.ios.infoPlist = {};
  
  config.ios.infoPlist.NSCameraUsageDescription = 
    config.ios.infoPlist.NSCameraUsageDescription || 
    'Necesitamos acceso a la cámara para activar la linterna en notificaciones urgentes';

  return config;
};
