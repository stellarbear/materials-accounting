import React from 'react';
import '../styles/Error.css';
import { Link } from 'react-router-dom';

const Error = () => {
  document.title = 'Ошибка!';
  return (
    <div className='error_page'>
      <div className='ui card'>
        <div className='content'>
          <div className='header'>404</div>
        </div>
        <div className='content'>
          <h4 className='ui sub header'>Страница не найдена!</h4>
        </div>
        <div className='extra content'>
          <Link to='/'>
            <button className='ui button blue'>На главную</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Error;