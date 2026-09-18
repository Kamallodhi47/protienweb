const { prisma, memoryDb } = require('../services/dbService');

const getProducts = async (req, res, next) => {
  try {
    const { category, search, isPreset } = req.query;

    if (prisma) {
      const where = {};
      if (category) where.category = category.toUpperCase();
      if (isPreset !== undefined) where.isPreset = isPreset === 'true';
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
        ];
      }

      const list = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
      return res.json({ success: true, count: list.length, products: list });
    }

    let list = [...memoryDb.products];

    if (category) {
      list = list.filter(p => p.category.toUpperCase() === category.toUpperCase());
    }

    if (isPreset !== undefined) {
      const isP = isPreset === 'true';
      list = list.filter(p => p.isPreset === isP);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
    }

    return res.json({ success: true, count: list.length, products: list });
  } catch (err) {
    next(err);
  }
};

const getJuices = async (req, res, next) => {
  try {
    const { search } = req.query;

    if (prisma) {
      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { ingredients: { contains: search } },
          { specification: { contains: search } },
          { description: { contains: search } }
        ];
      }
      const list = await prisma.juice.findMany({ where, orderBy: { createdAt: 'desc' } });
      return res.json({ success: true, count: list.length, juices: list });
    }

    let list = [...memoryDb.juices];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(j => 
        j.name.toLowerCase().includes(q) || 
        (j.ingredients && j.ingredients.toLowerCase().includes(q)) ||
        (j.specification && j.specification.toLowerCase().includes(q)) ||
        (j.description && j.description.toLowerCase().includes(q))
      );
    }

    return res.json({ success: true, count: list.length, juices: list });
  } catch (err) {
    next(err);
  }
};

const createJuice = async (req, res, next) => {
  try {
    const { name, ingredients, specification, price, description, image, protein, calories, carbs, fat, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Juice Name and Rate (Price) are required.' });
    }

    const jStock = Number(stock || 50);
    const jStatus = jStock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
    const juiceId = `juc-${Date.now()}`;

    const juiceData = {
      id: juiceId,
      name,
      ingredients: ingredients || '',
      specification: specification || '',
      description: description || '',
      price: Number(price),
      image: image || 'https://images.unsplash.com/photo-1613478223719-2ab802602423',
      protein: Number(protein || 1.0),
      calories: Number(calories || 80),
      carbs: Number(carbs || 18),
      fat: Number(fat || 0.2),
      stock: jStock,
      status: jStatus
    };

    if (prisma) {
      const created = await prisma.juice.create({ data: juiceData });
      memoryDb.juices.unshift(created);
      return res.status(201).json({
        success: true,
        message: 'Juice created successfully and saved to SQLite Database!',
        juice: created
      });
    }

    const newJuice = {
      ...juiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memoryDb.juices.unshift(newJuice);

    return res.status(201).json({
      success: true,
      message: 'Juice created successfully!',
      juice: newJuice
    });
  } catch (err) {
    next(err);
  }
};

const updateJuice = async (req, res, next) => {
  try {
    const { id } = req.params;

    let updatedFields = {};
    const numericFields = ['price', 'protein', 'calories', 'carbs', 'fat', 'stock'];
    const stringFields = ['name', 'ingredients', 'specification', 'description', 'image', 'status'];

    numericFields.forEach(f => {
      if (req.body[f] !== undefined) updatedFields[f] = Number(req.body[f]);
    });
    stringFields.forEach(f => {
      if (req.body[f] !== undefined) updatedFields[f] = req.body[f];
    });

    if (updatedFields.stock !== undefined) {
      updatedFields.status = updatedFields.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
    }

    if (prisma) {
      const existing = await prisma.juice.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Juice not found.' });
      }

      const updated = await prisma.juice.update({ where: { id }, data: updatedFields });
      const idx = memoryDb.juices.findIndex(j => j.id === id);
      if (idx !== -1) memoryDb.juices[idx] = { ...memoryDb.juices[idx], ...updated };

      return res.json({ success: true, message: 'Juice updated successfully in SQLite Database!', juice: updated });
    }

    const juice = memoryDb.juices.find(j => j.id === id);
    if (!juice) {
      return res.status(404).json({ success: false, message: 'Juice not found.' });
    }

    Object.assign(juice, updatedFields);
    juice.updatedAt = new Date();

    return res.json({
      success: true,
      message: 'Juice updated successfully!',
      juice
    });
  } catch (err) {
    next(err);
  }
};

