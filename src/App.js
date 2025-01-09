import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography, AppBar, Toolbar, Box } from "@mui/material";
import OutlinedCard from "./components/Card";

const BASE_URL = process.env.REACT_APP_BACKEND_URL;

function App() {
  const cardsCount = 16;
  const [orders, setOrders] = useState(Array(cardsCount).fill([])); // Always initialize with empty arrays

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`${BASE_URL}/orders`);
        if (response.ok) {
          const data = await response.json();
          console.log("Fetched orders:", data);

          // Initialize orders state to be an array of arrays
          setOrders(
            Array(cardsCount)
              .fill([]) // Initialize all orders as empty arrays
              .map((_, index) => {
                // Find the order for the current table number
                const tableOrder = data.find(
                  (order) => order.table_number === index + 1
                );
                return tableOrder ? tableOrder.orders : []; // Return the orders array if found
              })
          );
        } else {
          console.error("Error fetching orders");
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();

    // Establish WebSocket connection
    const socket = new WebSocket(`${BASE_URL}/ws`);
    socket.onmessage = (event) => {
      let updatedOrders;
      try {
        updatedOrders = JSON.parse(event.data);
        if (!Array.isArray(updatedOrders)) {
          console.error("WebSocket data is not an array:", updatedOrders);
          return;
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
        return;
      }

      console.log("WebSocket update:", updatedOrders);

      // Update state with WebSocket data
      setOrders(
        Array(cardsCount)
          .fill([]) // Ensure all orders are initialized as empty arrays
          .map((_, index) => {
            const tableOrder = updatedOrders.find(
              (order) => order.table_number === index + 1
            );
            return tableOrder ? tableOrder.orders : [];
          })
      );
    };
  }, []);

  // Fallback for when orders data might not be loaded yet
  const ordersToRender =
    orders?.length === cardsCount ? orders : Array(cardsCount).fill([]);

  const handleSaveOrder = async (index, selectedItems) => {
    const tableNumber = index + 1;

    try {
      const response = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableNumber, orders: selectedItems }),
      });

      if (!response.ok) {
        throw new Error("Failed to save order.");
      }

      // Optimistic update for orders
      const updatedOrders = [...orders];
      updatedOrders[index] = selectedItems;
      setOrders(updatedOrders);
    } catch (error) {
      console.error(error);
      alert("Error saving order.");
    }
  };

  const handleClearOrder = async (index) => {
    const tableNumber = index + 1;

    try {
      const response = await fetch(`${BASE_URL}/orders/${tableNumber}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to clear order.");
      }

      // Optimistic update for clearing orders
      const updatedOrders = [...orders];
      updatedOrders[index] = [];
      setOrders(updatedOrders);
    } catch (error) {
      console.error(error);
      alert("Error clearing order.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Table Management
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper
        sx={{
          margin: 2,
          p: 4,
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{ mb: 4, textAlign: "center", fontWeight: "bold" }}
        >
          Select a Table
        </Typography>
        <Grid container spacing={3}>
          {Array.from({ length: cardsCount }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <OutlinedCard
                index={index + 1}
                orders={ordersToRender[index] || []} // Ensure it's always an array
                onSaveOrder={(selectedItems) =>
                  handleSaveOrder(index, selectedItems)
                }
                onClearOrder={() => handleClearOrder(index)}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box
        sx={{
          p: 2,
          mt: 4,
          bgcolor: "primary.main",
          color: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="body2">
          © 2025 Your Company. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}

export default App;
