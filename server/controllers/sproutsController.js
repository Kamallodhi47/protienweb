const { prisma, memoryDb } = require('../services/dbService');

// Slugify helper
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// ==================================================
// SPROUTS & PROTEIN CATEGORIES CONTROLLERS
// ==================================================

// GET all categories
const getCategories = async (req, res, next) => {
  try {
    const { isActive } = req.query;
    
    if (prisma) {
      const where = {};
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      const list = await prisma.sproutsProteinCategory.findMany({
        where,
        orderBy: { displayOrder: 'asc' }
      });
      return res.json({ success: true, count: list.length, categories: list });
    }

    // Fallback to memoryDb
    let list = [...memoryDb.sproutsProteinCategories];
    if (isActive !== undefined) {
      const activeBool = isActive === 'true';
      list = list.filter(c => c.isActive === activeBool);
    }
    list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
    return res.json({ success: true, count: list.length, categories: list });
  } catch (err) {
    next(err);
  }
};

// GET category by ID
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const cat = await prisma.sproutsProteinCategory.findUnique({
        where: { id }
      });
      if (!cat) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }
      return res.json({ success: true, category: cat });
    }

    const cat = memoryDb.sproutsProteinCategories.find(c => c.id === id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }
    return res.json({ success: true, category: cat });
  } catch (err) {
    next(err);
  }
};

// CREATE a new category
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, displayOrder, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required.' });
    }

    const slug = slugify(name);
    const order = displayOrder !== undefined ? Number(displayOrder) : 0;
    const active = isActive !== undefined ? isActive === true || isActive === 'true' : true;
    const catId = `spc-${Date.now()}`;

    const newCat = {
      id: catId,
      name,
      slug,
      description: description || '',
      image: image || '',
      displayOrder: order,
      isActive: active,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (prisma) {
      // Check duplicate name/slug
      const exists = await prisma.sproutsProteinCategory.findFirst({
        where: { OR: [{ name }, { slug }] }
      });
      if (exists) {
        return res.status(400).json({ success: false, message: 'Category name already exists.' });
      }

      const created = await prisma.sproutsProteinCategory.create({
        data: {
          id: catId,
          name,
          slug,
          description: description || '',
          image: image || '',
          displayOrder: order,
          isActive: active
        }
      });
      
      memoryDb.sproutsProteinCategories.unshift(created);
      return res.status(201).json({ success: true, message: 'Category created successfully!', category: created });
    }

    const exists = memoryDb.sproutsProteinCategories.some(c => c.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'Category name already exists.' });
    }

    memoryDb.sproutsProteinCategories.unshift(newCat);
    return res.status(201).json({ success: true, message: 'Category created successfully!', category: newCat });
  } catch (err) {
    next(err);
  }
};

// UPDATE an existing category
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, displayOrder, isActive } = req.body;

    let updatedData = {};
    if (name) {
      updatedData.name = name;
      updatedData.slug = slugify(name);
    }
    if (description !== undefined) updatedData.description = description;
    if (image !== undefined) updatedData.image = image;
    if (displayOrder !== undefined) updatedData.displayOrder = Number(displayOrder);
    if (isActive !== undefined) updatedData.isActive = isActive === true || isActive === 'true';

    updatedData.updatedAt = new Date();

    if (prisma) {
      const cat = await prisma.sproutsProteinCategory.findUnique({ where: { id } });
      if (!cat) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }

      const updated = await prisma.sproutsProteinCategory.update({
        where: { id },
        data: updatedData
      });

      const mIdx = memoryDb.sproutsProteinCategories.findIndex(c => c.id === id);
      if (mIdx !== -1) {
        memoryDb.sproutsProteinCategories[mIdx] = { ...memoryDb.sproutsProteinCategories[mIdx], ...updated };
      }
      return res.json({ success: true, message: 'Category updated successfully!', category: updated });
    }

    const mIdx = memoryDb.sproutsProteinCategories.findIndex(c => c.id === id);
    if (mIdx === -1) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    memoryDb.sproutsProteinCategories[mIdx] = {
      ...memoryDb.sproutsProteinCategories[mIdx],
      ...updatedData
    };

    return res.json({ success: true, message: 'Category updated successfully!', category: memoryDb.sproutsProteinCategories[mIdx] });
  } catch (err) {
    next(err);
  }
};

