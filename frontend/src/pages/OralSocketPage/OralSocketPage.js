// App.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Send, Repeat } from 'lucide-react';
import './OralSocketPage.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { io } from 'socket.io-client';
import { set } from 'firebase/database';

// let socket = io('wss://mood-lens-server.onrender.com', {
//     reconnectionAttempts: 5,
//     timeout: 10000,
// });
let socket = io('http://localhost:5000');

const OralSocketPage = () => {

	const [isAISpeaking, setIsAISpeaking] = useState(true);


	const [question, setQuestion] = useState([]);
	const [answer, setAnswer] = useState('');
	const test_id = '672f9768d34042ad5ab97c84';
	const chatContainerRef = useRef(null);
	const [apiKey, setApiKey] = useState('sk_bc62db37c6c8fdcc1d4b7b517f0535f3403064f850647760');
	const audioRef = useRef(new Audio());
	const [selectedVoice, setSelectedVoice] = useState('');
	const [stability, setStability] = useState(0.3);
	const [isVoiceLoaded, setIsVoiceLoaded] = useState(false);
	const [availableVoices, setAvailableVoices] = useState([]);
	const [isVoiceSelected, setIsVoiceSelected] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	//react text to speech
	const [isListening, setIsListening] = useState(false);
	const { transcript, listening, resetTranscript } = useSpeechRecognition();



	const videoRef = useRef(null);

	// Access webcam on component mount
	useEffect(() => {
		const startVideo = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: true,
					audio: true
				});

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
				}
			} catch (err) {
				console.error("Error accessing webcam:", err);
			}
		};

		startVideo();

		// Cleanup function to stop all tracks when component unmounts
		return () => {
			if (videoRef.current && videoRef.current.srcObject) {
				const tracks = videoRef.current.srcObject.getTracks();
				tracks.forEach(track => track.stop());
			}
		};
	}, []);

	//Voices loade here
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

	//socket
	useEffect(() => {
		console.log('Run socket');
		if (window.location.pathname === '/test-socket-new' && isVoiceLoaded) {

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
	}, [isVoiceLoaded]);

	//audio to text
	useEffect(() => {
		if (listening) {
			setAnswer(transcript);
		}
	}, [transcript, listening]);

	//function to help
	const handleVoiceChange = (event) => {
		const voiceId = event.target.value;
		setSelectedVoice(voiceId);
		setIsVoiceLoaded(true);
	};

	const handleTextToSpeech = async (text) => {
		if (!text || !isVoiceLoaded) {
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
			setIsAISpeaking(true);
			await audioRef.current.play();
		} catch (err) {
			console.error('Error converting text to speech:', err);
		}
	};

	const handleAnswerSubmit = async () => {
		if (answer.trim() !== '') {
			setIsSubmitted(true);
			setQuestion((prevMessages) => [
				...prevMessages,
				{ type: 'answer', text: answer }
			]);
			socket.emit('message', { message: answer });
			resetTranscript();
			setIsListening(false);


			await new Promise(resolve => setTimeout(resolve, 4000));
			setIsSubmitted(false);
			setAnswer('');


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
			setIsAISpeaking(false);
		}
	};

	return (
		<div className="min-vh-100 bg-light p-4">
			<div className="container">

				<div className="card mx-auto main-container">
					{/* Header */}
					<div className="card-header bg-primary text-white d-flex justify-content-between">
						<h1 className="h5 mb-0">AI Oral Examination</h1>
						<div className="voice-selector" style={{ width: '200px' }}>
							<select
								className="form-select form-select-sm"
								onChange={handleVoiceChange}
								value={selectedVoice}
								disabled={isVoiceSelected}
							>
								<option value="">Select AI Voice</option>
								{availableVoices.map((voice) => (
									<option key={voice.voice_id} value={voice.voice_id}>
										{voice.name}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Main Content */}
					<div className="card-body">

						{/* Video/Avatar Section */}
						<div className="row mb-4">
							{/* AI Avatar */}
							<div className="col-md-6 text-center">
								<div className={`avatar-container mx-auto mb-3 ${isAISpeaking ? 'ai-speaking' : ''}`}>
									<img
										// src="https://via.placeholder.com/600"
										src="/AALE_face.png"
										alt="AI Avatar"
										className="img-fluid rounded ai-female"

									/>
								</div>
								{/* AI Speech Text */}
								<div className="position-relative">
									<button
										className="btn btn-light repeat-btn shadow-sm"
										onClick={() => setIsAISpeaking(true)}
									>
										<Repeat size={16} onClick={() => {
											handleTextToSpeech(question[question.length - 1].text);
										}} />

									</button>

									<div className="speech-box border bg-light p-3 rounded">
										<p className="mb-0 fw-bold">
											{question.length > 0 && question[question.length - 1].type === 'question' ? question[question.length - 1].text : "Waiting for the next question..."}
										</p>
									</div>
								</div>
							</div>

							{/* Student Video */}
							<div className="col-md-6 text-center">
								<div className={`video-container mx-auto mb-3 ${isListening ? 'student-speaking' : ''}`}>
									<video
										ref={videoRef}
										autoPlay
										playsInline
										muted // Muted to prevent feedback, remove if you want to hear audio
										className="w-100 h-100 bg-dark rounded"
										style={{ objectFit: 'cover' }}
									/>
								</div>
								{isSubmitted && (
									<div className="answer-box border bg-primary p-3 rounded">
										<p className="mb-0 fw-bold text-white">
											{answer.trim() !== '' ? answer : "your answer here..."}
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Answer Section */}
						<div className="border-top pt-4">

							<div className="mb-3">
								<textarea
									value={answer}
									className="form-control"
									placeholder="Type your answer here..."
									rows="3"
									onChange={(e) => setAnswer(e.target.value)}
									disabled={isListening}
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											handleAnswerSubmit();
										}
									}}
								/>
							</div>

							{/* Controls */}
							<div className="d-flex justify-content-between align-items-center">

								<div className="d-flex gap-3">
									<button
										className={`btn border btn-icon-oral ${isListening ? 'btn-danger' : 'btn-secondary'}`}
										onClick={() => {
											handleMicClick();
											setIsListening(!isListening);
											setIsAISpeaking(false);
										}}
									>
										{isListening ? <MicOff size={20} /> : <Mic size={20} />}
									</button>
									<button className="btn btn-primary d-flex align-items-center gap-2"
										onClick={handleAnswerSubmit}>
										<Send size={20} />
										Submit Answer
									</button>
								</div>

								<div className="d-flex gap-3">
									<button className="btn btn-secondary"
										onClick={handleAnswerSubmit}>
										Next Question
									</button>
									<button className="btn btn-danger">
										End Exam
									</button>
								</div>
							</div>

						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OralSocketPage;