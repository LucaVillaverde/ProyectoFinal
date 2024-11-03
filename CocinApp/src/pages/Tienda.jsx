import React, {useEffect} from 'react'
import '../css/tienda.css';
import image_soon from '../assets/PaginaEnConstruccion.png'

const Tienda = () => {

  useEffect(() => {
    const metaDescription = document.createElement('meta');
    document.title = "CocinApp: Tienda";
    metaDescription.name = "description";
    metaDescription.content = "La tienda de CocinApp donde podras comprar las herramientas para tus recetas."
    document.getElementsByTagName('head')[0].appendChild(metaDescription);
    
    return () => {
        document.getElementsByTagName('head')[0].removeChild(metaDescription);
    };
}, []);

  return (
    <div className='container'>
        <h2 className='title'>La tienda de CocinApp</h2>
        <div className='cont-soon'>
            <img src={image_soon} alt="proximamente" className='image-soon'/>
        </div>
        <p className='soon-text'>Proximamente tienda de CocinApp</p>
        <a href="/" className='btn_home'>Volver al inicio</a>
    </div>
  )
}

export default Tienda
