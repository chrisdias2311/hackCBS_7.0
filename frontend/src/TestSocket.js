import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

let socket = io('wss://mood-lens-server.onrender.com', {
    reconnectionAttempts: 5,
    timeout: 10000,
});
// let socket = io('http://localhost:5000');

const TestSocket = () => {
    const [question, setQuestion] = useState([]);
    const [answer, setAnswer] = useState('');
    const test_id = '6719fb40f1230bb78e7c4740';
    const chatContainerRef = useRef(null);
    const videoRef = useRef(null);
    const [apiKey, setApiKey] = useState('sk_bc62db37c6c8fdcc1d4b7b517f0535f3403064f850647760');
    const audioRef = useRef(new Audio());
    const [selectedVoice, setSelectedVoice] = useState('');
    const [stability, setStability] = useState(0.3);
    const [isVoiceLoaded, setIsVoiceLoaded] = useState(false);
    const [availableVoices, setAvailableVoices] = useState([]);
    const [isTestStarted, setIsTestStarted] = useState(false);
    const [startCountdown, setStartCountdown] = useState(10);

    const [isListening, setIsListening] = useState(false);
    const { transcript, listening, resetTranscript } = useSpeechRecognition();

    useEffect(() => {
        if (listening) {
            setAnswer(transcript);
        }
    }, [transcript, listening]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [question]);

    useEffect(() => {
        if (videoRef.current) {
            navigator.mediaDevices.getUserMedia({ video: true })
                .then((stream) => {
                    videoRef.current.srcObject = stream;
                })
                .catch((err) => console.error("Error accessing camera: ", err));
        }
    }, []);

    useEffect(() => {
        if (apiKey) {
            fetchVoices();
        }
    }, [apiKey]);

    const fetchVoices = async () => {
        try {
            const response = await fetch('https://api.elevenlabs.io/v1/voices', {
                headers: {
                    'xi-api-key': apiKey,
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch voices: ${response.status}`);
            }

            const data = await response.json();
            setAvailableVoices(data.voices);

            // Set default voice if Monika's voice is found
            const monikaVoice = data.voices.find(voice =>
                voice.name === 'Monika Sogam - Natural Conversations'
            );
            if (monikaVoice) {
                setSelectedVoice(monikaVoice.voice_id);
                setIsVoiceLoaded(true);
            }
        } catch (err) {
            console.error('Error fetching voices:', err);
            setIsVoiceLoaded(false);
        }
    };

    // Countdown timer effect
    useEffect(() => {
        let timer;
        if (selectedVoice && !isTestStarted && startCountdown > 0) {
            timer = setInterval(() => {
                setStartCountdown(prev => {
                    if (prev <= 1) {
                        setIsTestStarted(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 100000);
        }
        return () => clearInterval(timer);
    }, [selectedVoice, isTestStarted, startCountdown]);


    //socket code
    useEffect(() => {
        console.log('Run socket');
        if (window.location.pathname === '/test-socket' && isTestStarted) {
            socket.emit('start_test', { test_id });

            socket.on('questions', (data) => {


                if (isVoiceLoaded) {
                    handleTextToSpeech(data);
                }
                setQuestion((prevMessages) => [...prevMessages, { type: 'question', text: data }]);

                socket.emit('question_ack', { message: 'Question received' });
                socket.emit('ready_for_next', { message: 'Ready for next question' });
            });

            socket.on('response', (response) => {
                setQuestion((prevMessages) => [...prevMessages, { type: 'question', text: response }]);
                if (isVoiceLoaded) {
                    handleTextToSpeech(response);
                }
            });

            socket.on('error', (errorMessage) => {
                alert(`Error: ${errorMessage}`);
            });
        }

        return () => {
            socket.off('questions');
            socket.off('response');
            socket.off('error');
        };
    }, [isVoiceLoaded, isTestStarted]);

    const handleVoiceChange = (event) => {
        const voiceId = event.target.value;
        setSelectedVoice(voiceId);
        setIsVoiceLoaded(true);
        setStartCountdown(5); // Reset countdown when voice is selected
    };

    const handleTextToSpeech = async (text) => {
        if (!text || !selectedVoice || !isVoiceLoaded) {
            console.error('Missing required data for TTS:', {
                text: !!text,
                selectedVoice: !!selectedVoice,
                isVoiceLoaded
            });
            return;
        }

        try {
            const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
                method: 'POST',
                headers: {
                    'xi-api-key': apiKey,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    voice_settings: {
                        stability,
                        similarity_boost: 0.8,
                    },
                }),
            });

            if (!response.ok) {
                throw new Error(`Text to speech conversion failed: ${response.status}`);
            }

            const audioBlob = await response.blob();
            const url = URL.createObjectURL(audioBlob);

            if (audioRef.current.src) {
                URL.revokeObjectURL(audioRef.current.src);
            }

            audioRef.current.src = url;
            await audioRef.current.play();
        } catch (err) {
            console.error('Error converting text to speech:', err);
        }
    };

    const handleAnswerSubmit = () => {
        if (answer.trim() !== '') {
            setQuestion((prevMessages) => [
                ...prevMessages,
                { type: 'answer', text: answer }
            ]);
            socket.emit('message', { message: answer });
            setAnswer('');
            resetTranscript();
            setIsListening(false);
        } else {
            alert('Please enter an answer before submitting.');
        }
    };

    const handleMicClick = () => {
        if (isListening) {
            SpeechRecognition.stopListening();
            setIsListening(false);
        } else {
            SpeechRecognition.startListening({ continuous: true });
            setIsListening(true);
        }
    };

    return (

        <div className="container mt-4 p-4 rounded shadow-lg bg-light">
            <h2 className="text-center mb-4">Viva Test</h2>

            {/* New Row for Voice Selection and Countdown */}
            <div className="row mb-4">
                <div className="col-md-12 text-center">

                    {/* Voice Selection Dropdown */}
                    <div className="form-group mb-2 w-50 mx-auto">
                        <select
                            className="form-select"
                            value={selectedVoice}
                            onChange={handleVoiceChange}
                            disabled={isTestStarted}
                        >
                            <option value="">Select a voice</option>
                            {availableVoices.map((voice) => (
                                <option key={voice.voice_id} value={voice.voice_id}>
                                    {voice.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Countdown Display */}
                    {selectedVoice && !isTestStarted && (
                        <div className="alert alert-info w-50 mx-auto text-center">
                            Test will start in {startCountdown} seconds...
                        </div>
                    )}
                </div>
            </div>

            <div className="row">

                <div className="col-md-6 d-flex flex-column align-items-center">
                    <img
                        src="/AALE_face.png"
                        alt="AI Female"
                        className="img-fluid mb-3 rounded"
                        style={{ width: 'auto', height: '200px', objectFit: 'cover' }}
                    />

                    <video ref={videoRef} autoPlay muted className="w-75" style={{ height: 'auto', objectFit: 'cover' }} />
                </div>

                <div className="col-md-6">
                    <div className="chat-box overflow-auto p-3 mb-3 border rounded" style={{ height: '450px', minHeight: "400px" }} ref={chatContainerRef}>
                        {question.map((msg, index) => (
                            <div
                                key={index}
                                className={`chat-message p-2 mb-2 rounded ${msg.type === 'question' ? 'bg-primary text-white' : 'bg-success text-white'}`}
                            >
                                <p className="m-0">
                                    <strong>{msg.type === 'question' ? 'Question' : 'Your Answer'}:</strong> {msg.text}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="input-container d-flex">
                        <textarea
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            placeholder="Type your answer here"
                            className="form-control me-2"
                            onPaste={(e) => e.preventDefault()}
                            disabled={isListening || !isTestStarted}
                            rows={3}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAnswerSubmit();
                                }
                            }}
                        />
                        <button
                            className="btn btn-primary me-2"
                            onClick={handleAnswerSubmit}
                            disabled={isListening || !isTestStarted}
                        >
                            <SendIcon />
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleMicClick}
                            disabled={!isTestStarted}
                        >
                            <MicIcon />
                        </button>
                    </div>
                </div>

            </div>
        </div>

    );
};

export default TestSocket;