// DELETE a category
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const cat = await prisma.sproutsProteinCategory.findUnique({ where: { id } });
      if (!cat) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }

      const deleted = await prisma.sproutsProteinCategory.delete({ where: { id } });
      memoryDb.sproutsProteinCategories = memoryDb.sproutsProteinCategories.filter(c => c.id !== id);
      // Clean up ingredients under this category
      memoryDb.sproutsProteinIngredients = memoryDb.sproutsProteinIngredients.filter(i => i.categoryId !== id);

      return res.json({ success: true, message: 'Category deleted successfully!', category: deleted });
    }

    const mIdx = memoryDb.sproutsProteinCategories.findIndex(c => c.id === id);
    if (mIdx === -1) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const deleted = memoryDb.sproutsProteinCategories.splice(mIdx, 1)[0];
    memoryDb.sproutsProteinIngredients = memoryDb.sproutsProteinIngredients.filter(i => i.categoryId !== id);

    return res.json({ success: true, message: 'Category deleted successfully!', category: deleted });
  } catch (err) {
    next(err);
  }
};

// ==================================================
// SPROUTS & PROTEIN INGREDIENTS CONTROLLERS
// ==================================================

// GET all ingredients
const getIngredients = async (req, res, next) => {
  try {
    const { categoryId, isActive, search } = req.query;

    if (prisma) {
      const where = {};
      if (categoryId) where.categoryId = categoryId;
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }
      if (search) {
        where.OR = [
          { name: { contains: search } },
          { description: { contains: search } }
        ];
      }

      const list = await prisma.sproutsProteinIngredient.findMany({
        where,
        orderBy: { displayOrder: 'asc' },
        include: { category: true }
      });
      return res.json({ success: true, count: list.length, ingredients: list });
    }

    // Fallback to memoryDb
    let list = [...memoryDb.sproutsProteinIngredients];
    if (categoryId) {
      list = list.filter(i => i.categoryId === categoryId);
    }
    if (isActive !== undefined) {
      const activeBool = isActive === 'true';
      list = list.filter(i => i.isActive === activeBool);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => 
        i.name.toLowerCase().includes(q) || 
        (i.description && i.description.toLowerCase().includes(q))
      );
    }
    list.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    // Map category object
    const listWithCat = list.map(i => {
      const cat = memoryDb.sproutsProteinCategories.find(c => c.id === i.categoryId);
      return { ...i, category: cat };
    });

    return res.json({ success: true, count: listWithCat.length, ingredients: listWithCat });
  } catch (err) {
    next(err);
  }
};

// GET ingredient by ID
const getIngredientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const ing = await prisma.sproutsProteinIngredient.findUnique({
        where: { id },
        include: { category: true }
      });
      if (!ing) {
        return res.status(404).json({ success: false, message: 'Ingredient not found.' });
      }
      return res.json({ success: true, ingredient: ing });
    }

    const ing = memoryDb.sproutsProteinIngredients.find(i => i.id === id);
    if (!ing) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }
    const cat = memoryDb.sproutsProteinCategories.find(c => c.id === ing.categoryId);
    return res.json({ success: true, ingredient: { ...ing, category: cat } });
  } catch (err) {
    next(err);
  }
};

