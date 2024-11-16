import React, { useEffect, useState } from "react";
import "./product.css";
import cartAdd from '../../assets/addcart.svg';
import { useAlert } from '../../context/messageContext';

const Producto = ({ nombre, imagen, precio, id, agregarAlCarrito, descripcion, setCantidadTotalProductos, cantidadTotalProductos }) => {
  const [movil, setMovil] = useState();
  const [productos, setProductos] = useState(0); // Estado para persistir la cantidad de productos
  const {showAlert} = useAlert();

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
    if (navigator.vibrate){
      navigator.vibrate(200); // 200ms de vibracion
      if (cantidadTotalProductos < 6){
        const audioAgregar = new Audio('src/assets/AgregarAlCarrito.mp3');
        audioAgregar.play();
        localProductos();
        const nuevoProducto = { id, nombre, precio, imagen, descripcion };
        agregarAlCarrito(nuevoProducto); // Llamamos a la función del padre
      }else{
        const audioError = new Audio('src/assets/WarningSound.mp3');
        audioError.play();
        showAlert("No puedes agregar mas de 6 productos", "warning");
      }
    }
    else {
      if (cantidadTotalProductos < 6){
        const audioAgregar = new Audio('src/assets/AgregarAlCarrito.mp3');
        audioAgregar.play();
        localProductos();
        const nuevoProducto = { id, nombre, precio, imagen, descripcion };
        agregarAlCarrito(nuevoProducto); // Llamamos a la función del padre
      }else{
        const audioError = new Audio('src/assets/WarningSound.mp3');
        audioError.play();
        showAlert("No puedes agregar mas de 6 productos", "warning");
      }
    }
  };

  useEffect(()=>{
    console.log(cantidadTotalProductos);
  },[cantidadTotalProductos])

  const localProductos = () => {
    if (productos === 0) {
      setProductos(1);
      setCantidadTotalProductos(1);
    } else if (productos > 0 && productos < 6) {
      const nuevosProductos = productos + 1;
      setProductos(nuevosProductos);
      setCantidadTotalProductos(nuevosProductos);
    } else {
      console.log("No puedes tener más de 6 productos simultáneos.");
      return;
    }
  };

  return (
    <div className="product-card">
      <h2 className="text-title">{nombre}</h2>
      <div className="product-card-details">
        <img src={imagen} width={'80px'} className="product-card-img" />
        <p className="text-body">{descripcion}</p>
        <p className="card-price">US${precio}</p>
      </div>
      <button className="product-card-button" onClick={agregarProducto}>
        Agregar al Carrito
      </button>
    </div>
  );
};

export default Producto;
