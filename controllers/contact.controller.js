import Contact from "../models/Contact.js";
// POST /api/contacts
export const handleAddContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    console.log("body in create contact", req.body);

    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();

    res
      .status(201)
      .json({ message: "Message sent successfully", contact: newContact });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// GET /api/contacts
export const handleGetContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE /api/contacts/:id
export const handleDeleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedContact = await Contact.findByIdAndDelete(id);

    if (!deletedContact) {
      return res.status(404).json({ error: "Contact not found" });
    }

    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
