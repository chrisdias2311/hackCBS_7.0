import 'package:aaele/quiz/controller/quiz_controller.dart';
import 'package:aaele/widgets/snackbar.dart';
import 'package:awesome_snackbar_content/awesome_snackbar_content.dart';
import 'package:dash_chat_2/dash_chat_2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_windowmanager/flutter_windowmanager.dart';
import 'package:quickalert/quickalert.dart';

class TakeQuizScreen extends ConsumerStatefulWidget {
  const TakeQuizScreen({super.key});

  @override
  ConsumerState<ConsumerStatefulWidget> createState() => _TakeQuizScreenState();
}

class _TakeQuizScreenState extends ConsumerState<TakeQuizScreen>
    with WidgetsBindingObserver {

  bool wasInBackground = false;
  bool alertDisplayed = false;

  Future<void> enableRestrictMode() async {
    await FlutterWindowManager.addFlags(FlutterWindowManager.FLAG_SECURE);
  }

  Future<void> disableRestrictMode() async {
    await FlutterWindowManager.clearFlags(FlutterWindowManager.FLAG_SECURE);
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    enableRestrictMode();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    disableRestrictMode();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
    if (!wasInBackground && !alertDisplayed) {
      alertDisplayed = true;
      QuickAlert.show(
        context: context,
        type: QuickAlertType.warning,
        title: 'Warning!',
        text: 'Accessing the notification center or running other apps while the quiz is active is restricted.',
        onConfirmBtnTap: () {
          alertDisplayed = false;
          Navigator.of(context).pop();
        }
      );
       // Mark that alert was displayed
    } else if (wasInBackground && !alertDisplayed) {
      alertDisplayed = true;
      QuickAlert.show(
        context: context,
        type: QuickAlertType.error,
        title: 'Oops...',
        text: 'The quiz has been terminated because you accessed the notification center or switched to another app.',
        onConfirmBtnTap: () {
          Navigator.of(context).pop();
          Navigator.of(context).pop();
        }
      );
    }
    wasInBackground = true;
  }
    super.didChangeAppLifecycleState(state);
  }

  @override
  Widget build(BuildContext context) {
    ChatUser currentUser = ChatUser(id: "1", firstName: "Vighnesh");
    final messages = ref.watch(quizControllerProvider);
    final quizController = ref.watch(quizControllerProvider.notifier);
    return Scaffold(
      backgroundColor: Colors.lightGreen.shade200,
      appBar: AppBar(
        title: const Text(
          "AAELE",
          style: TextStyle(
              fontSize: 22, fontWeight: FontWeight.bold, fontFamily: "Nunito"),
        ),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 15.0),
            child: GestureDetector(
                onTap: () {
                  ScaffoldMessenger.of(context)
                    ..hideCurrentSnackBar()
                    ..showSnackBar(snackBar('On Snap!',
                        'Feature Coming soon! :)', ContentType.help));
                },
                child: Icon(Icons.info_outline_rounded,
                    color: Colors.grey.shade500)),
          )
        ],
      ),
      body: DashChat(
        currentUser: currentUser,
        onSend: quizController.sendMessage,
        messages: messages,
        messageOptions:
            MessageOptions(currentUserContainerColor: Colors.green.shade600),
      ),
    );
  }
}

// Padding(
//             padding: const EdgeInsets.all(8.0),
//             child: DropdownButton<Map>(
//               value: voices.contains(currentVoice) ? currentVoice : null,
//               items: voices.map((voice) {
//                 return DropdownMenuItem<Map>(
//                   value: voice, // Ensure this is a Map
//                   child: Text(voice["name"]),
//                 );
//               }).toList(),
//               onChanged: (value) {
//                 if (value != null) {
//                   quizController.setVoice(value);
//                 }
//               },
//               hint: Text('Select Voice'), // Optional hint
//             ),
//           ),