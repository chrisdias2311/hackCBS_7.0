import * as Yup from 'yup'

export const loginSchema = Yup.object({
  // username: Yup.string().min(2).required('please enter a valid name'),
  // email: Yup.string().email().required('please enter a valid email'),
  // password: Yup.string().min(6).required('password field is required'),
})
export const registerSchema = Yup.object({
  pid: Yup.number().required('PID is required'),
  phone: Yup.number().required('Phone number is required'),
  role: Yup.string().required('Role is required'),
  disability: Yup.string().required('Please select a disability type'),
  username: Yup.string().min(2).required('please enter a valid name'),
  email: Yup.string().email().required('please enter a valid email'),
  password: Yup.string().min(6).required('password field is required'),
})