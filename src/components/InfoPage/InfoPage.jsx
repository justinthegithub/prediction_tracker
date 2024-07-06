import React from 'react';

// This is one of our simplest components
// It doesn't have local state
// It doesn't dispatch any redux actions or display any part of redux state
// or even care what the redux state is

function InfoPage() {
  return (
    <div className="container">
      <p>Market Tracker</p>
      
      <div className="section">
        <h2>Technology Stack</h2>
        <ul>
          <li>React</li>
          <li>Redux</li>
          <li>Node.js</li>
          <li>Express</li>
         
        </ul>
      </div>

      <div className="section">
        <h2>Thanks Yous</h2>
        <ul>
          <li>Crystal for encouragement to pursue this topic</li>
          <li>Michael for asking questions that led me to look at the Kelly criterion</li>
        </ul>
      </div>

      <div className="section">
        <h2>App</h2>
        <p>Developed by Justin Kahn</p>
        <p>LinkedIn: <a href="https://www.linkedin.com/in/kahnjusti/">https://www.linkedin.com/in/kahnjustin/</a></p>
        <p>Github: <a href="https://www.github.com/justinthegithub">www.github.com/justinthegithub</a></p>
      </div>
    </div>
  );
}

export default InfoPage;
