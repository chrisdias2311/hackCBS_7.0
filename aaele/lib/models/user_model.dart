class UserModel {
  UserModel({
    required this.id,
    required this.pid,
    required this.userName,
    required this.email,
    required this.faceId,
    required this.disability,
    required this.phone,
    required this.password,
    required this.v,
  });

  String id;
  int pid;
  String userName;
  String email;
  String faceId;
  String disability;
  int phone;
  String password;
  int v;

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json["_id"],
        pid: json["pid"],
        userName: json["userName"],
        email: json["email"],
        faceId: json["face_id"],
        disability: json["disability"],
        phone: json["phone"],
        password: json["password"],
        v: json["__v"],
      );

  Map<String, dynamic> toJson() => {
        "_id": id,
        "pid": pid,
        "userName": userName,
        "email": email,
        "face_id": faceId,
        "disability": disability,
        "phone": phone,
        "password": password,
        "__v": v,
      };
}
