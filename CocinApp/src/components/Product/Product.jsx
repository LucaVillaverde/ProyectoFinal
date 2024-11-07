import React from "react";
import "./product.css";
import cartAdd from '../../assets/addcart.svg';


const Producto = ({ nombre, imagen, precio, id, agregarAlCarrito, descripcion }) => {
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
    <div className="producto">
      <div className="cont">
        <img
          src="https://placehold.co/100x100/000000/FFFFFF/png"
          alt={imagen}
          className="imagenProducto"
        />
        <p>Precio: ${precio}</p>
      </div>
      <div className="contenidoProducto">
        <h2 className='producto-titulo'>{nombre}</h2>
        <div className="descripcion">
          <p>
            {descripcion}
          </p>
        </div>
      </div>
      <button onClick={agregarProducto} className="btnProducto">
        <img
          src={cartAdd}
          className='cartShopping'
          alt="Carrito de compras para sumar"
        />
      </button>
    </div>
  );
};
export default Producto;