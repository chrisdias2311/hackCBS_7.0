import 'dart:developer';

import 'package:permission_handler/permission_handler.dart';

class PermissionHandler {
  Future<bool> cameraPermission() async {
    PermissionStatus cameraStatus = await Permission.camera.status;

    if(cameraStatus == PermissionStatus.denied || cameraStatus == PermissionStatus.limited) {
    log("Camera Permssion");
      cameraStatus = await Permission.camera.request();
    } else if (cameraStatus == PermissionStatus.permanentlyDenied) {
      await openAppSettings();
      return false; 
    }

    print("Camera" + cameraStatus.toString());
    return cameraStatus == PermissionStatus.granted; 
  }

  Future<bool> micPermission() async {
    PermissionStatus micStatus = await Permission.microphone.status;

    if(micStatus == PermissionStatus.denied || micStatus == PermissionStatus.limited) {
    log("mic");
      micStatus = await Permission.microphone.request();
    } else if (micStatus == PermissionStatus.permanentlyDenied) {
      await openAppSettings();
      return false; 
    }

    print("Mic" + micStatus.toString());
    return micStatus == PermissionStatus.granted; 
  }

  Future<bool> storagePermission() async {
    PermissionStatus storageStatus = await Permission.storage.status;

    if(storageStatus == PermissionStatus.denied || storageStatus == PermissionStatus.limited) {
    log("storage");
      storageStatus = await Permission.manageExternalStorage.request();
    } else if (storageStatus == PermissionStatus.permanentlyDenied) {
      await openAppSettings();
      return false; 
    }

    print("Storgae" + storageStatus.toString());
    return storageStatus == PermissionStatus.granted; 
  }

  Future<bool> requestAllPermissions() async {
    final cameraGranted = await cameraPermission();
    final micGranted = await micPermission();
    final storageGranted = await storagePermission();

    return cameraGranted && micGranted && storageGranted;
  }
}