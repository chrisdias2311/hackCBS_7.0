class Test {
  String id;
  int lectureId;
  int createdBy;
  String testName;
  DateTime startDateAndTime;
  DateTime endDateAndTime;
  int maxDuration;
  int maxMarks;

  Test({
    required this.id,
    required this.lectureId,
    required this.createdBy,
    required this.testName,
    required this.startDateAndTime,
    required this.endDateAndTime,
    required this.maxDuration,
    required this.maxMarks,
  });

  factory Test.fromJson(Map<String, dynamic> json) {
    return Test(
      id: json['_id'],
      lectureId: json['lectureId'],
      createdBy: json['createdBy'],
      testName: json['testName'],
      startDateAndTime: DateTime.parse(json['startDateAndTime']),
      endDateAndTime: DateTime.parse(json['endDateAndTime']),
      maxDuration: json['maxDuration'],
      maxMarks: json['maxMarks'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'lectureId': lectureId,
      'createdBy': createdBy,
      'testName': testName,
      'startDateAndTime': startDateAndTime.toIso8601String(),
      'endDateAndTime': endDateAndTime.toIso8601String(),
      'maxDuration': maxDuration,
      'maxMarks': maxMarks,
    };
  }
}

// Model for the Response
class AssessmentModel {
  Test test;
  int completedCount;
  int pendingCount;
  DateTime startDateAndTime;
  DateTime endDateAndTime;
  int maxDuration;
  int maxMarks;

  AssessmentModel({
    required this.test,
    required this.completedCount,
    required this.pendingCount,
    required this.startDateAndTime,
    required this.endDateAndTime,
    required this.maxDuration,
    required this.maxMarks,
  });

  factory AssessmentModel.fromJson(Map<String, dynamic> json) {
    return AssessmentModel(
      test: Test.fromJson(json['test']),
      completedCount: json['completedCount'],
      pendingCount: json['pendingCount'],
      startDateAndTime: DateTime.parse(json['startDateAndTime']),
      endDateAndTime: DateTime.parse(json['endDateAndTime']),
      maxDuration: json['maxDuration'],
      maxMarks: json['maxMarks'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'test': test.toJson(),
      'completedCount': completedCount,
      'pendingCount': pendingCount,
      'startDateAndTime': startDateAndTime.toIso8601String(),
      'endDateAndTime': endDateAndTime.toIso8601String(),
      'maxDuration': maxDuration,
      'maxMarks': maxMarks,
    };
  }
}

