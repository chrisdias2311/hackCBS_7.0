import React, { useContext, useEffect, useRef, useState } from 'react'
// import GoogleIcon from '@mui/icons-material/Google';
import { Button, CircularProgress } from '@mui/material';
import './AuthPage.css';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserContext } from '../../ContextApi/userContex';
import GoogleButton from 'react-google-button'
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from '../../firbaseConfig';
import TypewriterAnimation from '../../components/TypewriterAnimation/TypewriterAnimation';
import LoginImageVerify from '../../components/LoginImageVerify';

//alerts material ui
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { set } from 'firebase/database';
import { virtualContext } from '../../ContextApi/virtualContex';



const Login = () => {

  const { setCurrentUser } = useContext(UserContext);
  const { loginVirtualType, virtualShowForm,
    setVirtualShowForm, setLoginVirtualType,
    studentVirtualName, setStudentVirtualName,
    openImageCapture, setOpenImageCapture,
    captureStatus, setCaptureStatus, loginButtonRef
  } = useContext(virtualContext);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();


  const [loginImage, setLoginImage] = useState('');
  const [loginMethod, setLoginMethod] = useState('image'); // Default to password login
  const [loginType, setLoginType] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isImageCaptured, setIsImageCaptured] = useState(false);


  //identify the user
  // const [loginType, setLoginType] = useState('');
  // const [showForm, setShowForm] = useState(false);


  //loding state
  const [loading, setLoading] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, severity: 'info', message: '' });

  //field input state
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    username: '',
    password: '',
  });


  //close snackbar
  const handleCloseSnackBar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarInfo({ ...snackbarInfo, open: false });
  };

  const handleLoginType = (type) => {
    setLoginType(type);
    setShowForm(true);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Reset the error message when the user starts typing again
    setErrors({
      ...errors,
      [name]: '',
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Perform validation onBlur
    if (!value) {
      setErrors({
        ...errors,
        [name]: `${name.charAt(0).toUpperCase() + name.slice(1)} is required`,
      });
    }
  };

  //handle toggle button
  const handleRadioChange = (e) => {
    const { value } = e.target;
    setLoginMethod(value);
  };;

  const studentLoginUser = async (e) => {
    setLoading(true);
    e.preventDefault();
    let newErrors = {};

    if (!formData.username) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password && loginMethod === 'password') {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    // If any field is empty, show alert and return
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Fill the form correctly.', open: true });
      return;
    }

    try {
      console.log(`${process.env.REACT_APP_DEPLOY_URL} APP URL`);
      let response;

      if (loginMethod === 'image') {

        if (!isImageCaptured) {
          setLoading(false);
          setCaptureStatus(false);
          setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Unable to Capture image for face ID', open: true });
          return;
        }

        response = await axios.post(`https://mood-lens-server.onrender.com/api/v1/user/login`,
          {
            username: formData?.username,
            imageUrl: loginImage
          });
        // setCurrentUser(data.data);
        console.log('response of image student login ', response);
        setLoading(false);

      } else {

        response = await axios.post(`https://mood-lens-server.onrender.com/api/v1/user/login`,
          {
            username: formData.username,
            password: formData.password
          });
        console.log('response of login ', response);
        // setCurrentUser(data.data);
        setLoading(false)

      }

      console.log(response.data.message, 'response message');

      // Check response for login success or failure
      if (response.data.message === 'Face ID does not match' ||
        response.data.message === 'Incorrect password' ||
        response.data.message === 'Incorrect username' ||
        response.data === 'User not found') {
        setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: response.data.message || response.data || 'Error in student login', open: true });
        setCaptureStatus(false);
        setLoading(false);
      } else {
        setCurrentUser({
          ...response.data.user,
          role: 'student'
        });

        setSnackbarInfo({ ...snackbarInfo, severity: 'success', message: 'Login successful!', open: true });
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate login process delay
        setLoading(false);
        navigate('/dashboard/home');
      }

    } catch (error) {
      setLoading(false);
      setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Error in student login', open: true });
      console.log('Error in student image loginUser', error);

    }

  }

  const teacherloginUser = async (e) => {
    console.log('tecacher login');
    setLoading(true);
    e.preventDefault();
    let newErrors = {};
    if (!formData.username) {
      newErrors.username = 'Username is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);

    // If any field is empty, show alert and return
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Fill the form correctly.', open: true });
      return;
    }

    try {
      console.log(`${process.env.REACT_APP_DEPLOY_URL} APP URL`);

      const response = await axios.post(`https://mood-lens-server.onrender.com/api/v1/teacher/login`,
        {
          userName: formData.username,
          password: formData.password
        });
      // setCurrentUser(data.data);
      console.log('response of teacher login ', response);

      if (response.data.message === 'Incorrect password' || response.data.message === 'Incorrect username' || response.data === 'User not found') {
        setLoading(false);
        setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: response.data.message || response.data || 'Error in teacher login', open: true });

      } else {
        setCurrentUser({
          ...response.data.teacher,
          role: 'teacher'
        });

        setSnackbarInfo({ ...snackbarInfo, severity: 'success', message: 'Login successful!', open: true });
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate login process delay
        setLoading(false);
        navigate('/dashboard/home');

      }

    } catch (error) {
      console.log('Error in Teacher loginUser', error);
      setLoading(false);
      setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Error in teacher login', open: true });

    }

  }

  //google login
  const googleLoginHandle = async () => {
    try {
      const { user } = await signInWithPopup(auth, provider)
      console.log('after sign inn goolgle', user);
      const googleUser = user;
      const googleData = {
        displayName: googleUser?.displayName,
        email: googleUser?.email
      }
      console.log('google data format', googleData);
      const { data } = await axios.post(`${process.env.REACT_APP_URL}/api/v1/users/google-sign-in`, googleData);
      setCurrentUser(data.data);
      console.log('google data', data.data);
      navigate('dashboard/home');
    } catch (error) {
      console.log('error in google login', error);

    }

  }

  //virtual context function 
  useEffect(() => {
    if (studentVirtualName) {
      setFormData((prevData) => ({
        ...prevData,
        username: studentVirtualName,
      }));
    }
  }, [studentVirtualName]);


  return (
    <>
      <section className='login-mainbox'>
        {/* Jumbotron */}
        <div className="px-4 py-5 px-md-5 text-center text-lg-start shadow login-content-box" style={{ backgroundColor: 'hsl(0, 0%, 96%)' }}>
          <div className="container">
            <div className="row gx-lg-5 align-items-center">

              <div className="col-lg-6 mb-5 mb-lg-0">
                <h1 className="my-5 display-3 fw-bold ls-tight">
                  <TypewriterAnimation />
                  <span className="text-primary fw-bold">MoodLens Login</span>
                </h1>
                <p style={{ color: 'hsl(217, 10%, 50.8%)' }}>
                  Revolutionize online learning with MoodLens! Seamlessly connect students and teachers through interactive video calls. Enjoy features like real-time emotion analysis, message monitoring, intuitive voice commands, and detailed meeting history tracking. Redefine education for all, making it accessible and engaging.
                </p>
              </div>

              <div className="col-lg-6 mb-5 mb-lg-0">
                <div className="card shadow shadow-sm">

                  <div className="card-body py-4 px-md-5">

                    <div className="back-icon-btn-login mb-4  d-flex justify-content-between p-2 align-items-center">

                      <h1 className="card-title m-0">Login {loginType ? loginType : ''}</h1>

                      <Button onClick={() => {
                        setShowForm(false);
                        setVirtualShowForm(false);
                        setLoginType('');
                        setLoginVirtualType('');
                      }}
                        style={{ borderRadius: '1rem', border: 'none', padding: '0.2rem 0.8rem' }}
                        variant="outlined" className=' fw-bold mx-2 fs-3' size="large">
                        <i className="bi bi-arrow-left-short"></i>
                      </Button>

                    </div>

                    {/*=================== Konsa Login karna he================= */}

                    {(!showForm && !virtualShowForm) && (
                      <div className="select-login-type-wrapper">

                        <div className="select-login-type d-flex justify-content-around align-items-center ">
                          <Button onClick={() => handleLoginType('student')}
                            style={{ padding: '1rem 2rem', borderRadius: '1rem' }}
                            variant="outlined" className=' fw-bold mx-2' size="large">
                            Student Login
                          </Button>
                          <Button onClick={() => handleLoginType('teacher')}
                            style={{ padding: '1rem 2rem', borderRadius: '1rem' }}
                            variant="outlined" className=' fw-bold mx-2' size="large">
                            Teacher Login
                          </Button>

                        </div>
                        <div className="text-center">
                          <p>Not a member? <NavLink to='/register'>Register</NavLink></p>
                        </div>
                      </div>

                    )
                    }

                    {/* =============Login Types================================ */}

                    {(loginType === 'student' || loginVirtualType === 'student') ? (
                      <form onSubmit={studentLoginUser}>

                        {/* username input */}
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            name="username"
                            className="form-control"
                            id="floatingInput"
                            placeholder="name@example.com"
                            onChange={handleChange}
                            onBlur={handleBlur} // Validate onBlur
                            value={formData.username}
                          />
                          <label htmlFor="floatingInput">User name</label>

                          {errors.username &&

                            <p className='text-danger ms-1 my-1'>
                              {errors.username}
                            </p>

                          }

                        </div>

                        {/* Radio buttons for login method */}
                        <div className="option-radio-btn d-flex justify-content-start mb-3 align-items-center">

                          <div className="form-check form-check-inline">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="loginMethod"
                              id="passwordRadio"
                              value="password"
                              checked={loginMethod === 'password'}
                              onChange={handleRadioChange}
                            />
                            <label className="form-check-label" htmlFor="passwordRadio">Login with password</label>
                          </div>

                          <div className="form-check form-check-inline ms-5">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="loginMethod"
                              id="imageRadio"
                              value="image"
                              checked={loginMethod === 'image'}
                              onChange={handleRadioChange}
                            />
                            <label className="form-check-label" htmlFor="imageRadio">Login with face ID </label>
                          </div>

                        </div>

                        {/* ============Password input================ */}
                        {loginMethod === 'password' &&
                          <div className="form-floating mb-4">

                            <input
                              type="password"
                              className="form-control"
                              id="floatingPassword"
                              placeholder="Password"
                              name='password'
                              value={formData.password}
                              onChange={handleChange}
                              onBlur={handleBlur} // Validate onBlur


                            />
                            <label htmlFor="floatingPassword">Password</label>
                            {
                              errors.password &&

                              <p className='text-danger ms-1 my-1'>
                                {errors.password}.
                              </p>


                            }
                          </div>
                        }

                        {/* ==============Image verify in progress===================== */}

                        {loginMethod === 'image' &&
                          <div className="labels-main">
                            <div className="lable-field-box d-flex border px-3 py-2  mb-3 align-items-center justify-content-between"
                              onClick={() => setOpenImageCapture(true)}>
                              <div className="text-div d-flex align-items-center">
                                <i className="bi bi-card-image fs-4 me-3"></i>
                                <p className='p-0 mb-0'>Image verification</p>
                              </div>
                              <div className="icon-div d-flex">
                                {isImageCaptured ? (
                                  <i className="bi bi-patch-check fs-3 text-primary"></i>
                                ) : (
                                  <i className="bi bi-x fs-2 text-danger"></i>
                                )}
                              </div>
                            </div>
                            <LoginImageVerify
                              setLoginImage={setLoginImage}
                              setIsImageCaptured={setIsImageCaptured}
                              formData={formData}
                              loginVirtualName={studentVirtualName}
                            />
                          </div>
                        }


                        {/* Submit button */}
                        <Button ref={loginButtonRef} type='submit' variant="contained" className='w-100 mb-2 fw-bold' disabled={loading}>
                          {loading ? (
                            <>
                              <CircularProgress size={24} color="inherit" className='mx-2' />
                              Please wait...
                            </>
                          ) : 'Login'}
                        </Button>

                        <div className="text-center">
                          <p>Not a member? <NavLink to='/register'>Register</NavLink></p>
                        </div>

                        {/* Google Register buttons */}
                        {/* <div className="text-center">
                          <GoogleButton className='m-auto' onClick={googleLoginHandle} label='Sign up with Google' />
                        </div> */}

                      </form>
                    )
                      : null}

                    {loginType === 'teacher' ? (
                      <form onSubmit={teacherloginUser}>

                        {/* username input */}
                        <div className="form-floating mb-3">
                          <input
                            type="text"
                            name="username"
                            className="form-control"
                            id="floatingInput"
                            placeholder="name@example.com"
                            onChange={handleChange}
                            onBlur={handleBlur} // Validate onBlur
                            value={formData.username}
                          />
                          <label htmlFor="floatingInput">User name</label>

                          {errors.username &&

                            <p className='text-danger ms-1 my-1'>
                              {errors.username}
                            </p>

                          }

                        </div>

                        {/* Password input */}
                        <div className="form-floating mb-4">

                          <input
                            type="password"
                            className="form-control"
                            id="floatingPassword"
                            placeholder="Password"
                            name='password'
                            value={formData.password}
                            onChange={handleChange}
                            onBlur={handleBlur} // Validate onBlur


                          />
                          <label htmlFor="floatingPassword">Password</label>
                          {
                            errors.password &&

                            <p className='text-danger ms-1 my-1'>
                              {errors.password}.
                            </p>


                          }
                        </div>

                        {/* Submit button */}
                        <Button type='submit' variant="contained" className='w-100 mb-2 fw-bold' disabled={loading}>
                          {loading ? (
                            <>
                              <CircularProgress size={24} color="inherit" className='mx-2' />
                              Please wait...
                            </>
                          ) : 'Login'}
                        </Button>

                        <div className="text-center">
                          <p>Not a member? <NavLink to='/register'>Register</NavLink></p>
                        </div>

                        {/* Google Register buttons */}
                        {/* <div className="text-center">
                          <GoogleButton className='m-auto' onClick={googleLoginHandle} label='Sign up with Google' />
                        </div> */}

                      </form>
                    )
                      : null}

                  </div>

                  {/* Common snackbar */}
                  <Snackbar open={snackbarInfo.open} autoHideDuration={4000} onClose={handleCloseSnackBar}>
                    <Alert onClose={handleCloseSnackBar} severity={snackbarInfo.severity} variant="filled" sx={{ width: '100%' }}>
                      {snackbarInfo.message}
                    </Alert>
                  </Snackbar>
                </div>
              </div>

            </div>
          </div>
        </div>
        {/* Jumbotron */}
      </section>

    </>
  )
}

export default Login