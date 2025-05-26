import express from "express";

import {
  handleAddContact,
  handleDeleteContact,
  handleGetContacts,
} from "../controllers/contact.controller.js";
const contact_router = express.Router();

contact_router.post("/contact", handleAddContact);
contact_router.get("/contacts", handleGetContacts);
contact_router.delete("/contacts/:id", handleDeleteContact);

export default contact_router;
