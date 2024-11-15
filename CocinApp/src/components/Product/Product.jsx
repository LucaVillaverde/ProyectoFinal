import React, { useEffect, useState } from "react";
import "./product.css";
import cartAdd from '../../assets/addcart.svg';


const Producto = ({ nombre, imagen, precio, id, agregarAlCarrito, descripcion}) => {
  const [movil, setMovil] = useState();

  useEffect(() => {
    const determinarAncho = (ancho) => (ancho > 720 ? 1 : 0);

    const verificarAncho = () => {
        const anchoBoolean = determinarAncho(window.innerWidth);
        if (anchoBoolean === 1) {
            setMovil(false);
        } else {
            setMovil(true);
        }
    };

    verificarAncho();
    window.addEventListener("resize", verificarAncho);

    return () => {
        window.removeEventListener("resize", verificarAncho);
    };
}, []); 

  const agregarProducto = () => {
    localProductos()
    const nuevoProducto = { id, nombre, precio, imagen, descripcion };
    agregarAlCarrito(nuevoProducto); // Llamamos a la función del padre
  };
 // Inicializar productos en localStorage si no existe
if (!localStorage.getItem("productos")) {
  localStorage.setItem("productos", 0);
}

function localProductos() {
  let productos = localStorage.getItem("productos");
  let productosParch = parseInt(productos);

  // Si es NaN (no se pudo convertir a número), reinicializamos a 0
  if (isNaN(productosParch)) {
    productosParch = 0;
  }

  // Verificar si es 0 o actualizar sumando 1
  if (productosParch === 0) {
    localStorage.setItem("productos", 1);
  } else if (productosParch > 0 && productosParch < 20){
    productosParch += 1; // Sumar 1 correctamente
    localStorage.setItem("productos", productosParch);
  } else {
    console.log(`No puedes tener mas de ${productosParch} cantidad de productos simultaneos.`);
  }
}


  return (
    <div className="product-card">
        <h2 className="text-title ">{nombre}</h2>
      <div className="product-card-details">
        <img src={imagen} width={'80px'} className="product-card-img" />
        <p className="text-body">{descripcion}</p>
        <p className="card-price">US${precio}</p>
      </div>
      <button className="product-card-button" onClick={agregarProducto}>Comprar</button>
    </div>
  );
};
export default Producto;