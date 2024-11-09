import axios from 'axios';
import {
    deleteObject, getDownloadURL, listAll,
    ref, uploadString
} from 'firebase/storage';
import { set, ref as dbref, get } from 'firebase/database';
import db, { storage } from '../firbaseConfig';

// Helper function to get current time for students
export const getCurrentTimeStudent = () => {
    const padZero = (num) => (num < 10 ? `0${num}` : num);
    const now = new Date();
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());
    const seconds = padZero(now.getSeconds());

    return `${hours}:${minutes}:${seconds}`; // Concatenate hours, minutes, and seconds
};

// Helper function to get current time for teachers
export const getCurrentTimeTeacher = () => {
    const padZero = (num) => (num < 10 ? `0${num}` : num);
    const now = new Date();
    const hours = padZero(now.getHours());
    const minutes = padZero(now.getMinutes());

    return `${hours}:${minutes}`; // Concatenate hours and minutes
};

// Function to capture image for students
export const captureImage = async (currentUser, roomId,
    setImageData, isCapturing) => {

    if (!isCapturing && currentUser.role === 'teacher') return;

    // Access the camera stream
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });

    // Create a video element to capture the stream
    const videoElement = document.createElement('video');
    videoElement.srcObject = stream;
    videoElement.play();

    // Wait for the video to load and play
    await new Promise(resolve => videoElement.addEventListener('playing', resolve));

    // Create a canvas element to capture a frame from the video
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert the captured frame to a data URL
    const imageDataURL = canvas.toDataURL('image/png');
    stream.getTracks().forEach(track => track.stop()); // Stop the camera after capturing

    try {
        if (!imageDataURL) {
            console.log('No image data URL found');
            return;
        }

        const studentImagePath = `InCallstudentsImage/${currentUser.pid}`;
        const timestamp = getCurrentTimeStudent();
        const imageName = `${currentUser.pid}_${timestamp}.jpg`;

        const imageRef = ref(storage, `${studentImagePath}/${imageName}`);
        await uploadString(imageRef, imageDataURL, 'data_url');
        const downloadURL = await getDownloadURL(imageRef);

        const roomDbPath = `Rooms/${roomId}`;
        await set(dbref(db, `${roomDbPath}/${currentUser.userName}`), {
            studentPID: currentUser.pid,
            imageUrl: downloadURL,
        });

        setImageData(prevImageData => [
            ...prevImageData,
            { studentPID: currentUser.pid, imageUrl: downloadURL }
        ]);

        console.log('Image uploaded successfully:', downloadURL);
    } catch (error) {
        console.error('Error uploading image:', error);
    }
};

// Function to detect emotion for teachers
export const emotionDetect = async (
    currentUser, roomId,
    setTextEmotions, setVideoEmotions,
    setAudioEmotions, setOverAllEmotions, setStudentLiveEmotions) => {
    try {
        const roomImagesRef = dbref(db, `Rooms/${roomId}`);
        const roomImagesSnapshot = await get(roomImagesRef);
        const imageUrls = [];

        roomImagesSnapshot.forEach((childSnapshot) => {
            const studentPID = childSnapshot.val().studentPID;
            const imageUrl = childSnapshot.val().imageUrl;
            imageUrls.push({ studentPID: studentPID, imageUrl: imageUrl });
        });

        const response = await axios.post('https://mood-lens-server.onrender.com/api/v1/video/video_to_emotion', {
            meet_id: parseInt(roomId),
            host_id: currentUser.hostId,
            time_stamp: getCurrentTimeTeacher(),
            imgUrls: imageUrls
        });

        const { text_emotions, video_emotions, audio_emotions } = response?.data.updatedMeetReports;
        const { overallEmotions, studentLiveEmotions } = response?.data;

        setTextEmotions(text_emotions[0]);
        setVideoEmotions(video_emotions[0]);
        setAudioEmotions(audio_emotions[0]);
        setOverAllEmotions(overallEmotions);
        setStudentLiveEmotions(studentLiveEmotions);

        console.log('Response from emotion API:', response.data);
    } catch (error) {
        console.error('Error in emotion detection API call:', error);
    }
};

//function of text emotion detection
export const textEmotion = async (dataText, roomId, currentUser) => {

    try {
        const response = await axios.post('https://mood-lens-server.onrender.com/api/v1/text/text_to_emotion', {
            meet_id: parseInt(roomId),
            host_id: currentUser.hostId,
            time_stamp: getCurrentTimeTeacher(),
            username: dataText.fromUser.userName,
            message: dataText.message
        });

        console.log('Response from text emotion API:', response);

    } catch (error) {
        console.error('Error in audio emotion detection:', error);
    }
}

//function of audio emotion detection
export const audioEmotion = async (roomId, currentUser, firebaseAudioUrl) => {
    console.log('firebaseAudioUrl:', firebaseAudioUrl);

    try {
        const response = await axios.post('https://mood-lens-server.onrender.com/api/v1/audio/audio_to_emotion', {
            meet_id: parseInt(roomId),
            host_id: currentUser.pid,
            studentPID: currentUser.pid,
            audio_url: firebaseAudioUrl,
            time_stamp: getCurrentTimeStudent(),
        });
        console.log('Response from audio emotion API:', response);
    } catch (error) {
        console.error('Error in audio emotion detection:', error);
    }
};