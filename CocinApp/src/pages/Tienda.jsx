import React from 'react'
import '../css/tienda.css';
import image_soon from '../assets/contrucion.gif'

const Tienda = () => {
  return (
    <div className='container'>
        <h2 className='title'>La tienda de CocinApp</h2>
        <div className='cont-soon'>
            <p className='soon-text'>Trabajando en la tienda de CocinApp</p>
            {/* <img src={image_soon} alt="proximamente" className='image-soon'/> */}
        </div>
        <p className='soon-text'>Proximamente tienda de CocinApp</p>
        <a href="/" className='btn_home'>Volver al inicio</a>
    </div>
  )
}

export default Tienda
