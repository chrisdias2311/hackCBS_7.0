
import 'report_model.dart';

class OverallMeetingModel {
  final String id; // Assuming "_id" is the identifier
  final int meetId;
  final String title;
  final String description;
  final String startTime;
  final String endTime;
  final String hostName;
  final List<Emotion> textEmotions;
  final List<Emotion> videoEmotions;
  final List<Emotion> audioEmotions;
  final int version; // Assuming "__v" represents version

  OverallMeetingModel({
    required this.id,
    required this.meetId,
    required this.title,
    required this.description,
    required this.startTime,
    required this.endTime,
    required this.hostName,
    required this.textEmotions,
    required this.videoEmotions,
    required this.audioEmotions,
    required this.version,
  });

  factory OverallMeetingModel.fromJson(Map<String, dynamic> json) =>
      OverallMeetingModel(
        id: json['_id'] as String,
        meetId: json['meet_id'] as int,
        title: json['title'] as String,
        description: json['description'] as String,
        startTime: json['startTime'] as String,
        endTime: json['endTime'] as String,
        hostName: json['host_name'] as String,
        textEmotions: (json['text_emotions'] as List)
            .map((e) => Emotion.fromJson(e))
            .toList(),
        videoEmotions: (json['video_emotions'] as List)
            .map((e) => Emotion.fromJson(e))
            .toList(),
        audioEmotions: (json['audio_emotions'] as List)
            .map((e) => Emotion.fromJson(e))
            .toList(),
        version: json['__v'] as int,
      );
}
