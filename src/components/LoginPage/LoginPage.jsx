import React from 'react';
import LoginForm from '../LoginForm/LoginForm';
import { useHistory } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginPage.css';

function LoginPage() {
  const history = useHistory();

  const carouselItemStyle = {
    height: '200px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
  };

  return (
    <div style={{ backgroundColor: '#f5f5f5', color: '#333', minHeight: '100vh', padding: '20px' }}>
      <LoginForm />

      <div id="carouselExampleControls" className="carousel slide" data-bs-ride="carousel" style={{ margin: '20px 0' }}>
        <div className="carousel-inner">
          <div className="carousel-item active noticia-text-regular">
            <div className="d-block w-100" style={{ ...carouselItemStyle, backgroundColor: '#e9ecef' }}>
              <h1>Will a Human Travel to Mars before 2029?</h1>
            </div>
          </div>
          <div className="carousel-item noticia-text-regular">
            <div className="d-block w-100" style={{ ...carouselItemStyle, backgroundColor: '#dee2e6' }}>
              <h1>Will the United States Have a Female President by Dec. 31 2024?</h1>
            </div>
          </div>
          <div className="carousel-item noticia-text-regular">
            <div className="d-block w-100" style={{ ...carouselItemStyle, backgroundColor: '#ced4da' }}>
              <h1>Will a General Artificial Intelligence System Try to Prevent Itself from Being Shutdown by 2027?</h1>
            </div>
          </div>
          <div className="carousel-item noticia-text-regular">
            <div className="d-block w-100" style={{ ...carouselItemStyle, backgroundColor: '#ced4da' }}>
              <h1>What will the price of Bitcoin be on Dec. 31 2024?</h1>
            </div>
          </div>

        </div>
        
        
        <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>

      <center>
        <button
          type="button"
          className="btn btn_asLink"
          onClick={() => {
            history.push('/registration');
          }}
          style={{ backgroundColor: '#007bff', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer' }}
        >
          Register
        </button>
      </center>
    </div>
  );
}

export default LoginPage;
