import React, { useContext, useState } from 'react';
import { MdOutlineHandshake } from "react-icons/md";
import { Link } from 'react-router-dom';
import { UserContext } from '../Context/user';

const Nav = () => {
  const navbar = [
    { main: 'Learn', sub: ['articles', 'videos', 'quiz'] },
    { main: 'Detect', sub: ['liveDetect', 'imgUpload'] }, 
    { main: 'Contacts', sub: ['contactUs'] }
  ];

  const { user } = useContext(UserContext);
  const [imageError, setImageError] = useState(false);
  const defaultProfileImage = "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1742569891~exp=1742573491~hmac=2d32e685aa41f94a30ce0fb185a166be825e572d809fc82dce7e6626de4a0e88&w=740";

  // Use profile picture with error handling, similar to Profile component
  const profileImage = !imageError && user?.profilePicture ? user.profilePicture : defaultProfileImage;

  return (
    <div className='h-[12vh] bg-white sticky top-0 right-0 z-50 w-[98vw] flex items-center justify-between px-10 bg-opacity-90 backdrop-blur-md'>
      <Link to='/' className="h-full flex items-center gap-4">
        <MdOutlineHandshake className='h-full w-12' />
        <h2 className='text-xl font-bold uppercase'>SignGuide</h2>
      </Link>

      {user ? (
        <div className="flex gap-20 items-center h-full text-xl relative">
          {navbar.map((val, key) => (
            <div key={key} className="relative group cursor-pointer">
              <div>{val.main}</div>
              <span className="absolute left-1/2 bottom-0 w-0 h-[3px] bg-sec transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
              <div className="absolute left-1/2 -translate-x-1/2 top-full opacity-0 hidden group-hover:flex flex-col group-hover:opacity-100 backdrop-blur-lg group-hover:translate-y-0 -translate-y-4 duration-300 bg-white shadow-lg rounded-md p-2 w-40">
                {val.sub.map((val2, subKey) => (
                  <Link 
                    key={subKey} 
                    to={`/${val2}`} 
                    className="p-2 capitalize hover:bg-gray-200 rounded-lg"
                  >
                    {val2}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {user ? (
        <Link to="/profile" className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-sec hover:shadow-md transition-all duration-300">
            <img 
              src={profileImage} 
              alt="Profile" 
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.log("Nav image failed to load:", profileImage);
                setImageError(true);
              }}
            />
          </div>
        </Link>
      ) : (
        <div className="flex gap-4">
          <Link to="/login" className="font-semibold bg-sec px-12 border-2 border-black py-3">Log in</Link>
          <Link to="/register" className="font-semibold px-12 border-2 border-black py-3">Sign up</Link>
        </div>
      )}
    </div>
  );
};

export default Nav;