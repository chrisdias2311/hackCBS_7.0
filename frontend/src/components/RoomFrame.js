import { useRef, useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './Room.css'
import ChrisViewAnalytics from './ChrisViewAnalytics/ChrisViewAnalytics';
import { UserContext } from '../ContextApi/userContex';
import { emotionsContext } from '../ContextApi/emotionsContext';

//firebase Imports for recording
import db, { storage } from '../firbaseConfig';
import { deleteObject, getDownloadURL, listAll, ref, uploadBytesResumable } from 'firebase/storage';

import { useQuery, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { startListening, stopListening } from '../RoomFunction/audioRecorder';
import { captureImage, emotionDetect, getCurrentTimeTeacher, textEmotion } from '../RoomFunction/roomApiCalls';
import { deleteStudentImage } from '../RoomFunction/deleteStudentImage';


const queryClient = new QueryClient();


const RoomFrame = () => {

    const { roomId } = useParams();
    const [imageData, setImageData] = useState([]);
    const [isCapturing, setIsCapturing] = useState(false);
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();
    const { setTextEmotions, setVideoEmotions, setAudioEmotions, setOverAllEmotions, setStudentLiveEmotions } = useContext(emotionsContext);
    const [isProcessing, setIsProcessing] = useState(false); // To handle loading state
    const [displayHelperButton, setDisplayHelperButton] = useState(false);

    //==================testing tanstack query====================
    const { data } = useQuery({
        queryKey: ['continuousProcess', roomId, currentUser.role],
        queryFn: async () => {
            if (currentUser.role === 'teacher') {

                await emotionDetect(currentUser, roomId,
                    setTextEmotions, setVideoEmotions, setAudioEmotions,
                    setOverAllEmotions, setStudentLiveEmotions);

                return { status: 'emotionDetect completed' };
            } else if (currentUser.role === 'student') {
                await captureImage(currentUser, roomId,
                    setImageData, isCapturing);
                return { status: 'captureImage completed' };
            }
            return { status: 'no action taken' }; // Handle the case where neither role matches
        },
        refetchInterval: currentUser.role === 'teacher' ? 10000 : 5000, // Interval based on role
        refetchIntervalInBackground: true,
        enabled: isProcessing, // Only run when processing is active
        onSuccess: () => {
            console.log('Process completed successfully.');
        },
        onError: (error) => {
            console.error('Process failed:', error);
        },
        onSettled: () => {
            console.log('Query has settled (either succeeded or failed).');
        },
    });
    //==================testing tanstack query====================

    //<===================audio emotion start===================>
    const [isListening, setIsListening] = useState(true);
    const [audioList, setAudioList] = useState([]);
    const mediaAudioRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const mediaStreamRef = useRef(null);

    //audio button click event
    useEffect(() => {

        const handleClick = (event) => {

            if (currentUser.role === 'teacher') return; // Only for students

            if (event.target.classList.contains('QYvze2FiFrLlotTk5Iz7' || 'h2M8QwerO1XmsfrZlpv6')) {
                console.log('Clicked on the audio button');
                setIsListening(prevIsListening => !prevIsListening);
                console.log('Audio listening:', isListening);
                if (isListening) {
                    startListening(mediaAudioRecorderRef, audioChunksRef, mediaStreamRef, setAudioList, roomId, currentUser);
                } else {
                    stopListening(mediaAudioRecorderRef, mediaStreamRef);
                }
            }

        };

        // Add event listener to document for click events
        document.addEventListener('click', handleClick);

        // Cleanup function to remove event listener when component unmounts
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, [isListening]);

    console.log('Audio list:', audioList);
    //<===================audio emotion end===================>

    //<===================Video recording code test===============================>

    const [isRecording, setIsRecording] = useState(false);
    const [videoDownloadURLs, setVideoDownloadURLs] = useState([]);
    const mediaRecorderRef = useRef(null);
    const chunks = useRef([]);
    const intervalRef = useRef(null);
    const videoCount = useRef(0);
    const [simplifiedNotes, setSimplifiedNotes] = useState(null);

    // Start recording
    const startRecording = async () => {
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

            mediaRecorderRef.current = new MediaRecorder(combinedStream, {
                mimeType: "video/webm; codecs=vp9,opus",
            });
            chunks.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.current.push(event.data);
                }
            };

            // when screen sharing is manually stopped
            screenStream.getVideoTracks()[0].onended = () => {
                console.log('Screen sharing manually stopped');
                stopRecording(); // Automatically stop recording and save
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks.current, { type: "video/webm" });
                saveSegment(blob); // Save the final segment
                chunks.current = []; // Clear chunks after saving
            };

            mediaRecorderRef.current.start(1000); // Collect data every second
            setIsRecording(true);

            // Save segments 
            intervalRef.current = setInterval(() => {
                mediaRecorderRef.current.stop(); // Stop the recording to finalize the segment
                mediaRecorderRef.current.start(); // Restart to begin a new segment
            }, 180000); // 3 minutes
        } catch (error) {
            console.error("Error starting screen recording:", error);
        }
    };

    // Stop recording
    const stopRecording = () => {
        clearInterval(intervalRef.current);
        setIsRecording(false);
        // Stop all tracks of the screen stream
        if (mediaRecorderRef.current) {
            const tracks = mediaRecorderRef.current.stream.getTracks();
            tracks.forEach(track => track.stop()); // Stop each track of the stream

            mediaRecorderRef.current.stop(); // Stop the MediaRecorder and save the video
        }
    };


    const callSimplifyNotesAPI = (notes) => {
        // Call the API without waiting for its response
        axios.post('http://localhost:5000/api/v1/notes/process_video', { videoUrl: notes, meet_id: roomId })
            .then((response) => {
                console.log('Simplified notes received:', response.data.CurrentNotes);
                setSimplifiedNotes(response.data.CurrentNotes); // Store the response in state
            })
            .catch((error) => {
                console.error('Error while simplifying notes:', error);
            });

        // Proceed without waiting for the response
        console.log('API call made, waiting for response...');
    };

    // Save video/audio segment to Firebase
    const saveSegment = (blob) => {
        const storageRef = ref(storage, `recordings/segment_${roomId}_${videoCount.current}.webm`);
        videoCount.current += 1;

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
                    // callSimplifyNotesAPI(url);
                    setVideoDownloadURLs((prevURLs) => [...prevURLs, url]);
                });
            }
        );
    };

    // Handle switch toggle
    const handleSwitchChange = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    // <===================Video recording code test end==============================>

    //Meeting UI Code
    const meetingUI = async (element) => {
        const appID = 793490608;
        const serverSecret = '4a6b14f6b8b5ecd2cc72d4b190b010dd';
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
            appID,
            serverSecret,
            roomId,
            uuidv4(),
            `${currentUser.userName || "Your Name"}`
        );
        if (!appID || !serverSecret) {
            alert('Zego app ID or server secret is missing from environment variables.');
        }

        const ui = ZegoUIKitPrebuilt.create(kitToken);


        //end the meet api call
        const endMeetingCall = async () => {

            try {
                const response = await axios.post('https://mood-lens-server.onrender.com/api/v1/meeting/end_meeting', {
                    meet_id: parseInt(roomId),
                    endTime: getCurrentTimeTeacher(),
                });
                console.log('Response from end meeting API:', response);

                const folderPath = `InCallstudentsImage/${currentUser.pid}`; // Path to the folder in Firebase Storage
                const folderRef = ref(storage, folderPath);

                try {
                    // List all items in the folder
                    const listResult = await listAll(folderRef);

                    // Delete each file in the folder
                    const deletePromises = listResult.items.map((item) => {
                        return deleteObject(item);
                    });

                    await Promise.all(deletePromises); // Wait for all deletions to complete

                    console.log(`All files in folder ${folderPath} deleted successfully.`);
                } catch (error) {
                    console.error("Error deleting files from Firebase:", error);
                }

            } catch (error) {
                console.error('Error in ending meeting:', error);
            }
        }


        ui.joinRoom({
            container: element,
            sharedLinks: [
                {
                    name: 'Copy link',
                    url: `${window.location.protocol}//${window.location.host}${window.location.pathname}`,
                },
            ],
            scenario: {
                mode: ZegoUIKitPrebuilt.VideoConference,
            },
            turnOnMicrophoneWhenJoining: false,

            onJoinRoom: () => {
                // setIsCapturing(true);
                setIsProcessing(true);
                setDisplayHelperButton(true);
                console.log('Joined the roommm');
            },


            onLeaveRoom: () => {
                setIsProcessing(false);
                setDisplayHelperButton(false);
                console.log('room leave....');

            },

            onInRoomMessageReceived: (data) => {
                console.log('In room message in text:', data);
                if (currentUser.role !== 'teacher') return;
                textEmotion(data, roomId, currentUser);


            },
            onReturnToHomeScreenClicked: () => {
                setIsCapturing(false);
                setIsProcessing(false);
                currentUser.role === 'teacher' ? endMeetingCall() : deleteStudentImage(roomId, currentUser.pid);
                navigate('/dashboard/home');
            },



        });
    };


    return (
        <>
            <div className="analytic-btn-modal" style={{ display: currentUser.role === 'teacher' && displayHelperButton ? 'block' : 'none' }}>

                <ChrisViewAnalytics />

            </div>

            <div className={`${currentUser.role === 'teacher' && displayHelperButton ? 'd-block' : 'd-none'}  button-record-box`}>
                <button className={`btn ${isRecording ? 'recording' : ''}`} onClick={handleSwitchChange}>
                    <i className="bi bi-filetype-ai fs-4" style={{ color: 'white' }}></i>
                    <span className="take-notes-text text-white p-0 m-0 fw-bold"> {isRecording ? 'Stop Recording' : 'Take Notes'}</span>
                </button>
            </div>

            <div className="mainFrame" ref={meetingUI} style={{ width: '100vw', height: '100vh' }} >

            </div>

        </>
    );

};

const RoomFrameTanStack = () => (
    <QueryClientProvider client={queryClient}>
        <RoomFrame />
    </QueryClientProvider>
);

export default RoomFrameTanStack;