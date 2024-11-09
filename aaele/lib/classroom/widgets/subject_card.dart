import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class SubjectCard extends ConsumerWidget {
  final String name;
  final String testBy;
  final String description;
  final String lecDisplayImage;
  final Color color;
  const SubjectCard({
    super.key,
    required this.name,
    required this.testBy,
    required this.description,
    required this.color,
    required this.lecDisplayImage,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Container(
        height: 150,
        width: double.infinity,
        decoration: BoxDecoration(
            image: DecorationImage(
              image: ExactAssetImage(lecDisplayImage),
              fit: BoxFit.cover,
              colorFilter: ColorFilter.mode(
                Colors.white.withOpacity(0.3),
                BlendMode.dstATop,
              ),
            ),
            color: color,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.shade400.withOpacity(0.5),
                spreadRadius: 2,
                blurRadius: 1,
                offset: Offset(0, 3), // changes position of shadow
              ),
            ]),
        child: Stack(
          children: [
            Padding(
              padding: const EdgeInsets.all(15.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    (name.length > 1) ? "${name.substring(0, 1).toUpperCase()}${name.substring(1)}" : "",
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.w500,
                        overflow: TextOverflow.ellipsis),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    (testBy.length > 1) ? "Host: ${testBy.substring(0, 1).toUpperCase()}${testBy.substring(1)}" : "",
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        overflow: TextOverflow.ellipsis),
                  ),
                  const SizedBox(height: 40),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          description,
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              overflow: TextOverflow.ellipsis),
                        ),
                      ),
                    ],
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}