// CREATE a new ingredient
const createIngredient = async (req, res, next) => {
  try {
    const {
      name,
      categoryId,
      description,
      image,
      portionSize,
      unit,
      price,
      protein,
      calories,
      carbohydrates,
      healthyFat,
      fiber,
      weight,
      displayOrder,
      isActive,
      isFeatured
    } = req.body;

    // Validations
    if (!name) return res.status(400).json({ success: false, message: 'Ingredient name is required.' });
    if (!categoryId) return res.status(400).json({ success: false, message: 'Category is required.' });
    if (price === undefined || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative price is required.' });
    }
    if (!portionSize) return res.status(400).json({ success: false, message: 'Portion size is required.' });

    // Numeric validations
    const num = (val) => (val !== undefined && val !== null ? Math.max(0, Number(val)) : 0.0);

    const slug = slugify(name);
    const order = displayOrder !== undefined ? Number(displayOrder) : 0;
    const active = isActive !== undefined ? isActive === true || isActive === 'true' : true;
    const featured = isFeatured !== undefined ? isFeatured === true || isFeatured === 'true' : false;
    const ingId = `spi-${Date.now()}`;

    const newIng = {
      id: ingId,
      categoryId,
      name,
      slug,
      description: description || '',
      image: image || 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
      portionSize,
      unit: unit || 'g',
      price: Number(price),
      protein: num(protein),
      calories: num(calories),
      carbohydrates: num(carbohydrates),
      healthyFat: num(healthyFat),
      fiber: num(fiber),
      weight: num(weight || parseFloat(portionSize) || 50),
      displayOrder: order,
      isActive: active,
      isFeatured: featured,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (prisma) {
      // Check if category exists
      const catExists = await prisma.sproutsProteinCategory.findUnique({ where: { id: categoryId } });
      if (!catExists) {
        return res.status(400).json({ success: false, message: 'Selected Category does not exist.' });
      }

      // Check unique slug
      const exists = await prisma.sproutsProteinIngredient.findUnique({ where: { slug } });
      if (exists) {
        return res.status(400).json({ success: false, message: 'An ingredient with this name/slug already exists.' });
      }

      const created = await prisma.sproutsProteinIngredient.create({
        data: {
          id: ingId,
          categoryId,
          name,
          slug,
          description: description || '',
          image: image || 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
          portionSize,
          unit: unit || 'g',
          price: Number(price),
          protein: num(protein),
          calories: num(calories),
          carbohydrates: num(carbohydrates),
          healthyFat: num(healthyFat),
          fiber: num(fiber),
          weight: num(weight || parseFloat(portionSize) || 50),
          displayOrder: order,
          isActive: active,
          isFeatured: featured
        },
        include: { category: true }
      });

      memoryDb.sproutsProteinIngredients.unshift(created);
      return res.status(201).json({ success: true, message: 'Ingredient created successfully!', ingredient: created });
    }

    const catExists = memoryDb.sproutsProteinCategories.some(c => c.id === categoryId);
    if (!catExists) {
      return res.status(400).json({ success: false, message: 'Selected Category does not exist.' });
    }

    const exists = memoryDb.sproutsProteinIngredients.some(i => i.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      return res.status(400).json({ success: false, message: 'An ingredient with this name already exists.' });
    }

    memoryDb.sproutsProteinIngredients.unshift(newIng);
    const cat = memoryDb.sproutsProteinCategories.find(c => c.id === categoryId);
    return res.status(201).json({ success: true, message: 'Ingredient created successfully!', ingredient: { ...newIng, category: cat } });
  } catch (err) {
    next(err);
  }
};

// UPDATE an existing ingredient
const updateIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      categoryId,
      description,
      image,
      portionSize,
      unit,
      price,
      protein,
      calories,
      carbohydrates,
      healthyFat,
      fiber,
      weight,
      displayOrder,
      isActive,
      isFeatured
    } = req.body;

    const num = (val) => (val !== undefined && val !== null ? Math.max(0, Number(val)) : undefined);

    let updatedData = {};
    if (name) {
      updatedData.name = name;
      updatedData.slug = slugify(name);
    }
    if (categoryId) updatedData.categoryId = categoryId;
    if (description !== undefined) updatedData.description = description;
    if (image !== undefined) updatedData.image = image;
    if (portionSize !== undefined) updatedData.portionSize = portionSize;
    if (unit !== undefined) updatedData.unit = unit;
    if (price !== undefined) {
      if (Number(price) < 0) return res.status(400).json({ success: false, message: 'Price cannot be negative.' });
      updatedData.price = Number(price);
    }
    if (protein !== undefined) updatedData.protein = num(protein);
    if (calories !== undefined) updatedData.calories = num(calories);
    if (carbohydrates !== undefined) updatedData.carbohydrates = num(carbohydrates);
    if (healthyFat !== undefined) updatedData.healthyFat = num(healthyFat);
    if (fiber !== undefined) updatedData.fiber = num(fiber);
    if (weight !== undefined) updatedData.weight = num(weight);
    if (displayOrder !== undefined) updatedData.displayOrder = Number(displayOrder);
    if (isActive !== undefined) updatedData.isActive = isActive === true || isActive === 'true';
    if (isFeatured !== undefined) updatedData.isFeatured = isFeatured === true || isFeatured === 'true';

    updatedData.updatedAt = new Date();

    if (prisma) {
      const ing = await prisma.sproutsProteinIngredient.findUnique({ where: { id } });
      if (!ing) {
        return res.status(404).json({ success: false, message: 'Ingredient not found.' });
      }

      if (categoryId) {
        const catExists = await prisma.sproutsProteinCategory.findUnique({ where: { id: categoryId } });
        if (!catExists) return res.status(400).json({ success: false, message: 'Selected Category does not exist.' });
      }

      const updated = await prisma.sproutsProteinIngredient.update({
        where: { id },
        data: updatedData,
        include: { category: true }
      });

      const mIdx = memoryDb.sproutsProteinIngredients.findIndex(i => i.id === id);
      if (mIdx !== -1) {
        memoryDb.sproutsProteinIngredients[mIdx] = { ...memoryDb.sproutsProteinIngredients[mIdx], ...updated };
      }
      return res.json({ success: true, message: 'Ingredient updated successfully!', ingredient: updated });
    }

    const mIdx = memoryDb.sproutsProteinIngredients.findIndex(i => i.id === id);
    if (mIdx === -1) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }

    if (categoryId) {
      const catExists = memoryDb.sproutsProteinCategories.some(c => c.id === categoryId);
      if (!catExists) return res.status(400).json({ success: false, message: 'Selected Category does not exist.' });
    }

    memoryDb.sproutsProteinIngredients[mIdx] = {
      ...memoryDb.sproutsProteinIngredients[mIdx],
      ...updatedData
    };
    const cat = memoryDb.sproutsProteinCategories.find(c => c.id === memoryDb.sproutsProteinIngredients[mIdx].categoryId);

    return res.json({ success: true, message: 'Ingredient updated successfully!', ingredient: { ...memoryDb.sproutsProteinIngredients[mIdx], category: cat } });
  } catch (err) {
    next(err);
  }
};

// DELETE an ingredient
const deleteIngredient = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (prisma) {
      const ing = await prisma.sproutsProteinIngredient.findUnique({ where: { id } });
      if (!ing) {
        return res.status(404).json({ success: false, message: 'Ingredient not found.' });
      }

      const deleted = await prisma.sproutsProteinIngredient.delete({ where: { id } });
      memoryDb.sproutsProteinIngredients = memoryDb.sproutsProteinIngredients.filter(i => i.id !== id);

      return res.json({ success: true, message: 'Ingredient deleted successfully!', ingredient: deleted });
    }

    const mIdx = memoryDb.sproutsProteinIngredients.findIndex(i => i.id === id);
    if (mIdx === -1) {
      return res.status(404).json({ success: false, message: 'Ingredient not found.' });
    }

    const deleted = memoryDb.sproutsProteinIngredients.splice(mIdx, 1)[0];
    return res.json({ success: true, message: 'Ingredient deleted successfully!', ingredient: deleted });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient
};
