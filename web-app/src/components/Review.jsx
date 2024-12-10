import React, { useState } from "react";

const Review = ({ orderId, storeId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleStarClick = (newRating) => {
    setRating(newRating);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };

  const maybeLater = () => {
    localStorage.setItem("savedItems", JSON.stringify([]));
    document.location.href = "/";
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    fetch("/api/rating", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        storeId,
        score: rating,
        comment,
      }),
    })
      .then(() => {
        document.location.href = "/";
        localStorage.setItem("savedItems", JSON.stringify([]));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h3>Rate the store</h3>
        <div>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleStarClick(star)}
              style={{
                color: star <= rating ? "red" : "gray",
                cursor: "pointer",
              }}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <div>
        <h3>Leave a review</h3>
        <textarea
          value={comment}
          onChange={handleCommentChange}
          placeholder="Share your experience with this order..."
        ></textarea>
        <div>
          <button onClick={maybeLater} type="button" className="maybe-later">
            Maybe later
          </button>
          <button type="submit" className="send">
            Send
          </button>
        </div>
      </div>
    </form>
  );
};

export default Review;