class MeetingModel {
  final String id;
  final int studentId;
  final int meetId;
  final List<Emotion> textEmotions;
  final List<Emotion> videoEmotions;
  final List<Emotion> audioEmotions;
  final int v;
  final String title;
  final String hostName;
  final String description;

  MeetingModel({
    required this.id,
    required this.studentId,
    required this.meetId,
    required this.textEmotions,
    required this.videoEmotions,
    required this.audioEmotions,
    required this.v,
    required this.title,
    required this.hostName,
    required this.description,
  });

  factory MeetingModel.fromJson(Map<String, dynamic> json) => MeetingModel(
        id: json['_id'] ?? "",
        studentId: json['student_id'] ?? 0,
        meetId: json['meet_id'] ?? 0,
        textEmotions: (json['text_emotions'] as List<dynamic>? ?? [])
            .map((e) => Emotion.fromJson(e))
            .toList(),
        videoEmotions: (json['video_emotions'] as List<dynamic>? ?? [])
            .map((e) => Emotion.fromJson(e))
            .toList(),
        audioEmotions: (json['audio_emotions'] as List<dynamic>? ?? [])
            .map((e) => Emotion.fromJson(e))
            .toList(),
        v: json['__v'] ?? 0,
        title: json['title'] ?? "",
        hostName: json['host_name'] ?? "",
        description: json['description'] ?? "",
      );

  Map<String, dynamic> toJson() => {
        '_id': id,
        'student_id': studentId,
        'meet_id': meetId,
        'text_emotions': textEmotions.map((e) => e.toJson()).toList(),
        'video_emotions': videoEmotions.map((e) => e.toJson()).toList(),
        'audio_emotions': audioEmotions.map((e) => e.toJson()).toList(),
        '__v': v,
        'title': title,
        'host_name': hostName,
        'description': description,
      };
}

class Emotion {
  final int happy;
  final int surprised;
  final int confused;
  final int bored;
  final int pnf;

  Emotion({
    required this.happy,
    required this.surprised,
    required this.confused,
    required this.bored,
    required this.pnf,
  });

  factory Emotion.fromJson(Map<String, dynamic> json) => Emotion(
        happy: json['happy'] ?? 0,
        surprised: json['surprised'] ?? 0,
        confused: json['confused'] ?? 0,
        bored: json['bored'] ?? 0,
        pnf: json['pnf'] ?? 0,
      );

  Map<String, dynamic> toJson() => {
        'happy': happy,
        'surprised': surprised,
        'confused': confused,
        'bored': bored,
        'pnf': pnf,
      };
}
