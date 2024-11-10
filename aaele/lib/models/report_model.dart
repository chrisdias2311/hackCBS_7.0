class Report {
  final String id;
  final int studentId;
  final int meetId;
  final List<Emotion> textEmotions;
  final List<Emotion> videoEmotions;
  final List<Emotion> audioEmotions;
  final int presentPercentage;

  Report({
    required this.id,
    required this.studentId,
    required this.meetId,
    required this.textEmotions,
    required this.videoEmotions,
    required this.audioEmotions,
    required this.presentPercentage,
  });

  factory Report.fromJson(Map<String, dynamic> json) {
    return Report(
      id: json['_id'] ?? "",
      studentId: json['student_id'] ?? "",
      meetId: json['meet_id'] ?? "",
      textEmotions: List<Emotion>.from(json['text_emotions'].map((x) => Emotion.fromJson(x))),
      videoEmotions: List<Emotion>.from(json['video_emotions'].map((x) => Emotion.fromJson(x))),
      audioEmotions: List<Emotion>.from(json['audio_emotions'].map((x) => Emotion.fromJson(x))),
      // presentPercentage: json['presentPercentage'] ?? ""
      presentPercentage: json['presentPercentage'] ?? 0
    );
  }
}

class Emotion {
  final double happy;
  final double surprised;
  final double confused;
  final double bored;
  final double pnf;

  Emotion({
    required this.happy,
    required this.surprised,
    required this.confused,
    required this.bored,
    required this.pnf,
  });

  factory Emotion.fromJson(Map<String, dynamic> json) {
    return Emotion(
      happy: json['happy'].toDouble() ?? 0.0,
      surprised: json['surprised'].toDouble() ?? 0.0,
      confused: json['confused'].toDouble() ?? 0.0,
      bored: json['bored'].toDouble() ?? 0.0,
      pnf: json['pnf'].toDouble() ?? 0.0,
    );
  }
}
