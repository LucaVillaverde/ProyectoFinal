import React from 'react'
import './footer.css'

// ICONS
import fa_icon from '../../assets/facebook.png';
import ig_icon from '../../assets/instagram.png';
import tk_icon from '../../assets/tik-tok.png';


const Footer = () => {
  return (
    <footer>
    <div className="footer-contact">
        <h3>Contactos</h3>
        <div className="footer-icons">
            <a href="http://facebook.com" target='_blank'><img className='foot-icon' alt='logo de facebook.' src={fa_icon}/></a>
            <a href="http://instagram.com"target='_blank'><img className='foot-icon' alt='logo de instagram.' src={ig_icon}/></a>
            <a href="http://tiktok.com"   target='_blank'><img className='foot-icon' alt='logo de tiktok.' src={tk_icon}/></a>
        </div>
        <span className='footer-copyright' >Todos los derechos reservado 2024</span>
    </div>
    </footer>
  )
}

export default Footer
