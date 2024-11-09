import 'package:flutter_riverpod/flutter_riverpod.dart';

final liveAssessmentsListProvider = StateProvider<List?>((ref) => null);

final pastAssessmentsListProvider = StateProvider<List?>((ref) => null);

class QuizController extends StateNotifier<bool> {
  QuizController() : super(false);
}
