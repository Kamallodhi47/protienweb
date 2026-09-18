const { prisma, memoryDb } = require('../services/dbService');

const getIngredients = async (req, res, next) => {
  try {
    const { category, search, status } = req.query;

    if (prisma) {
      const where = {};
      if (category) {
        where.category = category.toUpperCase();
      }
      if (status) {
        where.status = status.toUpperCase();
      }
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { specification: { contains: search } },
          { description: { contains: search } }
        ];
      }

      const list = await prisma.ingredient.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      });
      return res.json({
        success: true,
        count: list.length,
        ingredients: list
      });
    }

    let list = [...memoryDb.ingredients];

    if (category) {
      list = list.filter(i => i.category.toUpperCase() === category.toUpperCase());
    }

    if (status) {
      list = list.filter(i => i.status.toUpperCase() === status.toUpperCase());
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => 
        i.name.toLowerCase().includes(q) || 
        (i.specification && i.specification.toLowerCase().includes(q)) ||
        (i.description && i.description.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: list.length,
      ingredients: list
    });
  } catch (err) {
    next(err);
  }
};

const getIngredientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const ing = await prisma.ingredient.findUnique({ where: { id } });
      if (!ing) {
        return res.status(404).json({ success: false, message: 'Ingredient not found.' });
      }
      return res.json({ success: true, ingredient: ing });
    }

    const ing = memoryDb.ingredients.find(i => i.id === id);
    if (!ing) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }
    return res.json({ success: true, ingredient: ing });
  } catch (err) {
    next(err);
  }
};

const createIngredient = async (req, res, next) => {
  try {
    const { name, category, price, weight, protein, calories, carbs, fat, specification, description, image, stock } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Fruit/Ingredient Name and Rate (Price) are required.' });
    }

    const ingId = `ing-${Date.now()}`;
    const initialStock = Number(stock || 100);
    const initialStatus = initialStock <= 0 ? 'OUT_OF_STOCK' : initialStock < 20 ? 'LOW_STOCK' : 'AVAILABLE';

    const ingredientData = {
      id: ingId,
      name,
      category: (category || 'FRUITS').toUpperCase(),
      specification: specification || '',
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6',
      price: Number(price),
      weight: Number(weight || 100),
      protein: Number(protein || 0),
      calories: Number(calories || 0),
      carbs: Number(carbs || 0),
      fat: Number(fat || 0),
      stock: initialStock,
      status: initialStatus
    };

    if (prisma) {
      const created = await prisma.ingredient.create({
        data: ingredientData
      });

      await prisma.inventoryLog.create({
        data: {
          id: `log-${Date.now()}`,
          ingredientId: created.id,
          actionType: 'ADD',
          quantity: created.stock,
          note: 'Initial fruit/ingredient created'
        }
      }).catch(err => console.log('Log save warning:', err.message));

      memoryDb.ingredients.unshift(created);

      return res.status(201).json({
        success: true,
        message: 'Fruit/Ingredient created successfully and saved to SQLite Database!',
        ingredient: created
      });
    }

    const newIng = {
      ...ingredientData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    memoryDb.ingredients.unshift(newIng);

    memoryDb.inventoryLogs.unshift({
      id: `log-${Date.now()}`,
      ingredientId: newIng.id,
      actionType: 'ADD',
      quantity: newIng.stock,
      note: 'Initial fruit/ingredient created',
      createdAt: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Fruit/Ingredient created successfully!',
      ingredient: newIng
    });
  } catch (err) {
    next(err);
  }
};

const updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;

    let updatedFields = {};
    const numericFields = ['price', 'weight', 'protein', 'calories', 'carbs', 'fat', 'stock'];
    const stringFields = ['name', 'category', 'specification', 'description', 'image', 'status'];

    numericFields.forEach(f => {
      if (req.body[f] !== undefined) updatedFields[f] = Number(req.body[f]);
    });

    stringFields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'category' || f === 'status') {
          updatedFields[f] = req.body[f].toUpperCase();
        } else {
          updatedFields[f] = req.body[f];
        }
      }
    });

    if (updatedFields.stock !== undefined) {
      if (updatedFields.stock <= 0) updatedFields.status = 'OUT_OF_STOCK';
      else if (updatedFields.stock < 20) updatedFields.status = 'LOW_STOCK';
      else updatedFields.status = 'AVAILABLE';
    }

    if (prisma) {
      const existing = await prisma.ingredient.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Ingredient not found.' });
      }

      const updated = await prisma.ingredient.update({
        where: { id },
        data: updatedFields
      });

      const idx = memoryDb.ingredients.findIndex(i => i.id === id);
      if (idx !== -1) memoryDb.ingredients[idx] = { ...memoryDb.ingredients[idx], ...updated };

      return res.json({
        success: true,
        message: 'Fruit/Ingredient updated successfully in SQLite Database!',
        ingredient: updated
      });
    }

    const ing = memoryDb.ingredients.find(i => i.id === id);
    if (!ing) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }

    Object.assign(ing, updatedFields);
    ing.updatedAt = new Date();

    return res.json({
      success: true,
      message: 'Fruit/Ingredient updated successfully!',
      ingredient: ing
    });
  } catch (err) {
    next(err);
  }
};

const deleteIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const existing = await prisma.ingredient.findUnique({ where: { id } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Ingredient not found.' });
      }

      // Delete logs associated with ingredient first if cascading is required
      await prisma.inventoryLog.deleteMany({ where: { ingredientId: id } }).catch(() => {});

      const removed = await prisma.ingredient.delete({ where: { id } });

      const idx = memoryDb.ingredients.findIndex(i => i.id === id);
      if (idx !== -1) memoryDb.ingredients.splice(idx, 1);

      console.log(`🗑️ Ingredient persistent delete: ${removed.name} (${removed.id}) deleted from dev.db!`);

      return res.json({
        success: true,
        message: 'Fruit/Ingredient deleted successfully from Database!',
        ingredient: removed
      });
    }

    const idx = memoryDb.ingredients.findIndex(i => i.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }

    const removed = memoryDb.ingredients.splice(idx, 1);
    return res.json({
      success: true,
      message: 'Fruit/Ingredient deleted successfully!',
      ingredient: removed[0]
    });
  } catch (err) {
    next(err);
  }
};

const refillStock = async (req, res, next) => {
  try {
    const { ingredientId, quantity, note } = req.body;
    const qty = Number(quantity);

    if (prisma) {
      const existing = await prisma.ingredient.findUnique({ where: { id: ingredientId } });
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Ingredient not found.' });
      }

      const newStock = existing.stock + qty;
      const newStatus = newStock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';

      const updated = await prisma.ingredient.update({
        where: { id: ingredientId },
        data: { stock: newStock, status: newStatus }
      });

      const log = await prisma.inventoryLog.create({
        data: {
          id: `log-${Date.now()}`,
          ingredientId: updated.id,
          actionType: 'REFILL',
          quantity: qty,
          note: note || 'Stock refilled by admin'
        }
      });

      const idx = memoryDb.ingredients.findIndex(i => i.id === ingredientId);
      if (idx !== -1) memoryDb.ingredients[idx] = { ...memoryDb.ingredients[idx], ...updated };

      return res.json({
        success: true,
        message: `Refilled ${qty} units for ${updated.name}!`,
        ingredient: updated,
        log
      });
    }

    const ing = memoryDb.ingredients.find(i => i.id === ingredientId);
    if (!ing) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }

    ing.stock += qty;
    ing.status = ing.stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';
    ing.updatedAt = new Date();

    const log = {
      id: `log-${Date.now()}`,
      ingredientId: ing.id,
      actionType: 'REFILL',
      quantity: qty,
      note: note || 'Stock refilled by admin',
      createdAt: new Date()
    };
    memoryDb.inventoryLogs.unshift(log);

    return res.json({
      success: true,
      message: `Refilled ${qty} units for ${ing.name}!`,
      ingredient: ing,
      log
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  refillStock
};
