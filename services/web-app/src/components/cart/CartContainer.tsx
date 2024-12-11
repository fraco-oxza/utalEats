import { useEffect, useState } from "react";
import ItemCart from "./ItemCart";
import "./CartContainer.css";

interface Item {
  name: string;
  imagePath: string;
  price: number;
  quantity: number;
}

const CartContainer = ({ isOrderDetail }: { isOrderDetail: boolean }) => {
  const [savedItems, setSavedItems] = useState([] as Item[]);
  const [totalPrice, setTotalPrice] = useState(0);

  const increaseItem = (name: string) => {
    savedItems.forEach((item) => {
      if (item.name === name) {
        item.quantity++;
      }
    });

    localStorage.setItem("savedItems", JSON.stringify(savedItems));
  };
  const decreaseItem = (name: string) => {
    savedItems.forEach((item, index) => {
      if (item.name === name) {
        item.quantity--;
        if (item.quantity === 0) {
          savedItems.splice(index, 1);
        }
      }
    });

    setSavedItems([...savedItems]);
    localStorage.setItem("savedItems", JSON.stringify(savedItems));
  };

  useEffect(() => {
    const items: Item[] = JSON.parse(localStorage.getItem("savedItems")) || [];
    setSavedItems(items);
    setTotalPrice(
      items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
      }, 0)
    );
  }, []);

  return (
    <div className="container">
      <ul id="cart-container">
        {savedItems.map((item, index) => (
          <ItemCart
            key={index}
            name={item.name}
            imagePath={item.imagePath}
            price={item.price}
            quantity={item.quantity}
            isOrderDetail={isOrderDetail}
            addItem={increaseItem}
            removeItem={decreaseItem}
          />
        ))}
      </ul>
      <div className="priceText">
        <p>Total ${totalPrice.toFixed(2)}</p>
      </div>
    </div>
  );
};

export default CartContainer;
