
import React, { useContext, useState } from 'react';
import './JoinMeet.css'
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Backdrop, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../ContextApi/userContex';

const JoinMeet = ({ open, onClose }) => {
	const { currentUser } = useContext(UserContext)
	const [meetCode, setMeetCode] = useState('');
	const [meetLink, setMeetLink] = useState('');
	const [meetCodeError, setMeetCodeError] = useState('');
	const [meetLinkError, setMeetLinkError] = useState('');
	//backdrop for loading
	const [backdropOpen, setBackdropOpen] = useState(false)
	const navigate = useNavigate();



	const handelJoinMeet = async () => {
		console.log('Join Meet:', { meetCode, meetLink });

		let isValid = true;

		// Reset errors
		setMeetCodeError('');
		setMeetLinkError('');

		// Validate code
		if (!meetCode.trim() && !meetLink.trim()) {
			setMeetCodeError('Any one field is required.');
			isValid = false;
		}

		//joining the meet through link
		if (meetLink.includes('/room/')) {
			setBackdropOpen(true);
			const meetId = meetLink.split('/room/')[1]; // Extract digits after '/room/'
			try {
				const response = await axios.post(`https://mood-lens-server.onrender.com/api/v1/meeting/join_meeting`, {
					meet_id: parseInt(meetId)
				});
				console.log('Join meet form submitted successfully:', response);
				if (response?.data.success) {
					await new Promise(resolve => setTimeout(resolve, 2000));
					setBackdropOpen(false);
					navigate(`/room/${meetId}`);

				} else {
					setBackdropOpen(false);
				}
			} catch (error) {
				console.log('Join meet form submitted error:', error);
				setBackdropOpen(false);
			}
			return;
		}

		//joining the meet through code
		if (isValid) {
			console.log('Meeting Joining:', { meetCode, meetLink });
			setBackdropOpen(true);
			try {
				const response = await axios.post(`https://mood-lens-server.onrender.com/api/v1/meeting/join_meeting`,
					{
						meet_id: parseInt(meetCode)
					});
				console.log('Join meet form submitted successfully:', response);
				if (response?.data.success) {
					setBackdropOpen(false);
					navigate(`/room/${meetCode}`)

				} else {
					setBackdropOpen(false);

				}



			}
			catch (error) {
				console.log('Join meet form submitted error:', error);
				setBackdropOpen(false);

			}
		}


	}

	return (
		<Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className='join-instant-meet-box' PaperProps={{ style: { borderRadius: '1rem' } }}>

			<DialogTitle className="text-dark fw-bold fs-3">Join a lecture</DialogTitle>

			<DialogContent dividers>
				<div className="form-group">
					<label htmlFor="meetingTitle">Meeting Code</label>
					<input
						type="text"
						className="form-control"
						id="meetingCode"
						value={meetCode}
						onChange={(e) => setMeetCode(e.target.value)}
						placeholder="Enter meeting Code"
					/>
					{meetCodeError && <small className="text-danger">{meetCodeError}</small>}
				</div>

				<div className="d-flex align-items-center my-3">
					<hr className="flex-grow-1" />
					<Typography variant="body2" className="mx-2">OR</Typography>
					<hr className="flex-grow-1" />
				</div>


				<div className="form-group">
					<label htmlFor="meetingLink">Meeting Link</label>
					<input
						type="text"
						className="form-control"
						id="meetingLink"
						value={meetLink}
						onChange={(e) => setMeetLink(e.target.value)}
						placeholder="Enter meeting Link"
					/>
					{meetLinkError && <small className="text-danger">{meetLinkError}</small>}
				</div>
			</DialogContent>

			<DialogActions className='p-3 create-instant-meet-buttons'>
				<button className="btn btn-outline-secondary" onClick={onClose}>
					Cancel
				</button>
				<button className="btn btn-primary" onClick={handelJoinMeet}>
					Join
				</button>
			</DialogActions>

			<Backdrop
				sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
				open={backdropOpen}
			>
				<CircularProgress color="inherit" />
				<p className='m-0 p-0 fs-4 mx-2'>Joining Meet please wait...</p>
			</Backdrop>

		</Dialog>
	)
}

export default JoinMeet