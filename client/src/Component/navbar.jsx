import React, { useContext, useState } from "react";
import { MdOutlineHandshake } from "react-icons/md";
import { Link } from "react-router-dom";
import { UserContext } from "../Context/user";
import { motion, AnimatePresence } from "framer-motion";

const Nav = () => {
  const navbar = [
    { main: "Learn", sub: ["articles", "videos", "quiz"] },
    { main: "Detect", sub: ["liveDetect", "imgUpload"] },
    { main: "Contacts", sub: ["contactUs"] },
  ];

  const { user } = useContext(UserContext);
  const [imageError, setImageError] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const defaultProfileImage =
    "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1742569891~exp=1742573491~hmac=2d32e685aa41f94a30ce0fb185a166be825e572d809fc82dce7e6626de4a0e88&w=740";

  const profileImage =
    !imageError && user?.profilePicture
      ? user.profilePicture
      : defaultProfileImage;

  return (
    <div className="h-[12vh] bg-white sticky top-0 right-0 z-50 w-full flex items-center justify-between px-6 md:px-10 bg-opacity-90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <Link to="/" className="h-full flex items-center gap-4">
        <motion.div
          whileHover={{ rotate: 10 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <MdOutlineHandshake className="h-full w-10 md:w-12 text-[rgb(72,169,166)]" />
        </motion.div>
        <h2 className="text-xl font-bold uppercase text-[rgb(72,169,166)]">
          SignGuide
        </h2>
      </Link>

      {user ? (
        <div className="hidden md:flex gap-12 items-center h-full text-[1.1rem] relative">
          {navbar.map((val, key) => (
            <div
              key={key}
              className="relative"
              onMouseEnter={() => setActiveMenu(key)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <motion.div
                className="cursor-pointer px-2 py-1 rounded-lg "
                whileHover={{ color: "rgb(50,149,146)" }}
              >
                {val.main}
                <motion.span
                  className="absolute left-0 bottom-0 w-full h-0.5 bg-[rgb(72,169,166)]"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: activeMenu === key ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>

              <AnimatePresence>
                {activeMenu === key && (
                  <motion.div
                    className="absolute left-0 top-full mt-2 bg-white shadow-xl rounded-lg p-2 w-48 origin-top"
                    initial={{ opacity: 0, y: -10, scaleY: 0.9 }}
                    animate={{ opacity: 1, y: 0, scaleY: 1 }}
                    exit={{ opacity: 0, y: -10, scaleY: 0.9 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                  >
                    {val.sub.map((val2, subKey) => (
                      <Link
                        key={subKey}
                        to={`/${val2}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-[rgba(72,169,166,0.1)] rounded-md transition-colors duration-200 text-[1rem]"
                      >
                        <motion.div
                          whileHover={{ x: 5 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          {val2.split(/(?=[A-Z])/).join(" ")}
                        </motion.div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      ) : null}

      {user ? (
        <Link to="/profile" className="flex items-center justify-center">
          <motion.div
            className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2  hover:border-[rgb(50,149,146)] transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
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
          </motion.div>
        </Link>
      ) : (
        <div className="flex gap-3 md:gap-4">
          <Link
            to="/login"
            className="font-bold bg-[rgb(72,169,166)] text-white px-6 md:px-8 border-2 border-[rgb(72,169,166)] py-2 md:py-3 rounded-lg hover:bg-[rgb(50,149,146)] transition-colors duration-300 text-[1rem]"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="font-bold px-6 md:px-8 border-2 border-[rgb(72,169,166)] text-[rgb(72,169,166)] py-2 md:py-3 rounded-lg hover:bg-[rgba(72,169,166,0.1)] transition-colors duration-300 text-[1rem]"
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
};

export default Nav;