import React, { useState, useContext } from 'react'
import { Link, Navigate } from 'react-router-dom'
import axios from 'axios'
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { UserContext } from "../Context/user";
import Sidelog from '../Component/sidelog';

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [redirect, setRedirect] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [eye, setEye] = useState(false)

    const { setUser } = useContext(UserContext)

    const loginSub = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/login', { username, password }
                // This ensures the cookie is sent with the request
            );

            if (response.status === 200) {
                console.log('Logged In:', response.data);
                setUser(response.data.user);
                setSuccess('Login successful!');
                setRedirect(true);  // Redirect only if login is successful
            }
        } catch (error) {
            if (error.response) {
                // Check the status code to determine the error type
                if (error.response.status === 404) {
                    setError('User not found');
                } else if (error.response.status === 401) {
                    setError('Incorrect password');
                } else {
                    setError('Login failed. Please try again.');
                }
            } else {
                setError('Login failed. Please check your connection and try again.');
            }
            console.error('Login error:', error);
        }
    };

    if (redirect) {
        return <Navigate to="/" />;
    }

    return (
        <div className='h-screen w-screen flex'>
            <Sidelog></Sidelog>
            <div className="login grid place-content-center h-auto w-[45vw] py-6 shadow-lg bg-white rounded-md">
                <form action="" onSubmit={loginSub} className='flex flex-col gap-4 items-center w-[27vw]'>
                    <h1 className='text-4xl md:text-5xl font-semibold text-sec mb-4'>Login User</h1>
                    
                    <input 
                        type="text" 
                        placeholder='Username' 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        className='border-b-2 border-neutral-200 outline-none h-16 w-full'
                        required 
                    />

                    <div className="border-b-2 border-neutral-200 h-16 w-full overflow-hidden relative">
                        <input 
                            type={!eye ? "password" : 'text'} 
                            placeholder='Password'  
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            className='h-full w-full absolute top-0 outline-none'
                            required
                        />
                        <div 
                            className='absolute cursor-pointer h-6 w-6 top-1/2 -translate-y-1/2 right-2' 
                            onClick={() => setEye(!eye)}
                        >
                            {eye ? 
                                <FaEye className='h-full w-full text-neutral-700'/> : 
                                <FaEyeSlash className='h-full w-full text-neutral-700'/>
                            }
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 w-full text-center">{error}</p>}
                    {success && <p className="text-green-500 w-full text-center">{success}</p>}
                    
                    <input 
                        type="submit" 
                        value="Login" 
                        className='h-16 w-full mt-8 bg-sec rounded-md cursor-pointer font-semibold'
                    />
                    
                    <div className="flex items-center w-full my-2">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500 bg-white">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    
                    {/* Google Sign-in Button */}
                    <a 
                        href="https://signguide-backend-xhsq.onrender.com/auth/google"
                        className="flex items-center justify-center gap-2 h-16 w-full bg-white border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200"
                    >
                        <FcGoogle className="text-2xl" />
                        <span>Login with Google</span>
                    </a>
                    
                    <h4 className="mt-4">
                        Don't have an account? <Link to='/register' className='underline text-blue-600'>create account</Link>
                    </h4>
                </form>
            </div>
        </div>
    )
}

export default Login