import axios from 'axios';
import { audioEmotion, getCurrentTimeStudent } from './roomApiCalls';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firbaseConfig';

// Function to start audio recording
export const startListening = async (mediaAudioRecorderRef, audioChunksRef, mediaStreamRef, setAudioList, roomId, currentUser) => {

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;
    mediaAudioRecorderRef.current = new MediaRecorder(stream);

    mediaAudioRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
    };

    mediaAudioRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioList((prev) => [...prev, { url: audioUrl, blob: audioBlob }]);

        // Generate a timestamp for the audio filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const storagePath = `IncallAudio/${roomId}/${currentUser.pid}/audio_${timestamp}.wav`;
        const storageRef = ref(storage, storagePath);

        // Upload the audio blob to Firebase Storage
        await uploadBytes(storageRef, audioBlob);
        const firebaseAudioUrl = await getDownloadURL(storageRef);

        // Call the audioEmotion API with the Firebase audio URL
        audioEmotion(roomId, currentUser, firebaseAudioUrl);

        audioChunksRef.current = []; // Reset for next recording
    };

    mediaAudioRecorderRef.current.start();
};

// Function to stop audio recording
export const stopListening = (mediaAudioRecorderRef, mediaStreamRef) => {
    mediaAudioRecorderRef.current.stop();
    mediaStreamRef.current.getTracks().forEach((track) => track.stop());

};