const deleteJuice = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const existing = await prisma.juice.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Juice not found.' });
      }

      const removed = await prisma.juice.delete({ where: { id } });
      const idx = memoryDb.juices.findIndex(j => j.id === id);
      if (idx !== -1) memoryDb.juices.splice(idx, 1);

      return res.json({ success: true, message: 'Juice deleted successfully from Database!', juice: removed });
    }

    const idx = memoryDb.juices.findIndex(j => j.id === id);
    if (idx !== -1) {
      const removed = memoryDb.juices.splice(idx, 1);
      return res.json({ success: true, message: 'Juice deleted successfully!', juice: removed[0] });
    }
    return res.status(404).json({ success: false, message: 'Juice not found.' });
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, description, image, price, protein, calories, carbs, fat, category, isPreset, stock } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required.' });
    }

    const pStock = Number(stock || 50);
    const pStatus = pStock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
    const prodId = `prod-${Date.now()}`;

    const prodData = {
      id: prodId,
      name,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999',
      price: Number(price),
      protein: Number(protein || 0),
      calories: Number(calories || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      category: category.toUpperCase(),
      isPreset: isPreset !== undefined ? Boolean(isPreset) : true,
      stock: pStock,
      status: pStatus
    };

    if (prisma) {
      const created = await prisma.product.create({ data: prodData });
      memoryDb.products.unshift(created);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully and saved to SQLite Database!',
        product: created
      });
    }

    const newProd = {
      ...prodData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memoryDb.products.unshift(newProd);
    return res.status(201).json({ success: true, message: 'Product created successfully!', product: newProd });
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    let updatedFields = {};
    const numericFields = ['price', 'protein', 'calories', 'carbs', 'fat', 'stock'];
    const stringFields = ['name', 'description', 'image', 'category', 'status'];

    numericFields.forEach(f => {
      if (req.body[f] !== undefined) updatedFields[f] = Number(req.body[f]);
    });
    stringFields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'category' || f === 'status') updatedFields[f] = req.body[f].toUpperCase();
        else updatedFields[f] = req.body[f];
      }
    });

    if (req.body.isPreset !== undefined) updatedFields.isPreset = Boolean(req.body.isPreset);
    if (updatedFields.stock !== undefined) {
      updatedFields.status = updatedFields.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
    }

    if (prisma) {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const updated = await prisma.product.update({ where: { id }, data: updatedFields });
      const idx = memoryDb.products.findIndex(p => p.id === id);
      if (idx !== -1) memoryDb.products[idx] = { ...memoryDb.products[idx], ...updated };

      return res.json({ success: true, message: 'Product updated successfully in SQLite Database!', product: updated });
    }

    let prod = memoryDb.products.find(p => p.id === id);
    if (!prod) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    Object.assign(prod, updatedFields);
    prod.updatedAt = new Date();

    return res.json({
      success: true,
      message: 'Product updated successfully!',
      product: prod
    });
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const existing = await prisma.product.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const removed = await prisma.product.delete({ where: { id } });
      const idx = memoryDb.products.findIndex(p => p.id === id);
      if (idx !== -1) memoryDb.products.splice(idx, 1);

      return res.json({ success: true, message: 'Product deleted successfully from Database!', product: removed });
    }

    let idx = memoryDb.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const removed = memoryDb.products.splice(idx, 1);
      return res.json({ success: true, message: 'Product deleted successfully!', product: removed[0] });
    }

    return res.status(404).json({ success: false, message: 'Product not found.' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getJuices,
  createJuice,
  updateJuice,
  deleteJuice,
  createProduct,
  updateProduct,
  deleteProduct
};
