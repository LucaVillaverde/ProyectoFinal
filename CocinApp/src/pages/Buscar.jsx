import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

const Buscar = () => {
  useEffect(() => {
    const metaDescription = document.createElement('meta');
    metaDescription.name = "description";
    metaDescription.content = "Pagina buscar de CocinApp, donde puedes encontrar recetas."
    document.getElementsByTagName('head')[0].appendChild(metaDescription);
    
    return () => {
        document.getElementsByTagName('head')[0].removeChild(metaDescription);
    };
}, []);
  const {find} = useParams()
  useEffect(()=>{
    document.title = `CocinApp : Buscando ${find}`
  })
  return (
    <div>
      <h2>BUSCAR [buscar...                   ] OK</h2>
    </div>
  )
}

export default Buscar
