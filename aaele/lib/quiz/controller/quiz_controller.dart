import 'dart:convert';
import 'dart:developer';
import 'package:aaele/constants/constants.dart';
import 'package:aaele/models/live_assessment_model.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

final liveAssessmentsListProvider = StateProvider<List?>((ref) => null);

final pastAssessmentsListProvider = StateProvider<List?>((ref) => null);

final getLiveAssessmentsProvider =
    FutureProvider<List<AssessmentModel>>((ref) async {
  return ref.read(quizControllerProvider.notifier).fetchLiveAssessments();
});

final getPastAssessmentsProvider =
    FutureProvider<List<AssessmentModel>>((ref) async {
  return ref.read(quizControllerProvider.notifier).fetchPastAssessments();
});

final quizControllerProvider =
    StateNotifierProvider<QuizController, bool>((ref) {
  return QuizController();
});

class QuizController extends StateNotifier<bool> {
  QuizController() : super(false);

  Future<List<AssessmentModel>> fetchLiveAssessments() async {
    try {
      final response =
          await http.get(Uri.parse('$url/student_test/view_live_tests'));
      if (response.statusCode == 200) {
        final List<dynamic> responseBody = jsonDecode(response.body);
        return responseBody
            .map((json) => AssessmentModel.fromJson(json))
            .toList();
      } else {
        throw Exception('Failed to load test data');
      }
    } catch (e) {
      log(e.toString());
      rethrow;
    }
  }

  Future<List<AssessmentModel>> fetchPastAssessments() async {
    try {
      final response =
          await http.get(Uri.parse('$url/student_test/view_past_tests'));
      if (response.statusCode == 200) {
        final List<dynamic> responseBody = jsonDecode(response.body);
        return responseBody
            .map((json) => AssessmentModel.fromJson(json))
            .toList();
      } else {
        throw Exception('Failed to load test data');
      }
    } catch (e) {
      log(e.toString());
      rethrow;
    }
  }
}
