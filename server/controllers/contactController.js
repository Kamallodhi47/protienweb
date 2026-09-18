const { prisma } = require('../services/dbService');

// POST /api/contact — Public: submit a contact form
const submitContact = async (req, res, next) => {
  try {
    const { name, phone, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Invalid email format.' });
    }

    if (prisma) {
      const entry = await prisma.contactSubmission.create({
        data: {
          name: name.trim(),
          phone: phone ? phone.trim() : null,
          email: email.trim().toLowerCase(),
          message: message.trim()
        }
      });
      console.log(`📩 Contact form submitted by "${entry.email}" saved to dev.db!`);
      return res.status(201).json({ success: true, message: 'Your message has been received! We will get back to you soon.' });
    }

    // Memory fallback
    console.log(`📩 Contact form submitted (memory mode) by "${email}"`);
    return res.status(201).json({ success: true, message: 'Your message has been received! We will get back to you soon.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/contact — Admin: get all contact submissions
const getAllContacts = async (req, res, next) => {
  try {
    if (prisma) {
      const contacts = await prisma.contactSubmission.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return res.json({ success: true, count: contacts.length, contacts });
    }
    return res.json({ success: true, count: 0, contacts: [] });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/contact/:id — Admin: delete a contact submission
const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (prisma) {
      await prisma.contactSubmission.delete({ where: { id } });
      return res.json({ success: true, message: 'Contact submission deleted.' });
    }
    return res.json({ success: true, message: 'Deleted (memory mode).' });
  } catch (err) {
    next(err);
  }
};

module.exports = { submitContact, getAllContacts, deleteContact };
