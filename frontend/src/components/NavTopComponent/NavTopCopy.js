import React from 'react'

const NavTopCopy = () => {
    return (
        <div className="navbar-top-main-box">
            <AppBar position="static" sx={{ backgroundColor: '#F1F8F8', boxShadow: 2 }}  >
                <Container maxWidth="xxl">

                    <Toolbar disableGutters>

                        {/* <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} /> */}

                        <Typography
                            variant="h6"
                            noWrap
                            component="a"
                            sx={{
                                mr: 2,
                                display: { xs: 'none', md: 'flex' },
                                fontFamily: 'Lexend',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'black',
                                textDecoration: 'none',
                                flexGrow: 1,
                                alignItems: 'center', // Center the logo vertically
                            }}
                        >
                            {logo ? (<img src={logo} alt="Logo" className='moodlens-logo' />) : 'LOGO'}
                        </Typography>

                        {/* <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} /> */}

                        <Typography
                            variant="h5"
                            noWrap
                            component="a"
                            href="#app-bar-with-responsive-menu"
                            sx={{
                                mr: 2,
                                display: { xs: 'flex', md: 'none' },
                                flexGrow: 1,
                                fontFamily: 'Lexend',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'black',
                                textDecoration: 'none',
                            }}
                        >
                            LOGO
                        </Typography>

                        <div className="meeting-creat-join-btn me-3 p-2 d-flex align-items-center">

                            <button
                                type="button"
                                className={`${currentUser.role === 'teacher' ? '' : 'd-none'} btn btn-primary me-3 create-meet`}
                                onClick={() => navigate('/dashboard/create-meet')}>
                                Create meet
                            </button>

                            <button
                                type="button"
                                className="btn btn btn-outline-secondary join-meet"
                                onClick={() => navigate('/dashboard/join-meet')}
                            >
                                Join meet
                            </button>

                            <button
                                type="button"
                                className="btn  join-meet-notification ms-3"
                            >
                                <i className="bi bi-bell"></i>
                            </button>
                            <p className='user-name-navbar m-0 p-0 ms-3'>Hey, {currentUser?.userName || 'username'}</p>


                        </div>

                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt={`${userInitial || "Remy Sharp"}`} src="/static/images/avatar/2.jpg" />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map((setting) => (
                                    <MenuItem key={setting} onClick={() => handleCloseUserMenu(setting)} >
                                        <Typography textAlign="center">{setting}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>

                    </Toolbar>
                </Container>
            </AppBar>
        </div >
    )
}

export default NavTopCopy