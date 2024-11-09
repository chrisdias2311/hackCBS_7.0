import React, { useContext, useState } from 'react';
import './CreateInstantMeet.css'
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Backdrop, CircularProgress } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../ContextApi/userContex';

const CreateInstantMeet = ({ open, onClose }) => {
    const { currentUser } = useContext(UserContext)
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [titleError, setTitleError] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    //backdrop for loading
    const [backdropOpen, setBackdropOpen] = useState(false)
    const navigate = useNavigate();

   

    //helpetr function
    const getCurrentTime = () => {
        const padZero = (num) => (num < 10 ? `0${num}` : num); // Function to pad single digits with zero

        const now = new Date(); // Get current date and time
        const hours = padZero(now.getHours()); // Get current hours and pad if necessary
        const minutes = padZero(now.getMinutes()); // Get current minutes and pad if necessary

        return `${hours}:${minutes}`; // Concatenate hours and minutes
    };


    const handleCreate = async () => {
        let isValid = true;

        // Reset errors
        setTitleError('');
        setDescriptionError('');

        // Validate title
        if (!title.trim()) {
            setTitleError('Title is required.');
            isValid = false;
        }

        // Validate description
        if (!description.trim()) {
            setDescriptionError('Description is required.');
            isValid = false;
        }

        if (isValid) {
            console.log('Meeting Created:', { title, description });


            console.log('called the create meet');

            setBackdropOpen(true);
            try {

                const createMeetingData = {
                    host_id: currentUser.hostId,
                    title: title,
                    description: description,
                    startTime: getCurrentTime(),
                    host_name: currentUser.userName,
                }
                console.log('createMeetingData:', createMeetingData);



                const response = await axios.post(`https://mood-lens-server.onrender.com/api/v1/meeting/create_meeting`, createMeetingData);

                console.log('response in create meet', response);
                setBackdropOpen(false);
                navigate(`/room/${response.data.meet_id}`);
                onClose(); // Close the dialog after creation

            } catch (error) {
                setBackdropOpen(false);
                console.error('Error creating meeting:', error);
                onClose(); // Close the dialog after creation
            }




        }

    };


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className='create-instant-meet-box' PaperProps={{ style: { borderRadius: '1rem' } }}>

            <DialogTitle className="text-dark fw-bold fs-3">Create Meeting</DialogTitle>

            <DialogContent dividers>
                <div className="form-group">
                    <label htmlFor="meetingTitle">Meeting Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="meetingTitle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter meeting title"
                    />
                    {titleError && <small className="text-danger">{titleError}</small>}
                </div>
                <div className="form-group mt-3">
                    <label htmlFor="meetingDescription">Meeting Description</label>
                    <textarea
                        className="form-control"
                        id="meetingDescription"
                        rows="2"
                        maxLength="50"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter meeting description (max 50 words)"
                    />
                    <small className="form-text text-muted d-block">
                        {description.length}/50 words
                    </small>
                    {descriptionError && <small className="text-danger">{descriptionError}</small>}
                </div>
                <Typography variant="body2" className="text-secondary mt-3 fw-bold">
                    Note: The meeting ID is automatically generated and can be shared with students.
                </Typography>
            </DialogContent>

            <DialogActions className='p-3 create-instant-meet-buttons'>
                <button className="btn btn-outline-secondary" onClick={onClose}>
                    Cancel
                </button>
                <button className="btn btn-primary" onClick={handleCreate}>
                    Create
                </button>
            </DialogActions>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'rgba(0, 0, 0, 0.9)' }}
                open={backdropOpen}
            >
                <CircularProgress color="inherit" />
                <p className='m-0 p-0 fs-4 mx-2'>Creating meet please wait...</p>
            </Backdrop>

        </Dialog>
    )
}

export default CreateInstantMeet