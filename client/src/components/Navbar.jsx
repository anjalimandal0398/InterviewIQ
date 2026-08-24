
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "motion/react";
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { setUserData } from "../redux/userSlice";
import { ServerUrl } from "../App";

const Navbar = () => {
  const { userData } = useSelector((state) => state.user);

  const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", {
        withCredentials: true,
      });

      dispatch(setUserData(null));
      setShowCreditPopup(false);
      setShowUserPopup(false);

      navigate("/auth");
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogoClick = () => {
    navigate("/");
    setShowCreditPopup(false);
    setShowUserPopup(false);
  };

  return (
    <div className="bg-[#f3f3f3] flex justify-center px-4 pt-6">
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-6xl bg-white rounded-[24px] shadow-sm border border-gray-200 px-5 md:px-8 py-4 flex justify-between items-center relative"
      >
        {/* Logo */}
        <div
          onClick={handleLogoClick}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="bg-black text-white p-2 rounded-lg">
            <BsRobot size={18} />
          </div>

          <h1 className="font-semibold hidden md:block text-lg">
            InterviewIQ.AI
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 md:gap-6 relative">
          {/* Credit */}
          {userData && (
            <div className="relative">
              <button
                onClick={() => {
                  setShowCreditPopup(!showCreditPopup);
                  setShowUserPopup(false);
                }}
                className="flex items-center gap-2 bg-gray-100 px-3 md:px-4 py-2 rounded-full text-sm md:text-md hover:bg-gray-200 transition"
              >
                <BsCoin size={20} />
                {userData?.credits || 0}
              </button>

              {showCreditPopup && (
                <div className="absolute right-0 top-12 w-64 bg-white shadow-xl border border-gray-200 rounded-xl p-5 z-50">
                  <p className="text-sm text-gray-600 mb-4">
                    Need more credits to continue interviews?
                  </p>

                  <button
                    onClick={() => navigate("/pricing")}
                    className="w-full bg-black text-white py-2 rounded-lg text-sm hover:bg-gray-800 transition"
                  >
                    Buy more credits
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserPopup(!showUserPopup);
                setShowCreditPopup(false);
              }}
              className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-semibold"
            >
              {userData?.name ? (
                userData.name.slice(0, 1).toUpperCase()
              ) : (
                <FaUserAstronaut size={16} />
              )}
            </button>

            {showUserPopup && (
              <div className="absolute right-0 mt-3 w-52 bg-white shadow-xl border border-gray-200 rounded-xl p-4 z-50">
                {userData ? (
                  <>
                    <div className="border-b border-gray-100 pb-3 mb-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {userData.name}
                      </p>

                      <p className="text-xs text-gray-500 truncate mt-1">
                        {userData.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        navigate("/history");
                        setShowUserPopup(false);
                      }}
                      className="w-full text-left text-sm py-2 hover:text-black text-gray-600"
                    >
                      Interview History
                    </button>

                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowUserPopup(false);
                      }}
                      className="w-full text-left text-sm py-2 hover:text-black text-gray-600"
                    >
                      Profile
                    </button>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left text-red-500 text-sm py-2 flex items-center gap-2 hover:text-red-600"
                    >
                      <HiOutlineLogout size={16} />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/auth");
                      setShowUserPopup(false);
                    }}
                    className="w-full bg-black text-white py-2 rounded-lg text-sm"
                  >
                    Login
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Navbar;
