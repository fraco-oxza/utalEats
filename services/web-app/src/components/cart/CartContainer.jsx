import React, { useEffect, useState } from 'react';
import ItemCart from './ItemCart';
import "./CartContainer.css";

const CartContainer = ({isOrderDetail}) => {
  const [savedItems, setSavedItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);

  const increaseTotalPrice = (q) => {
    setTotalPrice(totalPrice + q);
  } ;

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('savedItems')) || [];
    setSavedItems(items);
    setTotalPrice(items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
      }, 0));
  }, []);

  return (
    <div className="container">
        <ul id="cart-container">
            {
                savedItems.map((item, index) => (
                <ItemCart
                    key={index}
                    name={item.name}
                    imagePath={item.imagePath}
                    price={item.price}
                    quantity={item.quantity}
                    isOrderDetail={isOrderDetail}
                    increaseTotalPrice={increaseTotalPrice}
                />
                ))
            }
        </ul>
        <div className='priceText'>
            <p>Total ${totalPrice.toFixed(2)}</p>
        </div>
    </div>
  );
};

export default CartContainer;
