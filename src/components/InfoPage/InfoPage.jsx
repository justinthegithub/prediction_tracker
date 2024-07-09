import React from 'react';
import './InfoPage.css'; 

function InfoPage() {
  return (
    <div className="container">
      <div className="section">
        <h1>Prediction Tracker Info</h1>

        <div className="section">
          <h2>What I Want to Work on Next</h2>
          <ul>
            <li>Include polling data to compare to market prices.</li>
            <li>
              For prediction markets, the prices are often considered to represent probabilities. By comparing these prices to polling data, we can gain insights into how public opinion aligns with market expectations. This comparison can help identify discrepancies and improve the accuracy of predictions.
            </li>
          </ul>
        </div>

        <p>Developed by Justin Kahn</p>
        <p>Please send any comments or questions on Slack or reach out on LinkedIn.</p>
        <p>LinkedIn: <a href="https://www.linkedin.com/in/kahnjustin/" target="_blank" rel="noopener noreferrer">https://www.linkedin.com/in/kahnjustin/</a></p>
        <p>Github: <a href="https://www.github.com/justinthegithub" target="_blank" rel="noopener noreferrer">https://www.github.com/justinthegithub</a></p>
      </div>

      <div className="section">
        <h2>Technology Stack</h2>
        <p className="tech-stack">React, Redux, Node.js, Express</p>
      </div>

      <div className="section highlight">
        <h2>Thanks Yous</h2>
        <ul className="highlight-list">
          <li>Crystal for encouragement to pursue this app when I couldn't decide what to do</li>
          <li>Michael for asking questions that led me to look at the Kelly criterion for bet sizing more closely</li>
          <li>Josh for the check-ins and memes</li>
          <li>Sam for pushing me to work on my front end design. Look, I added a blue box!</li>
          <li>Key for helping me to turn my wireframes into beautiful tapestries</li>  
          <li>Dane for preventing me from going forward with my out of control database design</li>
        </ul>
      </div>
    </div>
  );
}

export default InfoPage;
