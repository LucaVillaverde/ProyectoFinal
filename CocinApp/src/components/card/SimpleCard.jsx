import React from "react";
import "./card.css";

const SimpleCard = ({ tiempo, image, title, author, dificulty, category }) => {
    return (
            <>
                <div className="card-content-image">
                    <img src={image} alt={title} className="card-image" />
                </div>
                <div className="card-content">
                    <h2 className="title-card">{title}</h2>
                    <p className="card-subtitle">
                        <span className="card-title">Autor: </span>
                        {author}
                    </p>
                    <p className="card-subtitle">
                        <span className="card-title">Categoria: </span>
                        {category}
                    </p>
                    <p className="card-subtitle">
                        <span className="card-title">Dificultad: </span>
                        {dificulty}
                    </p>
                    <p className="card-subtitle">
                        <span className="card-title">Tiempo: </span>
                        {tiempo}
                    </p>
                </div>
            </>
    );
};

export default SimpleCard;
