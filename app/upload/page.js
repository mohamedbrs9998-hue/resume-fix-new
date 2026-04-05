"use client";

import { useEffect, useState } from "react";

export default function UploadPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;

    if (!token) {
      console.error("Missing NEXT_PUBLIC_PADDLE_CLIENT_TOKEN");
      return;
    }

    function initPaddle() {
      if (!window.Paddle) return;

      if (process.env.NEXT_PUBLIC_PADDLE_ENV === "sandbox") {
        window.Paddle.Environment.set("sandbox");
      }

      window.Paddle.Initialize({
        token: token,
      });

      setReady(true);
    }

    if (window.Paddle) {
      initPaddle();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.async = true;
    script.onload = initPaddle;
    document.body.appendChild(script);
  }, []);

  function openCheckout() {
    const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;

    if (!window.Paddle) {
      alert("Paddle not loaded");
      return;
    }

    if (!priceId) {
      alert("Missing price ID");
      return;
    }

    window.Paddle.Checkout.open({
      items: [
        {
          priceId: priceId,
          quantity: 1,
        },
      ],
      settings: {
        displayMode: "overlay",
      },
    });
  }

  return (
    <main
      style={{
        padding: "40px",
        color: "white",
        background: "#0b1220",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontSize: "48px", fontWeight: "700", marginBottom: "12px" }}>
        Upload CV
      </h1>

      <p style={{ marginBottom: "20px" }}>Pro</p>

<a
  href="https://payhip.com/order?link=J7W4G"
  target="_blank"
  rel="noreferrer"
  style={{
    display: "inline-block",
    padding: "12px 18px",
    borderRadius: "10px",
    border: "none",
    background: "#ffffff",
    color: "#111827",
    fontWeight: "700",
    textDecoration: "none",
    cursor: "pointer",
  }}
>
  Continue to payment
</a>    </main>
  );
}
