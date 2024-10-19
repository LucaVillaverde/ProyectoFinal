import { React, useEffect } from 'react'
import '../index.css'
import image_404 from '../assets/image_404.png'

const Page404 = () => {
  useEffect(() => {
    const metaDescription = document.createElement('meta');
    document.title = "CocinApp: No Encontrado/a";
    metaDescription.name = "description";
    metaDescription.content = "Pagina de error por no encontrar lo solicitado."
    document.getElementsByTagName('head')[0].appendChild(metaDescription);
    
    return () => {
        document.getElementsByTagName('head')[0].removeChild(metaDescription);
    };
}, []);
  const error = 404;
  console.error('Pagina no encontrada error:', error);
  return (
    <div className='container'>
        <div className='cont-404'>
            <h2 className='title-404' >PAGINA NO ENCONTRADA ERROR: {error}</h2>
            <img src={image_404} alt="No encontrado" className='image-404'/>
        </div>
        <a href="/" className='btn_home'>Volver al inicio</a>
    </div>
  )
}

export default Page404
