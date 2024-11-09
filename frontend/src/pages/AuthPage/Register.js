import React, { useContext, useState } from 'react'
import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Button, CircularProgress, Snackbar } from '@mui/material';
import './AuthPage.css';
import { useFormik } from 'formik';
import { registerSchema } from '../YupSchema';
import { NavLink, useNavigate } from 'react-router-dom';
import axios from 'axios';
import GoogleButton from 'react-google-button';

//firebase Imports
import db, { storage } from '../../firbaseConfig';

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, push, set } from 'firebase/database';
import TypewriterAnimation from '../../components/TypewriterAnimation/TypewriterAnimation';
import { UserContext } from '../../ContextApi/userContex';


const initialValues = {
  role: '',
  pid: '',
  phone: '',
  username: '',
  email: '',
  password: '',
  disability: 'none',
}

const Register = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);

  const { values, errors, touched, handleBlur, handleChange, handleSubmit } = useFormik({
    initialValues: initialValues,
    validationSchema: registerSchema,
    onSubmit: async (values, action) => {
      console.log('Formik values', values);

      if (values.role === 'teacher') {
        await registerTeacherUser(values);
      } else {
        if (imageFile === null) {
          setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Uploade the image', open: true });
          setLoading(false);
          return;
        }
        await registerStudentUser(values);
      }
      action.resetForm();
    }

  });

  //snackbar states n loading states
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, severity: 'info', message: '' });
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false);

  //close snackbar
  const handleCloseSnackBar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setSnackbarInfo({ ...snackbarInfo, open: false });
  };

  console.log("in form erros ", errors);


  //registerStudentUser handle
  const registerStudentUser = async (values) => {
    try {
      setLoading(true);

      console.log(`${process.env.REACT_APP_DEPLOY_URL} APP URL`);

      // Upload image to Firebase Storage with the PID as part of the path
      console.log('Values in student register hanle', values);
      const imageRef = ref(storage, `images/${values.pid}/${imageFile.name}`);
      await uploadBytes(imageRef, imageFile);

      // Get the download URL of the uploaded image
      const imageUrl = await getDownloadURL(imageRef);
      console.log(imageUrl);

      const imageDataRef = push(dbRef(db, 'StudentImages'));
      set(imageDataRef, {
        Name: values.username,
        imageUrl: imageUrl
      }).then(() => {
        setSnackbarInfo({ ...snackbarInfo, severity: 'success', message: 'Image Uploaded successful!', open: true });
      }).catch((error) => {
        setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Error saving image URL', open: true });
        setLoading(false);
        console.error("Error saving image URL: ", error);
      });

      // Prepare data to be stored in the database
      const registrationData = {
        // role: values.role,
        pid: parseInt(values.pid),
        userName: values.username,
        name: values.username,
        face_id: imageUrl, // URL of the uploaded image
        disability: values.disability,
        phone: values.phone,
        email: values.email,
        password: values.password,
      };

      const response = await axios.post(`https://mood-lens-server.onrender.com/api/v1/user/signup`, registrationData);
      console.log('response in Student register', response);

      if (response.data.message === 'User created successfully') {
        setSnackbarInfo({ ...snackbarInfo, severity: 'success', message: 'Account created successfully', open: true });
        setLoading(false);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        navigate('/login');
      } else {
        setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Failed Registering Student', open: true });
        setLoading(false);
      }

    } catch (error) {
      setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Error Registering Student', open: true });
      setLoading(false);
      console.log('Error in registerStudentUser', error);

    }

  }

  //registerTeacherUser handle
  const registerTeacherUser = async (values) => {
    try {
      setLoading(true);
      console.log(`${process.env.REACT_APP_DEPLOY_URL} APP URL`);

      // Prepare data to be stored in the database
      const registrationData = {
        // role: values.role,
        hostId: parseInt(values.pid),
        email: values.email,
        userName: values.username,
        phone: values.phone,
        password: values.password,
      };

      const response = await axios.post(`https://mood-lens-server.onrender.com/api/v1/teacher/signup`, registrationData);

      console.log('response in Teacher register', response);
      if (response.data.message === 'Account created successfully') {
        setSnackbarInfo({ ...snackbarInfo, severity: 'success', message: 'Account created successfully', open: true });
        setLoading(false);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        navigate('/login');
      } else {
        setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Failed Registering Teacher', open: true });
        setLoading(false);

      }



    } catch (error) {
      setSnackbarInfo({ ...snackbarInfo, severity: 'error', message: 'Error Registering Teacher', open: true });
      setLoading(false);
      console.log('Error in registerStudentUser', error);

    }

  }
  // console.log(values);

  return (
    <>

      <section className='register-mainbox'>

        {/* Jumbotron */}
        <div className="px-4 py-5 px-md-5 text-center text-lg-start shadow register-content-box" style={{ backgroundColor: 'hsl(0, 0%, 96%)' }}>
          <div className="container">
            <div className="row gx-lg-5 align-items-center">

              <div className="d-none d-md-block col-lg-6 mb-5 mb-lg-0">
                <h1 className="my-5 display-3 fw-bold ls-tight">
                  <TypewriterAnimation />
                  <span className="text-primary">MoodLens Signup</span>
                </h1>
                <p style={{ color: 'hsl(217, 10%, 50.8%)' }}>
                  Revolutionize online learning with MoodLens! Seamlessly connect students and teachers through interactive video calls. Enjoy features like real-time emotion analysis, message monitoring, intuitive voice commands, and detailed meeting history tracking. Redefine education for all, making it accessible and engaging.
                </p>
              </div>

              <div className="col-lg-6 mb-5 mb-lg-0">
                <div className="card shadow shadow-sm">
                  <div className="card-body py-4 px-md-5">
                    <h1 className="card-title mb-4">Create a new account</h1>


                    <div className="button-role d-flex mb-3">
                      <button
                        type="button"
                        className={`btn btn-outline-primary me-3 ${values.role === 'teacher' ? 'active' : ''}`}
                        onClick={() => handleChange('role')('teacher')}
                      >
                        Teacher
                      </button>
                      <button
                        type="button"
                        className={`btn btn-outline-secondary ${values.role === 'student' ? 'active' : ''}`}
                        onClick={() => handleChange('role')('student')}
                      >
                        Student
                      </button>
                      {errors.role && touched.role ?
                        (
                          <p className='text-danger ms-3 mt-2 p-0 m-0'>
                            {errors.role}
                          </p>

                        ) : null}

                    </div>


                    <form onSubmit={handleSubmit}>


                      <div className="username-email d-flex justify-content-between mb-4">


                        {/* userName input */}
                        <div className="form-floating w-100 me-3">
                          <input
                            type='text'
                            className="form-control"
                            id="floatingName"
                            placeholder="john doe"
                            name='username'
                            value={values.username}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                          <label htmlFor="floatingName">User name</label>

                          {errors.username && touched.username ?
                            (
                              <p className='text-danger ms-1 my-1'>
                                {errors.username}
                              </p>

                            ) : null}

                        </div>

                        {/* Email input */}
                        <div className="form-floating w-100">
                          <input
                            type="email"
                            className="form-control"
                            id="floatingInput"
                            placeholder="name@example.com"
                            name='email'
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                          <label htmlFor="floatingInput">Email address</label>

                          {errors.email && touched.email ?
                            (
                              <p className='text-danger ms-1 my-1'>
                                {errors.email}
                              </p>

                            ) : null}

                        </div>

                      </div>

                      <div className={`disablity-image d-flex justify-content-between mb-4 align-items-basline ${values.role === 'teacher' ? 'd-none' : ''}`}>

                        {/* Disablilty ask */}
                        <div className="from-floating w-100">
                          <select
                            className="form-select p-2"
                            aria-label=".form-select-lg example"
                            name="disability"
                            value={values.disability}
                            onChange={handleChange}
                            onBlur={handleBlur}
                          >
                            <option value="">Select your disability type</option>
                            <option value="None">None</option>
                            <option value="Deaf">Deaf</option>
                            <option value="Blind">Blind</option>
                            <option value="Wheelchair User">Wheelchair User</option>
                            <option value="Intellectual Disability">Intellectual Disability</option>
                            <option value="Physical Disability">Physical Disability</option>
                            <option value="Autism">Autism</option>
                            <option value="Developmental Disability">Developmental Disability</option>
                            <option value="Cerebral Palsy">Cerebral Palsy</option>
                            <option value="Multiple Sclerosis">Multiple Sclerosis</option>
                          </select>
                          {errors.disability && touched.disability ?
                            (
                              <p className='text-danger ms-1 p-0 m-0'>
                                {errors.disability}
                              </p>

                            ) : null}
                        </div>

                        {/* ImageData */}
                        <div className="image-field w-100 ms-3">
                          {/* <label htmlFor="floatingName">Choose a image</label> */}
                          <input
                            className="form-control form-control-md"
                            type="file"
                            id="formFile"
                            placeholder="Choose a Image"
                            name='imageData'
                            accept='image/*'
                            // value={values.ImageData}
                            onChange={(event) => {
                              setImageFile(event.target.files[0]);
                            }}
                            onBlur={handleBlur} />


                          {!imageFile ?
                            (
                              <p className='text-danger ms-1 m-0'>
                                {errors.ImageData}
                              </p>

                            ) : null}

                        </div>

                      </div>


                      <div className="pid-phone  d-flex justify-content-betweens  mb-4">
                        {/* PID INput */}
                        <div className="form-floating w-100 me-3">
                          <input
                            type="number"
                            className="form-control"
                            id="floatingName"
                            placeholder="211103"
                            name='pid'
                            value={values.pid}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                          <label htmlFor="floatingName">PID</label>

                          {errors.pid && touched.pid ?
                            (
                              <p className='text-danger ms-1 my-1'>
                                {errors.pid}
                              </p>

                            ) : null}

                        </div>

                        {/* Phone INput */}
                        <div className="form-floating w-100">
                          <input
                            type="number"
                            className="form-control"
                            id="floatingName"
                            placeholder="211103"
                            name='phone'
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur} />
                          <label htmlFor="floatingName">Phone number</label>

                          {errors.phone && touched.phone ?
                            (
                              <p className='text-danger ms-1 my-1'>
                                {errors.phone}
                              </p>

                            ) : null}

                        </div>

                      </div>



                      {/* Password input */}
                      <div className="form-floating mb-4">

                        <input
                          type="password"
                          className="form-control"
                          id="floatingPassword"
                          placeholder="Password"
                          name='password'
                          value={values.password}
                          onChange={handleChange}
                          onBlur={handleBlur} />
                        <label htmlFor="floatingPassword">Password</label>
                        {
                          errors.password && touched.password ?
                            (
                              <p className='text-danger ms-1 my-1'>
                                {errors.password}.
                              </p>

                            )
                            : null
                        }
                      </div>



                      {/* Submit button */}
                      <Button type='submit' variant="contained" className='w-100 mb-2 fw-bold' disabled={loading}>
                        {loading ? (
                          <>
                            <CircularProgress size={24} color="inherit" className='mx-2' />
                            Please wait...
                          </>
                        ) : 'Sign in'}
                      </Button>

                      <div className="text-center">
                        <p>Already a member? <NavLink to='/login'>Login</NavLink></p>
                      </div>

                      {/* Google Register buttons */}
                      <div className="text-center ">
                        {/* <p>or sign up with:</p> */}
                        <GoogleButton className='m-auto' onClick={() => { console.log('Google Clicked'); }} label='Sign up with Google' />

                      </div>

                    </form>


                  </div>

                  <Snackbar open={snackbarInfo.open} autoHideDuration={4000} onClose={handleCloseSnackBar}>
                    <Alert onClose={handleCloseSnackBar} severity={snackbarInfo.severity} variant="filled" sx={{ width: '100%' }}>
                      {snackbarInfo.message}
                    </Alert>
                  </Snackbar>
                </div>
              </div>

            </div>
          </div>
        </div >
        {/* Jumbotron */}
      </section >

    </>
  )
}

export default Register