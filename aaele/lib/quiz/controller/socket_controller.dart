import 'dart:developer';

import 'package:dash_chat_2/dash_chat_2.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

final socketControllerProvider = StateNotifierProvider.autoDispose.family<SocketController, List<ChatMessage>, String>((ref, testId) {
  return SocketController(testId: testId);
});

class SocketController extends StateNotifier<List<ChatMessage>> {
  final String testId;
  SocketController({required this.testId}) : super([]) {
    _initSocket();
    _flutterTts.setVoice({"name": currentVoice["name"], "locale": currentVoice["locale"]});
  }

  // final String serverUrl = 'ws://192.168.0.102:5000';
  final String serverUrl = "wss://mood-lens-server.onrender.com";
  // final String testId = "6719fb40f1230bb78e7c4740";
  late io.Socket socket;
  FlutterTts _flutterTts = FlutterTts();
  List<Map> voices = [
    {"name": "en-in-x-end-local", "locale": "en-IN"},
    {"name": "en-in-x-ena-network", "locale": "en-IN"},
    {"name": "en-in-x-ahp-network", "locale": "en-IN"},
    {"name": "en-in-x-ene-local", "locale": "en-IN"},
    {"name": "en-in-x-enc-network", "locale": "en-IN"},
    {"name": "en-in-x-enc-local", "locale": "en-IN"},
    {"name": "en-in-x-ahp-local", "locale": "en-IN"},//
    {"name": "en-in-x-end-network", "locale": "en-IN"},
    {"name": "en-in-x-ena-local", "locale": "en-IN"}
  ];

  Map currentVoice = {"name": "en-in-x-ahp-local", "locale": "en-IN"};

  final ChatUser geminiUser = ChatUser(
    id: "2",
    firstName: "Gemini",
    profileImage:
        "https://play-lh.googleusercontent.com/dT-r_1Z9hUcif7CDSD5zOdOt4KodaGdtkbGszT6WPTqKQ-WxWxOepO6VX-B3YL290ydD=w240-h480-rw",
  );

  void _initSocket() {
    socket = io.io(serverUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
    });

    socket.connect();

    socket.onConnect((_) {
      log('Connected to the socket server');
      log("start_test emitting");
      socket.emit("start_test", {"test_id": testId});
    });

    socket.onDisconnect((_) => log('Disconnected from the socket server'));

    socket.on("response", (response) {
      log(response.toString());
      _addMessage(response.toString());
    });

    socket.on("questions", (question) {
      log(question.toString());
      _addMessage(question.toString());
    });
  }

  void _addMessage(String text) {
    final message = ChatMessage(
      user: geminiUser,
      createdAt: DateTime.now(),
      text: text,
    );
    state = [message, ...state];
    
    _flutterTts.speak(message.text);
  }

  void sendMessage(ChatMessage message) {
    log("User message: ${message.text}");
    socket.emit('message', message.text);
    state = [message, ...state];
  }

  @override
  void dispose() {
    socket.disconnect();
    socket.dispose();
    super.dispose();
  }

  // Text To speech for quiz
  // void initTts() {
  //   _flutterTts.getVoices.then((data) {
  //     try {
  //       currentVoice = voices.first;
  //       setVoice(currentVoice);
  //     } catch (e) {
  //       log(e.toString());
  //     }
  //   });
  // }

  void setVoice(Map voice) {
    currentVoice = voice;
    _flutterTts.setVoice({"name": voice["name"], "locale": voice["locale"]});
  }
}
