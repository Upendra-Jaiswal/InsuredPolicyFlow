import React, { useState } from "react";
import axios from "axios";
import PolicyInfo from "../../../backend/models/PolicyInfo";

const SearchPolicy = () => {
  const [username, setUsername] = useState("");
  const [policyInfo, setPolicyInfo] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!username) {
      setError("Please enter a username");
      return;
    }

    try {
      setError("");
      setPolicyInfo(null);

      const response = await axios.get(
        `http://localhost:3001/api/users/search-policy?username=${username}`
      );

      if (response.status === 200) {
        setPolicyInfo(response.data.data);
       // console.log(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "User not found");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Search Policy Info
        </h2>
        <input
          type="text"
          placeholder="Enter First Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border rounded-lg mb-3"
        />
        <button
          onClick={handleSearch}
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
        {error && <p className="text-red-500 text-center mt-3">{error}</p>}
        {policyInfo && (
          <div className="mt-4 p-4 bg-gray-50 border rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700">
              Policy Details
            </h3>
            <p>
              <strong>Policy Number:</strong> {policyInfo.policyNumber}
            </p>
            <p>
              <strong>Start Date:</strong>{" "}
              {new Date(policyInfo.startDate).toLocaleDateString()}
            </p>
            <p>
              <strong>End Date:</strong>{" "}
              {new Date(policyInfo.endDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPolicy;
