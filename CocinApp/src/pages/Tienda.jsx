import React, { useEffect, useState } from "react";
import axios from "axios";
import "../css/tienda.css";
import { useAlert } from '../context/messageContext';
import Product from "../components/Product/Product";
import carritoImg from "../assets/carrito.svg";
import delIco from '../assets/minus.svg';
import addIco from '../assets/add.svg';
import closeCartIco from '../assets/closeCart.svg';
import discordIn from '../assets/Discord_Join.mp3';
import discordLeave from '../assets/Discord_Leave.mp3';
import audioSuccess from "/src/assets/SuccessSound.mp3";
import audioError from "/src/assets/DangerSound.mp3";
import audioWarning from '/src/assets/WarningSound.mp3';

const Tienda = ({ setDineroUser }) => {
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
  const [disabledMessage, setDisabledMessage] = useState(null);
  let aPagar = 0;

  useEffect(() => {
    listaProductos();
  },[])

  useEffect(() => {
    if(carrito.length === 0){
      setDisabled(true);
      setDisabledMessage("Seleccione Algun Producto");
    }else{
      setDisabled(false);
      setDisabledMessage("Comprar")
    }
  },[carrito])

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
    setDisabledMessage("Procesando Compra");

    try {
      const compraResponse = await axios.post("/api/comprar", { costo: aPagar });
      if (compraResponse.status === 200) {
        showAlert(compraResponse.data.message, "successful");

        // Sonido de éxito
        const audioOK = new Audio(audioSuccess);
        audioOK.play();
        if (navigator.vibrate) navigator.vibrate([200, 300, 200]);

        // Actualizar dinero del usuario
        const response = await axios.post("/api/dinero-cantidad", {});
        if (response.status === 200) {
          setDineroUser(response.data.money);
          setTimeout(() => location.reload(), 2000);
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Error de conexión";
      showAlert(errorMessage, "danger");
      setDisabledMessage("Error...");
      setTimeout(() => {setDisabledMessage("Comprar"); setDisabled(false)}, 1000)
      // Sonido de error
      const audioWrong = new Audio(audioError);
      audioWrong.play();
      if (navigator.vibrate) navigator.vibrate(300);
    }
  };

  const quitarDelCarrito = (id) => {
    setCarrito((carritoActual) => {
      const nuevoCarrito = carritoActual.map((item) => 
        item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
      ).filter((item) => item.cantidad > 0); // Filtrar productos con cantidad > 0

      // Actualizar el total de productos en el estado global
      const nuevaCantidadTotal = nuevoCarrito.reduce(
        (total, item) => total + item.cantidad,
        0
      );
      setCantidadTotalProductos(nuevaCantidadTotal);

      return nuevoCarrito;
    });
  };

  const agregarAlCarrito = (producto) => {
    const audioWarn = new Audio(audioWarning);
    setCarrito((carritoActual) => {
      // Calculamos la cantidad total actual de productos en el carrito
      const nuevaCantidadTotal = carritoActual.reduce(
        (total, item) => total + item.cantidad,
        0
      );
  
      // Si ya alcanzamos el límite, mostramos una alerta y no hacemos cambios
      if (nuevaCantidadTotal >= 6) {
        audioWarn.play();
        showAlert("No puedes agregar más productos", "warning");
        return carritoActual; // Devolver el carrito sin cambios
      }

      const audioAgregadoLista = new Audio(discordIn);
      audioAgregadoLista.play();
  
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
          {listaCarrito ? (
            <img id="closeCartIco" src={closeCartIco}></img>
          ) : (
            <>
            <img
            id="carrito"
            src={carritoImg}
            alt="Carrito de compras"
          >
          </img>
          <span className="carritoCantidad">{cantidadTotalProductos}</span>
          </>
          )}
        </button>
      </div>
      <div className="backgroundlistaCarrito" id="bglistaPopOver">
        <div className="listaCarrito">
          <h3>Lista de compras</h3>
          <div className="productos">
            {carrito.map(({ id, nombre, precio, cantidad }, index) => (
              <div className="productosListado" key={index}>
                <span className="nombreProdList">{nombre}</span>
                <span className="precioProdList">${precio}</span>
                <span className="cantidadProdList">({cantidad}x)</span>
                <button
                    className="btnAgregar"
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(100); // 100ms de vibración
                      const producto = carrito.find((item) => item.id === id);
                      agregarAlCarrito(producto);
                    }}
                  >
                    <img src={addIco}></img>
                </button>
                <button
                  className="btnQuitar"
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(100); // 100ms de vibración
                    const audioBorrado = new Audio(discordLeave);
                    audioBorrado.play();
                    quitarDelCarrito(id)
                  }}
                >
                  <img src={delIco}></img>
                </button>
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
            {disabledMessage}
          </button>
        </div>
      </div>
      {productosData === null ? (
        <h2>Cargando productos...</h2>
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
