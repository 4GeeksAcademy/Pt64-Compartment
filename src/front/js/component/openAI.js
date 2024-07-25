import React, { useState } from 'react';
// import OpenAI from "openai";

function App() {
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("handleSubmit called");

    // console.log("Sending request with prompt:", userPrompt);


    let response = await fetch(process.env.BACKEND_URL + "api/chatgpt/ask", {
      method: "POST",
      body: JSON.stringify({
        user_prompt: userPrompt
      }),
      headers: {
        "Content-type": "application/json",
      }
    });
    let data = await response.json();


    console.log("Received response:", data);

    if (response.ok) {
      const content = data.result
      setResponse(content);
    } else {
      console.error("Error during API call:", data.error);
      setResponse("An error occurred while processing your request.");
    }

    // if(data.error) {
    //     console.error("Error during API call:", data.error);
    // }
    // else {
    //     setResponse(data.result);
    // }

    // setResponse({ error: "An error occurred while processing your request." });
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <form onSubmit={handleSubmit} className="mb-4">
            <div className="mb-3">
              <textarea
                className="form-control"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Enter your prompt here"
                rows="4"
              />
            </div>
            <div className="d-grid">
              <button type="submit" className="btn btn-primary">Submit</button>
            </div>
          </form>
          {response && (
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Response:</h2>
                {response.map((item, index) => (
                  <div key={index} className="mb-3">
                    <button className="btn btn-outline-secondary mb-2">
                      {item.city}, {item.state}
                    </button>
                    <p>{item.message}</p>
                    <p>{item.weather}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App