import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Sidelog from '../Component/sidelog';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [conPass, setConPass] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [eye, setEye] = useState(false);
    const [eye1, setEye1] = useState(false);
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if passwords match
        if (password !== conPass) {
            setError("Passwords do not match");
            return;
        }

        setError('');
        setSuccess('');

        try {
            // Make the POST request to the backend
            const response = await axios.post('/register', {
                username,
                password,
                email,
            });

            // If registration is successful, display a success message
            setSuccess("Registration successful!");
            console.log(response.data);  // Log the response data for debugging

            // Optionally, clear the input fields
            setUsername('');
            setPassword('');
            setConPass('');
            setEmail('');
        } catch (error) {
            setError(error.response?.data?.message || "Registration failed. Please try again.");
        }
    };

    return (
        <div className='h-screen w-screen flex'>
            <Sidelog />
            <div className="login grid place-content-center h-auto w-[45vw] py-6 shadow-lg bg-white rounded-md">
                <form onSubmit={handleSubmit} className='flex flex-col gap-4 items-center w-[27vw]'>
                    <h1 className='text-4xl md:text-5xl font-semibold text-sec mb-4'>Register User</h1>
                    
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
                            {eye ? <FaEye className='h-full w-full text-neutral-700'/> : <FaEyeSlash className='h-full w-full text-neutral-700'/>}
                        </div>
                    </div>
                    
                    <div className="border-b-2 border-neutral-200 h-16 w-full overflow-hidden relative">
                        <input 
                            type={!eye1 ? "password" : 'text'} 
                            placeholder='Confirm Password'  
                            value={conPass} 
                            onChange={e => setConPass(e.target.value)} 
                            className='h-full w-full absolute top-0 outline-none'
                            required
                        />
                        <div 
                            className='absolute cursor-pointer h-6 w-6 top-1/2 -translate-y-1/2 right-2' 
                            onClick={() => setEye1(!eye1)}
                        >
                            {eye1 ? <FaEye className='h-full w-full text-neutral-700'/> : <FaEyeSlash className='h-full w-full text-neutral-700'/>}
                        </div>
                    </div>
                    
                    <input 
                        type='email' 
                        placeholder='Email'  
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className='border-b-2 border-neutral-200 outline-none h-16 w-full'
                        required
                    />
                    
                    {error && <p className="text-red-500 w-full text-center">{error}</p>}
                    {success && <p className="text-green-500 w-full text-center">{success}</p>}
                    
                    <input 
                        type="submit" 
                        value="Register" 
                        className='h-16 w-full mt-8 bg-sec rounded-md cursor-pointer font-semibold'
                    />
                    
                    <div className="flex items-center w-full my-2">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500 bg-white">OR</span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    
                    {/* Google Sign-in Button */}
                    <a 
                        href="http://localhost:3000/auth/google"
                        className="flex items-center justify-center gap-2 h-16 w-full bg-white border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-200"
                    >
                        <FcGoogle className="text-2xl" />
                        <span>Sign up with Google</span>
                    </a>
                    
                    <h4 className="mt-4">
                        Already have an account? <Link to='/login' className='underline text-blue-600'>Login here</Link>
                    </h4>
                </form>
            </div>
        </div>
    );
};

export default Register;