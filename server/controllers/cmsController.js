const { memoryDb } = require('../services/dbService');

const getCMSByKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const content = memoryDb.cms[key];
    if (!content) {
      return res.status(404).json({ success: false, message: `CMS key '${key}' not found.` });
    }
    return res.json({ success: true, key, content });
  } catch (err) {
    next(err);
  }
};

const getAllCMS = async (req, res, next) => {
  try {
    return res.json({ success: true, cms: memoryDb.cms });
  } catch (err) {
    next(err);
  }
};

const updateCMSKey = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { title, content } = req.body;

    if (title || content !== undefined) {
      if (typeof memoryDb.cms[key] === 'object' && !Array.isArray(memoryDb.cms[key])) {
        memoryDb.cms[key] = {
          ...memoryDb.cms[key],
          ...(title && { title }),
          ...(content && { content })
        };
      } else {
        memoryDb.cms[key] = content;
      }
    }

    return res.json({
      success: true,
      message: `CMS section '${key}' updated successfully!`,
      content: memoryDb.cms[key]
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCMSByKey,
  getAllCMS,
  updateCMSKey
};
