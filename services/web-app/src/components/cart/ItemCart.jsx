import React, {useState, useEffect} from 'react';
import "./ItemCart.css";


const ItemCart = ({name, imagePath, price, quantity, isOrderDetail, increaseTotalPrice}) => {
    const [savedItems, setSavedItems] = useState([]);
    const [quantityDyn, setQuantityDyn] = useState(quantity);

    useEffect(() => {
        setSavedItems(JSON.parse(
            localStorage.getItem("savedItems") || "[]",
        ));
    }, []);

    const addItemToCart = () => {
        const existingItem = savedItems.find((item) => item.name === name);
        existingItem.quantity += 1;
        increaseTotalPrice(existingItem.price);
        setQuantityDyn(existingItem.quantity);
        setSavedItems(savedItems);
        localStorage.setItem("savedItems", JSON.stringify(savedItems));
    };

    const removeItemFromCart = () => {
        const existingItem = savedItems.find((item) => item.name === name);
        if (existingItem.quantity <= 1) {
            const updatedItems = savedItems.filter(item => item.name !== name);
            setSavedItems(updatedItems);
            localStorage.setItem('savedItems', JSON.stringify(updatedItems));
            window.location.reload();
        } else {
            existingItem.quantity -= 1;
            increaseTotalPrice(-existingItem.price);
            setQuantityDyn(existingItem.quantity);
            setSavedItems(savedItems);
            localStorage.setItem("savedItems", JSON.stringify(savedItems));
        }
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
            {!isOrderDetail && 
            <div className="right">
                <svg role="button" onClick={removeItemFromCart} xmlns="http://www.w3.org/2000/svg"  width="24"  height="24" 
                viewBox="0 0 24 24"  fill="none"  stroke="currentColor" 
                stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round" 
                className="change-item">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 12l14 0" /></svg>
                <p>{quantityDyn}</p>
                <svg role="button" onClick={addItemToCart} xmlns="http://www.w3.org/2000/svg"  width="24"  height="24" 
                viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2" 
                stroke-linecap="round"  stroke-linejoin="round" 
                className="change-item">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>
            </div>}
        </li>
    );
};

export default ItemCart;