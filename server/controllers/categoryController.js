const { prisma, memoryDb } = require('../services/dbService');

const getCategories = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    
    if (prisma) {
      const where = {};
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      const list = await prisma.category.findMany({
        where,
        orderBy: { displayOrder: 'asc' }
      });
      return res.json({ success: true, categories: list });
    }

    let list = [...memoryDb.categories];
    if (isActive !== undefined) {
      const active = isActive === 'true';
      list = list.filter(c => c.isActive === active);
    }
    list.sort((a, b) => a.displayOrder - b.displayOrder);
    
    return res.json({ success: true, categories: list });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, displayOrder, isActive, slug } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const catId = `cat-${Date.now()}`;
    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const data = {
      id: catId,
      name,
      slug: generatedSlug,
      description: description || '',
      image: image || '',
      displayOrder: Number(displayOrder || 0),
      isActive: isActive !== undefined ? Boolean(isActive) : true
    };

    if (prisma) {
      const created = await prisma.category.create({ data });
      memoryDb.categories.push(created);
      return res.status(201).json({ success: true, message: 'Category created successfully!', category: created });
    }

    const newCat = { ...data, createdAt: new Date(), updatedAt: new Date() };
    memoryDb.categories.push(newCat);

    return res.status(201).json({ success: true, message: 'Category created successfully!', category: newCat });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, displayOrder, isActive, slug } = req.body;

    let updatedFields = {};
    if (name !== undefined) updatedFields.name = name;
    if (description !== undefined) updatedFields.description = description;
    if (image !== undefined) updatedFields.image = image;
    if (displayOrder !== undefined) updatedFields.displayOrder = Number(displayOrder);
    if (isActive !== undefined) updatedFields.isActive = Boolean(isActive);
    if (slug !== undefined) updatedFields.slug = slug;

    if (prisma) {
      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ success: false, message: 'Category not found.' });

      const updated = await prisma.category.update({ where: { id }, data: updatedFields });
      
      const idx = memoryDb.categories.findIndex(c => c.id === id);
      if (idx !== -1) memoryDb.categories[idx] = { ...memoryDb.categories[idx], ...updated };

      return res.json({ success: true, message: 'Category updated successfully!', category: updated });
    }

    const cat = memoryDb.categories.find(c => c.id === id);
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });

    Object.assign(cat, updatedFields);
    cat.updatedAt = new Date();

    return res.json({ success: true, message: 'Category updated successfully!', category: cat });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const existing = await prisma.category.findUnique({ where: { id } });
      if (!existing) return res.status(404).json({ success: false, message: 'Category not found.' });

      await prisma.category.delete({ where: { id } });
      
      const idx = memoryDb.categories.findIndex(c => c.id === id);
      if (idx !== -1) memoryDb.categories.splice(idx, 1);

      return res.json({ success: true, message: 'Category deleted successfully!' });
    }

    const idx = memoryDb.categories.findIndex(c => c.id === id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Category not found.' });

    memoryDb.categories.splice(idx, 1);
    return res.json({ success: true, message: 'Category deleted successfully!' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
