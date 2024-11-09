import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import axios from "axios";

// Variables to store references for state and timers
let mediaRecorderRef = null;
let chunks = [];
let intervalRef = null;
let videoCount = 0;
let isRecording = false;

export const startRecording = async (storage, roomId, setVideoDownloadURLs, stopRecordingCallback) => {
    try {
        // Capture the screen stream
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: 7680, height: 4320 }, // 4080p quality
            audio: true, // Include system audio
        });

        // Capture the microphone audio stream
        const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
        });

        // Combine the screen and microphone streams
        const combinedStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...audioStream.getAudioTracks(),
        ]);

        mediaRecorderRef = new MediaRecorder(combinedStream, {
            mimeType: "video/webm; codecs=vp9,opus",
        });

        chunks = [];

        mediaRecorderRef.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        // when screen sharing is manually stopped
        screenStream.getVideoTracks()[0].onended = () => {
            console.log('Screen sharing manually stopped');
            stopRecording(storage, roomId, setVideoDownloadURLs); // Automatically stop recording and save
        };

        mediaRecorderRef.onstop = () => {
            const blob = new Blob(chunks, { type: "video/webm" });
            saveSegment(blob, storage, roomId, setVideoDownloadURLs); // Save the final segment
            chunks = []; // Clear chunks after saving
        };

        mediaRecorderRef.start(1000); // Collect data every second
        isRecording = true;

        // Save segments every 3 minutes
        intervalRef = setInterval(() => {
            mediaRecorderRef.stop(); // Stop the recording to finalize the segment
            mediaRecorderRef.start(); // Restart to begin a new segment
        }, 180000); // 3 minutes

        stopRecordingCallback(true); // Update recording state
    } catch (error) {
        console.error("Error starting screen recording:", error);
    }
};

export const stopRecording = (storage, roomId, setVideoDownloadURLs) => {
    clearInterval(intervalRef);
    isRecording = false;

    if (mediaRecorderRef) {
        const tracks = mediaRecorderRef.stream.getTracks();
        tracks.forEach(track => track.stop()); // Stop each track of the stream

        mediaRecorderRef.stop(); // Stop the MediaRecorder and save the video
    }
};

const saveSegment = (blob, storage, roomId, setVideoDownloadURLs) => {
    const storageRef = ref(storage, `recordings/segment_${roomId}_${videoCount}.webm`);
    videoCount += 1;

    const uploadTask = uploadBytesResumable(storageRef, blob);
    uploadTask.on(
        "state_changed",
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
        },
        (error) => {
            console.error("Upload failed:", error);
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                console.log("File available at:", url);
                setVideoDownloadURLs((prevURLs) => [...prevURLs, url]);
            });
        }
    );
};

// Call the API without waiting for its response
export const callSimplifyNotesAPI = (notes, roomId, setSimplifiedNotes) => {
    axios.post('http://localhost:5000/api/v1/notes/process_video', { videoUrl: notes, meet_id: roomId })
        .then((response) => {
            console.log('Simplified notes received:', response.data.CurrentNotes);
            setSimplifiedNotes(response.data.CurrentNotes); // Store the response in state
        })
        .catch((error) => {
            console.error('Error while simplifying notes:', error);
        });

    console.log('API call made, waiting for response...');
};

export const handleSwitchChange = (isRecording, storage, roomId, setVideoDownloadURLs, stopRecordingCallback) => {
    if (isRecording) {
        stopRecording(storage, roomId, setVideoDownloadURLs);
        stopRecordingCallback(false); // Update recording state
    } else {
        startRecording(storage, roomId, setVideoDownloadURLs, stopRecordingCallback);
    }
};
