import 'package:awesome_snackbar_content/awesome_snackbar_content.dart';
import 'package:flutter/material.dart';

snackBar(String title, String message, ContentType contentType) {
  return SnackBar(
    dismissDirection: DismissDirection.horizontal,
    elevation: 0,
    behavior: SnackBarBehavior.floating,
    backgroundColor: Colors.transparent,
    content: AwesomeSnackbarContent(
      title: title,
      message: message,

      /// change contentType to ContentType.success, ContentType.warning or ContentType.help for variants
      contentType: contentType,
    ),
  );
}

errorSnackBar(BuildContext context) {
  return ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
        snackBar('Error!', 'Something went wrong', ContentType.failure));
}

featureComingSoonSnackBar(BuildContext context) {
  return ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
        snackBar('On Snap!', 'Feature Coming soon! :)', ContentType.help));
}

cannotTakeTest(BuildContext context) {
  return ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
        snackBar('Permission denied', 'You cannot take test', ContentType.failure)); 
}
