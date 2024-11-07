import React, { useEffect, useState } from "react";
import "../css/tienda.css";
// import image_soon from "../assets/PaginaEnConstruccion.png";
import Product from "../components/Product/Product";
import carritoImg from "../assets/carrito.svg";


const Tienda = () => {
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
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("productos");
  });
  let aPagar = 0;

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
  const comprar = ()=>{
    console.log(`Usted ha pagado: ${aPagar}`);
  }

  const agregarAlCarrito = (producto) => {
    setCarrito((carritoActual) => {
      let cantidadTotalProductos = 0;

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
                  item.cantidad < 20 && cantidadTotalProductos < 20
                    ? item.cantidad + 1
                    : item.cantidad,
              }
            : item
        );
      } else {
        // Verificar si al agregar un nuevo producto la cantidad total no supera 20
        return cantidadTotalProductos < 20
          ? [...carritoActual, { ...producto, cantidad: 1 }]
          : carritoActual;
      }
    });
  };

  const Datos = [
    {
      id: 21,
      nombre: "Fefo",
      imagen: "Posible imagen",
      precio: 390,
      descripcion: "El Fefo, que mas queres?",
    },
    {
      id: 22,
      nombre: "Luca",
      imagen: "Posible imagen",
      precio: 330,
      descripcion: "El Luca, que mas queres?",
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
      id: 21,
      nombre: "Fefo",
      imagen: "Posible imagen",
      precio: 390,
      descripcion: "El Fefo, que mas queres?",
    },
    {
      id: 22,
      nombre: "Luca",
      imagen: "Posible imagen",
      precio: 330,
      descripcion: "El Luca, que mas queres?",
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
      id: 21,
      nombre: "Fefo",
      imagen: "Posible imagen",
      precio: 390,
      descripcion: "El Fefo, que mas queres?",
    },
    {
      id: 22,
      nombre: "Luca",
      imagen: "Posible imagen",
      precio: 330,
      descripcion: "El Luca, que mas queres?",
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
    }
  ];

  return (
    <div className='content'>
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
              console.log("Total del carrito:", total); // Para debug, si lo necesitas
              return <p>Total del carrito: ${total}</p>; // Mostrar el total
            })()}
          </div>
          <button className="btncomprar" onClick={comprar}>
            COMPRAR
          </button>
        </div>
      </div>
      <div className="contenedorProductos">
        {Datos.map(({ id, nombre, imagen, precio, descripcion }) => (
          <Product
            key={id}
            id={id}
            nombre={nombre}
            imagen={imagen}
            precio={precio}
            descripcion={descripcion}
            agregarAlCarrito={agregarAlCarrito}
          />
        ))}
      </div>
    </div>
  );
};

export default Tienda;
