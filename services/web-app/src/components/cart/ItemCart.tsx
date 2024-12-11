import { useState } from "react";
import "./ItemCart.css";

interface ItemCartProps {
  name: string;
  imagePath: string;
  price: number;
  quantity: number;
  isOrderDetail: boolean;
  removeItem: (name: string) => void;
  addItem: (name: string) => void;
}

const ItemCart = ({
  name,
  imagePath,
  price,
  quantity,
  isOrderDetail,
  removeItem,
  addItem,
}: ItemCartProps) => {
  const [quantityDyn, setQuantityDyn] = useState(quantity);

  const removeItemWrapper = () => {
    setQuantityDyn(quantityDyn - 1);
    removeItem(name);
  };

  const addItemWrapper = () => {
    setQuantityDyn(quantityDyn + 1);
    addItem(name);
  };

  return (
    <li className="item-cart">
      <div className="left">
        <img src={imagePath} alt={name}></img>
        <div className="item">
          <p>{name}</p>
          <div className="price-div">
            <p>USD</p>
            <p className="price">${price}</p>
          </div>
        </div>
      </div>

      <div className="right">
        {!isOrderDetail && (
          <svg
            role="button"
            onClick={removeItemWrapper}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="change-item"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M5 12l14 0" />
          </svg>
        )}
        <p>{quantityDyn}</p>
        {!isOrderDetail && (
          <svg
            role="button"
            onClick={addItemWrapper}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            className="change-item"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M12 5l0 14" />
            <path d="M5 12l14 0" />
          </svg>
        )}
      </div>
    </li>
  );
};

export default ItemCart;
