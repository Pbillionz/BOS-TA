'use client';

import React from 'react';
import Link from 'next/link';
import { FiStar, FiUsers, FiCalendar } from 'react-icons/fi';

const MentorCard = ({ mentor }) => {
  const maxStudentsReached = mentor.currentStudents >= mentor.maxStudents;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
        <h3 className="text-xl font-bold">{mentor.firstName} {mentor.lastName}</h3>
        <p className="text-blue-100">{mentor.title}</p>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Bio */}
        <p className="text-gray-600 text-sm line-clamp-3">{mentor.bio}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center text-yellow-500 mb-1">
              <FiStar size={18} className="mr-1" />
              <span className="font-bold">{mentor.rating.toFixed(1)}</span>
            </div>
            <p className="text-xs text-gray-600">({mentor.reviewCount} reviews)</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <FiUsers size={18} className="mr-1" />
              <span className="font-bold">{mentor.currentStudents}/{mentor.maxStudents}</span>
            </div>
            <p className="text-xs text-gray-600">Students</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold text-gray-700">Experience:</span>
            <span className="text-gray-600 ml-2">{mentor.yearsOfExperience} years</span>
          </p>
          <p>
            <span className="font-semibold text-gray-700">Rate:</span>
            <span className="text-gray-600 ml-2">${mentor.hourlyRate}/hour</span>
          </p>
          <p>
            <span className="font-semibold text-gray-700">Timezone:</span>
            <span className="text-gray-600 ml-2">{mentor.timezone}</span>
          </p>
          {mentor.specializations.length > 0 && (
            <div>
              <p className="font-semibold text-gray-700 mb-2">Specializations:</p>
              <div className="flex flex-wrap gap-2">
                {mentor.specializations.map((spec, idx) => (
                  <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Availability Status */}
        <div className="pt-4 border-t border-gray-200">
          {maxStudentsReached ? (
            <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-center text-sm font-medium">
              Currently Unavailable
            </div>
          ) : mentor.availability === 'limited' ? (
            <div className="bg-yellow-50 text-yellow-700 px-3 py-2 rounded text-center text-sm font-medium">
              Limited Availability
            </div>
          ) : (
            <div className="bg-green-50 text-green-700 px-3 py-2 rounded text-center text-sm font-medium">
              Available
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <Link
          href={`/mentors/${mentor._id}`}
          className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default MentorCard;
