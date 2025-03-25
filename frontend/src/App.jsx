import React from "react";

// import "./App.css";

import FileUpload from "./components/FileUpload";
import SearchPolicy from "./components/SearchPolicy";
// import SearchPolicy from "./components/SearchPolicy";
// import PolicySummary from "./components/PolicySummary";

function App() {
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>

      <div className="container mx-auto p-8">
        <h1 className="text-xl font-bold">Insurance Policy Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <FileUpload />
          <SearchPolicy />
        </div>
      </div>
    </>
  );
}

export default App;
