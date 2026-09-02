import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaArrowLeft,
  FaCode,
  FaGraduationCap,
} from "react-icons/fa";

const Profile = () => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  const userData = user?.userData || user?.user || user;

  const name = userData?.name || "User";
  const email = userData?.email || "Not available";

  return (
    <div className="min-h-screen bg-[#f3f3f3] px-5 py-10">

      <div className="w-full max-w-3xl mx-auto">

        {/* Back Button */}

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition"
        >
          <FaArrowLeft size={14} />
          <span className="text-sm font-medium">
            Back to Dashboard
          </span>
        </button>

        {/* Profile Card */}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Header */}

          <div className="bg-black text-white px-7 py-10 md:px-10">

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center text-3xl font-bold">
                {name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  {name}
                </h1>

                <p className="text-gray-300 text-sm mt-1">
                  AI InterviewIQ Candidate
                </p>
              </div>

            </div>

          </div>

          {/* Profile Information */}

          <div className="p-7 md:p-10">

            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Profile Information
            </h2>

            <div className="space-y-4">

              {/* Name */}

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">

                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-gray-700">
                  <FaUser />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Full Name
                  </p>

                  <p className="font-medium text-gray-900">
                    {name}
                  </p>
                </div>

              </div>

              {/* Email */}

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">

                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-gray-700">
                  <FaEnvelope />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Email Address
                  </p>

                  <p className="font-medium text-gray-900 break-all">
                    {email}
                  </p>
                </div>

              </div>

            </div>

            {/* Developer Info */}

            <div className="mt-8">

              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Professional Information
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">

                  <div className="flex items-center gap-3 mb-3">

                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                      <FaCode />
                    </div>

                    <p className="font-semibold">
                      Target Role
                    </p>

                  </div>

                  <p className="text-sm text-gray-500">
                    MERN Stack Developer
                  </p>

                </div>

                <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">

                  <div className="flex items-center gap-3 mb-3">

                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                      <FaGraduationCap />
                    </div>

                    <p className="font-semibold">
                      Experience
                    </p>

                  </div>

                  <p className="text-sm text-gray-500">
                    Fresher
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Profile;