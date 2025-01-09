import React, { useState } from "react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

const menuItems = ["Pizza", "Burger", "Pasta", "Salad", "Sushi", "Steak"];

function CardFunction({ index, orders, onSaveOrder, onClearOrder }) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState(orders);

  const handleToggleDialog = () => {
    setOpen(!open);
    setSelectedItems(orders); // Reset selectedItems when the dialog opens
  };

  const handleCheckboxChange = (item) => {
    setSelectedItems((prev) => {
      // Log the selectedItems to debug
      console.log("Before change - selectedItems:", prev);

      // Ensure selectedItems is always an array
      const updatedSelectedItems = Array.isArray(prev) ? prev : [];
      console.log(
        "After ensuring array - selectedItems:",
        updatedSelectedItems
      );

      return updatedSelectedItems.includes(item)
        ? updatedSelectedItems.filter((i) => i !== item)
        : [...updatedSelectedItems, item];
    });
  };

  const handleSave = () => {
    onSaveOrder(selectedItems);
    setOpen(false);
  };

  const handleClear = () => {
    onClearOrder();
    setSelectedItems([]); // Reset selectedItems when clearing the order
  };

  return (
    <>
      <CardContent sx={{ textAlign: "center" }}>
        <Typography
          gutterBottom
          sx={{
            color: "text.primary",
            fontSize: 18,
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          Table {index}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
          {orders?.length > 0 ? `Order: ${orders.join(", ")}` : "No orders yet"}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: "center" }}>
        <Button variant="contained" size="small" onClick={handleToggleDialog}>
          Add Order
        </Button>
        <Button
          variant="outlined"
          size="small"
          color="error"
          onClick={handleClear}
        >
          Clear
        </Button>
      </CardActions>

      {/* Dialog for menu selection */}
      <Dialog open={open} onClose={handleToggleDialog}>
        <DialogTitle>Select Menu Items for Table {index}</DialogTitle>
        <DialogContent>
          {menuItems?.map((item) => (
            <FormControlLabel
              key={item}
              control={
                <Checkbox
                  checked={
                    Array.isArray(selectedItems) && selectedItems.includes(item)
                  } // Ensure selectedItems is an array
                  onChange={() => handleCheckboxChange(item)}
                />
              }
              label={item}
            />
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggleDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default function OutlinedCard({
  index,
  orders,
  onSaveOrder,
  onClearOrder,
}) {
  return (
    <Box sx={{ maxWidth: 350 }}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 2,
          boxShadow: 2,
          "&:hover": {
            boxShadow: 6,
            transform: "scale(1.03)",
            transition: "0.3s",
          },
        }}
      >
        <CardFunction
          index={index}
          orders={orders}
          onSaveOrder={onSaveOrder}
          onClearOrder={onClearOrder}
        />
      </Card>
    </Box>
  );
}
