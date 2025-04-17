import React from 'react'
import { FiPlayCircle } from "react-icons/fi";
import { Link } from 'react-router-dom';
import learn from './learn';

// Importing icons
import { FaGamepad, FaCamera, FaImage, FaVolumeUp, FaVideo, FaQuestionCircle, FaUsers, FaChartLine } from 'react-icons/fa';

const Landing = () => {
  const features = [
    {
      title: 'Gamified Learning',
      desc: 'Enjoy a game-like learning experience with levels, badges, and rewards.',
      icon: <FaGamepad size={40} className="text-sec mb-4" />,
    },
    {
      title: 'Live Sign Detection',
      desc: 'Use your webcam for real-time sign recognition and feedback.',
      icon: <FaCamera size={40} className="text-sec mb-4" />,
    },
    {
      title: 'Photo to Sign',
      desc: 'Convert images with text or gestures into sign language format.',
      icon: <FaImage size={40} className="text-sec mb-4" />,
    },
    {
      title: 'Audio to Sign',
      desc: 'Convert spoken words or audio files into sign language animations.',
      icon: <FaVolumeUp size={40} className="text-sec mb-4" />,
    },
    {
      title: 'Video to Sign',
      desc: 'Transform video content into sign language to aid accessibility.',
      icon: <FaVideo size={40} className="text-sec mb-4" />,
    },
    {
      title: 'Practice Quizzes',
      desc: 'Challenge yourself with quick quizzes to improve memory and skill.',
      icon: <FaQuestionCircle size={40} className="text-sec mb-4" />,
    },
    {
      title: 'Community Support',
      desc: 'Join forums and communities to learn together and ask questions.',
      icon: <FaUsers size={40} className="text-sec mb-4" />,
    },
    {
      title: 'Progress Tracking',
      desc: 'Track your improvement over time and celebrate milestones.',
      icon: <FaChartLine size={40} className="text-sec mb-4" />,
    },
  ]

  return (
    <div className='w-screen'>

      {/* Hero Section (Untouched) */}
      <div className='h-[88vh] w-screen flex px-[20%] items-center relative'>
        <div className="circle h-[30vh] aspect-square rounded-full bg-sec absolute left-[10vw] top-[0vh]"></div>
        <div className="w-[60%] flex flex-col">
          <div className="w-full relative">
            <h2 className='text-wrap text-6xl leading-tight tracking-tighter'>
              Learn sign language with the help of 
              <span className='flex items-center'>
                <img src="assets/blast.png" alt="" className='h-[20vh] object-cover' />
                <span className='hover:text-sec duration-300'>SIGNGUIDE</span>
              </span>
            </h2>
          </div>
          <div className="text-lg">learn to connect with deaf people</div>
          <div className="flex gap-8 mt-10 text-2xl items-center">
            <Link to="/learn" className="bg-sec rounded-full px-12 py-3 border-[2px] border-black whitespace-nowrap hover:translate-y-1 duration-300">Start Learning</Link>
            <Link to='/videos' className="flex gap-3 items-center px-12 py-3 rounded-full hover:bg-main whitespace-nowrap">
              <FiPlayCircle /> <h1>Watch Videos</h1>
            </Link>
          </div>
        </div>
        <div className="w-[40%] h-full">
          <img src="assets/hand.png" alt="" className='w-full h-full object-cover' />
        </div>
      </div>

      {/* What We Do Section */}
      <section className="px-[8%] py-20 bg-white text-black">
        <h2 className="text-4xl font-semibold mb-14 text-center">What We Do & How We Help</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-md border border-black p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 duration-300">
              {feature.icon}
              <h3 className="text-xl font-bold text-sec mb-2">{feature.title}</h3>
              <p className="text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-10 text-center">
        <div className="text-2xl font-bold">SIGNGUIDE</div>
        <p className="text-sm mt-2">Connecting the world through sign language</p>
        <p className="text-xs mt-1 text-gray-400">© {new Date().getFullYear()} SignBridge. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default Landing;
