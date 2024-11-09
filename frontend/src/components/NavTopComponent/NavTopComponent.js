import * as React from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import './NavTopComponent.css';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../ContextApi/userContex';
import logo from '../../assets/moodlens_logo1.PNG'
import { Bell, Plus, Search } from 'lucide-react';
import { useEffect } from 'react';
import { useState } from 'react';
import CreateInstantMeet from '../CreateInstantMeet/CreateInstantMeet';
import JoinMeet from '../JoinMeet/JoinMeet';


const NavTopComponent = () => {
  const { currentUser, setCurrentUser } = React.useContext(UserContext);
  const userInitial = currentUser.userName ? currentUser.userName.charAt(0).toUpperCase() : '';
  const [avatarUrl, setAvatarUrl] = useState('');
  const navigate = useNavigate();


  const [createMeetAnchorEl, setCreateMeetAnchorEl] = useState(null);
  const [openInstantMeetDialog, setOpenInstantMeetDialog] = useState(false);
  const [openJoinMeetDialog, setOpenJoinMeetDialog] = useState(false);

  const handleCreateMeetClick = (event) => {
    setCreateMeetAnchorEl(event.currentTarget);
  };

  const handleCreateMeetClose = () => {
    setCreateMeetAnchorEl(null);
  };

  const handleInstantMeetOpenDialog = () => {
    setOpenInstantMeetDialog(true);
    handleCreateMeetClose();
  }

  const handleInstantMeetCloseDialog = () => {
    setOpenInstantMeetDialog(false);
  };

  const handleJoinMeetClick = () => {
    console.log('Join Meet clicked');
    setOpenJoinMeetDialog(true);

  }

  const handleJoinMeetClose = () => {
    setOpenJoinMeetDialog(false);
  }

  useEffect(() => {
    const gender = Math.random() > 0.5 ? 'men' : 'women'; // Randomly choose gender
    const id = Math.floor(Math.random() * 100); // Random ID between 0-99
    setAvatarUrl(`https://randomuser.me/api/portraits/${gender}/${id}.jpg`);
  }, []);

  return (
    <nav className="navbar navbar-top-box navbar-expand-lg bg-white border-bottom px-4 py-3 mb-4">
      <div className="container-fluid bg-white m-0 p-0">

        {/* Search Bar */}
        <div className="search-wrapper position-relative flex-grow-1 me-4">
          <Search className="search-icon position-absolute text-muted" size={20} />
          <input
            type="text"
            className="form-control form-control-lg bg-light border-0 ps-5"
            placeholder="Search"
          />
        </div>

        {/* Right Side Icons */}
        <div className="d-flex align-items-center gap-3">

          {/* New Meet Button */}
          <div className="d-flex gap-2">
            {/* Conditionally render Create Meet button if user is a teacher */}
            {currentUser.role === 'teacher' && (
              <button
                className="btn btn-create-meet px-3 d-flex align-items-center gap-1"
                onClick={handleCreateMeetClick}
              >
                <Plus size={20} />
                <span>Create Meet</span>
              </button>
            )}

            {/* Join Meet button */}
            <button
              className="btn btn-outline-secondary btn-join-meet px-3 "
              onClick={handleJoinMeetClick}
            >
              Join Meet
            </button>
          </div>




          {/* Material UI Menu for Dropdown */}
          <Menu

            anchorEl={createMeetAnchorEl}
            open={Boolean(createMeetAnchorEl)}
            onClose={handleCreateMeetClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleInstantMeetOpenDialog}>Start an Instant Meet</MenuItem>
            <MenuItem onClick={handleCreateMeetClose}>Schedule a Meet</MenuItem>
          </Menu>

          {/* Create meet dialoug */}
          <CreateInstantMeet open={openInstantMeetDialog} onClose={handleInstantMeetCloseDialog} />

          {/* Join meet dialoug */}
          <JoinMeet open={openJoinMeetDialog} onClose={handleJoinMeetClose} />

          {/* Notification Button */}
          <button className="btn  btn-notify">
            <Bell size={20} />
          </button>

          {/* Profile Picture */}

          <div className="d-flex align-items-center gap-2">

            <span className="text-dark fw-bold">Hey, {currentUser.userName}</span>


            <button className="btn btn-icon">
              <div className="avatar">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="rounded-circle"
                  width={32}
                  height={32}
                />
              </div>
            </button>
          </div>


        </div>
      </div>
    </nav>
  );
}

export default NavTopComponent