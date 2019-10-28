import React from 'react';

function Footer() {
  return (
    <footer className='bg-dark text-white mt-5 p-4 text-center fixed-bottom'>
      Copyright &copy; {new Date().getFullYear()} MalamasConnector
    </footer>
  );
}

export default Footer;
