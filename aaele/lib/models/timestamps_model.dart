class MeetingTimestampModel {
  final String id; // Assuming "_id" is the identifier
  final int meetId;
  final String modeType;
  final List<Timestamp> timestamps;
  final int version; // Assuming "__v" represents version

  MeetingTimestampModel({
    required this.id,
    required this.meetId,
    required this.modeType,
    required this.timestamps,
    required this.version,
  });

  factory MeetingTimestampModel.fromJson(Map<String, dynamic> json) => MeetingTimestampModel(
        id: json['_id'] as String,
        meetId: json['meet_id'] as int,
        modeType: json['modeType'] as String,
        timestamps: (json['timestamps'] as List)
            .map((e) => Timestamp.fromJson(e))
            .toList(),
        version: json['__v'] as int,
      );
}

class Timestamp {
  final int reportNo;
  final String timeStamp;
  final List<TimestampEmotion> emotions;

  Timestamp({
    required this.reportNo,
    required this.timeStamp,
    required this.emotions,
  });

  factory Timestamp.fromJson(Map<String, dynamic> json) => Timestamp(
        reportNo: json['report_no'] as int,
        timeStamp: json['timeStamp'] as String,
        emotions: (json['emotions'] as List)
            .map((e) => TimestampEmotion.fromJson(e))
            .toList(),
      );
}

class TimestampEmotion {
  final int confused; // Assuming "confused" might exist in text data
  final int happy;
  final int surprised;
  final int bored;
  final int pnf;

  TimestampEmotion({
    this.confused = 0, // Set default value for potentially missing fields
    required this.happy,
    this.surprised = 0,
    this.bored = 0,
    this.pnf = 0,
  });

  factory TimestampEmotion.fromJson(Map<String, dynamic> json) => TimestampEmotion(
        confused: json['confused'] as int? ?? 0, // Handle potential missing field
        happy: json['happy'] as int? ?? 0,
        surprised: json['surprised'] as int? ?? 0,
        bored: json['bored'] as int? ?? 0,
        pnf: json['pnf'] as int? ?? 0,
      );
}