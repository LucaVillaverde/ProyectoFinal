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
  const cantidadTotalProductos = localStorage.getItem("productos");
  const [productosData, setProductosData] = useState(null);
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("productos");
  });
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
    try{
      const compraResponse = await axios.post("/api/comprar", {
        costo: aPagar,
      })
      if (compraResponse.status === 200){
        showAlert(compraResponse.data.message, 'successful');
      }
    }catch(err){
      const errorMessage = err.response?.data?.message || 'Error de conexión';
      showAlert(errorMessage, 'danger');
    }
  };

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      let cantidadTotalProductos = 0;

      if (cantidadTotalProductos > 5){
        showAlert("No puedes agregar tanto producto", "warning");
        return;
      }

      // Usar forEach para calcular la cantidad total de productos en el carrito
      carritoActual.forEach((item) => {
        cantidadTotalProductos += item.cantidad;
      });

      const productoExistente = carritoActual.find(
        (item) => item.id === producto.id
      );

      if (productoExistente) {
        return carritoActual.map((item) =>
          item.id === producto.id
            ? {
                ...item,
                // Verifica si la cantidad del producto actual + total no supera 20
                cantidad:
                  item.cantidad < 6 && cantidadTotalProductos < 6
                    ? item.cantidad + 1
                    : item.cantidad,
              }
            : item
        );
      } else {
        // Verificar si al agregar un nuevo producto la cantidad total no supera 20
        return cantidadTotalProductos < 6
          ? [...carritoActual, { ...producto, cantidad: 1 }]
          : carritoActual;
      }
    });
  };

  const Datos = [
    {
      id: 21,
      nombre: "Crock-Pot Olla de cocción lenta manual",
      imagen: "Posible imagen",
      precio: 390,
      descripcion: "Nuestra olla de cocción lenta: sabor sin esfuerzo. ¡Elige la temperatura y listo!",
    },
    {
      id: 22,
      nombre: "Tostadora CocinApp Deluxe",
      imagen: "Posible imagen",
      precio: 330,
      descripcion: "Una tostadora de alta calidad que te brindara unas tostadas crocantes.",
    },
    {
      id: 23,
      nombre: "Nadia",
      imagen: "Posible imagen",
      precio: 100,
      descripcion: "La Nadia, que mas queres?",
    },
    {
      id: 24,
      nombre: "NoPollo",
      imagen: "Posible imagen",
      precio: 743,
      descripcion: "El NoPollo, que mas queres?",
    },
    {
      id: 25,
      nombre: "Fefo",
      imagen: "Posible imagen",
      precio: 390,
      descripcion: "El Fefo, que mas queres?",
    },
    {
      id: 26,
      nombre: "Luca",
      imagen: "Posible imagen",
      precio: 330,
      descripcion: "El Luca, que mas queres?",
    },
    {
      id: 27,
      nombre: "Nadia",
      imagen: "Posible imagen",
      precio: 100,
      descripcion: "La Nadia, que mas queres?",
    },
    {
      id: 28,
      nombre: "NoPollo",
      imagen: "Posible imagen",
      precio: 743,
      descripcion: "El NoPollo, que mas queres?",
    },
    {
      id: 29,
      nombre: "Fefo",
      imagen: "Posible imagen",
      precio: 390,
      descripcion: "El Fefo, que mas queres?",
    },
    {
      id: 30,
      nombre: "Luca",
      imagen: "Posible imagen",
      precio: 330,
      descripcion: "El Luca, que mas queres?",
    },
    {
      id: 31,
      nombre: "Nadia",
      imagen: "Posible imagen",
      precio: 100,
      descripcion: "La Nadia, que mas queres?",
    },
    {
      id: 32,
      nombre: "NoPollo",
      imagen: "Posible imagen",
      precio: 743,
      descripcion: "El NoPollo, que mas queres?",
    },
  ];

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
              <p key={index}>
                {nombre} &nbsp; | &nbsp; ${precio} &nbsp; | &nbsp; ({cantidad}x)
              </p>
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
              return <p>Total del carrito: ${total}</p>; // Mostrar el total
            })()}
          </div>
          <button className="btncomprar" onClick={comprar}>
            COMPRAR
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
          />
        ))}
      </div>
      )}
    </div>
  );
};
export default Tienda;
