import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/tienda.css";
import { useAlert } from '../context/messageContext';
import Product from "../components/Product/Product";
import carritoImg from "../assets/carrito.svg";

const Tienda = () => {
  const {showAlert} = useAlert();
  useEffect(() => {
    const metaDescription = document.createElement("meta");
    document.title = "CocinApp: Tienda";
    metaDescription.name = "description";
    metaDescription.content =
      "La tienda de CocinApp donde podras comprar las herramientas para tus recetas.";
    document.getElementsByTagName("head")[0].appendChild(metaDescription);

    return () => {
      document.getElementsByTagName("head")[0].removeChild(metaDescription);
    };
  }, []);
  //Funciones
  const [carrito, setCarrito] = useState([]);
  const [listaCarrito, setListaCarrito] = useState(false);
  const [cantidadTotalProductos, setCantidadTotalProductos] = useState(0);
  const [productosData, setProductosData] = useState(null);
  const [disabled, setDisabled] = useState(false);
  let aPagar = 0;

  useEffect(() => {
    listaProductos();
  },[])

  const listaProductos = async () => {
    try{
      const productsResponse = await axios.get('/api/productos');
      if (productsResponse.status === 200){
        setProductosData(productsResponse.data.products);
      }
    }catch(error){
      console.error(error);
      // error.response.data.message ? showAlert(error.response.data.message,'warning'):showAlert('Error de conexion','danger');  
    }
  }

  useEffect(() => {
    const bg = document.getElementById("bglistaPopOver");
    if (listaCarrito) {
      bg.style.display = "flex";
    } else {
      bg.style.display = "none";
    }
  }, [listaCarrito]);

  const cambEstado = () => {
    if (listaCarrito) {
      setListaCarrito(false);
    } else {
      setListaCarrito(true);
    }
  };
  const comprar = async () => {
    setDisabled(true);
    if (navigator.vibrate){
      navigator.vibrate(100); // 200ms de vibracion
      try{
        const compraResponse = await axios.post("/api/comprar", {
          costo: aPagar,
        })
        if (compraResponse.status === 200){
          setDisabled(true);
          showAlert(compraResponse.data.message, 'successful');
          const audioSuccess = new Audio('/src/assets/SuccessSound.mp3');
          audioSuccess.play();
          navigator.vibrate([100, 300, 100]);
          setInterval(() => location.reload(), 2000);
        }
      }catch(err){
        setDisabled(false);
        const errorMessage = err.response?.data?.message || 'Error de conexión';
        showAlert(errorMessage, 'danger');
        const audioError = new Audio('/src/assets/DangerSound.mp3');
        audioError.play();
        navigator.vibrate(300);
      }
    } else {
      try{
        const compraResponse = await axios.post("/api/comprar", {
          costo: aPagar,
        })
        if (compraResponse.status === 200){
          showAlert(compraResponse.data.message, 'successful');
          const audioSuccess = new Audio('/src/assets/SuccessSound.mp3');
          audioSuccess.play();
          navigator.vibrate([100, 300, 100]);
          setInterval(() => location.reload(), 2000);
        }
      }catch(err){
        const errorMessage = err.response?.data?.message || 'Error de conexión';
        showAlert(errorMessage, 'danger');
        const audioError = new Audio('/src/assets/DangerSound.mp3');
        audioError.play();
      }
    }
  };

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      // Calculamos la cantidad total actual de productos en el carrito
      const nuevaCantidadTotal = carritoActual.reduce(
        (total, item) => total + item.cantidad,
        0
      );
  
      // Si ya alcanzamos el límite, mostramos una alerta y no hacemos cambios
      if (nuevaCantidadTotal >= 6) {
        showAlert("No puedes agregar más productos", "warning");
        return carritoActual; // Devolver el carrito sin cambios
      }
  
      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id
      );
  
      let nuevoCarrito;
  
      if (productoExistente) {
        // Si el producto ya existe, incrementar su cantidad
        nuevoCarrito = carritoActual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        // Si es un producto nuevo, agregarlo al carrito
        nuevoCarrito = [...carritoActual, { ...producto, cantidad: 1 }];
      }
  
      // Actualizamos el total de productos en el estado global
      setCantidadTotalProductos(nuevaCantidadTotal + 1);
  
      return nuevoCarrito;
    });
  };
  


  return (
    <div className="contentenido">
      <div id="contenedorCarrito">
        <button className="btnCarrito" onClick={cambEstado}>
          <img
            id="carrito"
            src={carritoImg}
            alt="Carrito de compras"
          ></img>
          <span className="carritoCantidad">{cantidadTotalProductos}</span>
        </button>
      </div>
      <div className="backgroundlistaCarrito" id="bglistaPopOver">
        <div className="listaCarrito">
          <h3>Lista de compras</h3>
          <div className="productos">
            {carrito.map(({ nombre, precio, cantidad }, index) => (
              <div className="productosListado" key={index}>
                <span className="nombreProdList">{nombre}</span>
                <span className="precioProdList">${precio}</span> 
                <span className="cantidadProdList">({cantidad}x)</span>
              </div>
            ))}
          </div>

          {/* Calcular el total del carrito */}
          <div>
            {(() => {
              let total = carrito.reduce(
                (acc, { precio, cantidad }) => acc + precio * cantidad,
                0
              );
              aPagar = total;
              return <p>Total del carrito: US${total}</p>; // Mostrar el total
            })()}
          </div>
          <button className="btncomprar" onClick={comprar} disabled={disabled}>
            {disabled ? "Procesando" : "Comprar"}
          </button>
        </div>
      </div>
      {productosData === null ? (
        <h2>No hay productos</h2>
      ) : (
        <div className="contenedorProductos">
        {productosData.map(({ id_product, product_name, product_image, product_price, product_description }) => (
          <Product
            key={id_product}
            id={id_product}
            nombre={product_name}
            imagen={product_image}
            precio={product_price}
            descripcion={product_description}
            agregarAlCarrito={agregarAlCarrito}
            setCantidadTotalProductos={setCantidadTotalProductos}
            cantidadTotalProductos={cantidadTotalProductos}
          />
        ))}
      </div>
      )}
    </div>
  );
};
export default Tienda;
