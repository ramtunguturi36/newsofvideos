import UserAccess from '../models/UserAccess.js';
import Template from '../models/Template.js';
import Folder from '../models/Folder.js';

// Check if user has access to a specific template
export async function hasTemplateAccess(userId, templateId) {
  try {
    // Check direct template access
    const directAccess = await UserAccess.findOne({
      userId,
      templateId,
      accessType: 'template'
    });

    if (directAccess) return true;

    // Check folder access that includes this template
    const template = await Template.findById(templateId);
    if (!template) return false;

    const folderAccess = await UserAccess.findOne({
      userId,
      folderId: template.folderId,
      accessType: 'folder',
      includedTemplates: templateId
    });

    return !!folderAccess;
  } catch (error) {
    console.error('Error checking template access:', error);
    return false;
  }
}

// Check if user has access to a folder
export async function hasFolderAccess(userId, folderId) {
  try {
    const access = await UserAccess.findOne({
      userId,
      folderId,
      accessType: 'folder'
    });

    return !!access;
  } catch (error) {
    console.error('Error checking folder access:', error);
    return false;
  }
}

// Get all templates user has access to
export async function getUserAccessibleTemplates(userId) {
  try {
    const accesses = await UserAccess.find({ userId })
      .populate('templateId')
      .populate('includedTemplates');

    const templateIds = new Set();

    // Add directly purchased templates
    accesses.forEach(access => {
      if (access.accessType === 'template' && access.templateId) {
        templateIds.add(access.templateId._id.toString());
      }
      
      // Add templates from purchased folders
      if (access.accessType === 'folder' && access.includedTemplates) {
        access.includedTemplates.forEach(template => {
          templateIds.add(template._id.toString());
        });
      }
    });

    return Array.from(templateIds);
  } catch (error) {
    console.error('Error getting user accessible templates:', error);
    return [];
  }
}

// Get all folders user has access to
export async function getUserAccessibleFolders(userId) {
  try {
    const accesses = await UserAccess.find({
      userId,
      accessType: 'folder'
    }).populate('folderId');

    return accesses.map(access => access.folderId).filter(folder => folder);
  } catch (error) {
    console.error('Error getting user accessible folders:', error);
    return [];
  }
}

// Grant template access to user
export async function grantTemplateAccess(userId, templateId, purchaseId) {
  try {
    const existingAccess = await UserAccess.findOne({
      userId,
      templateId,
      accessType: 'template'
    });

    if (existingAccess) return existingAccess;

    const access = new UserAccess({
      userId,
      templateId,
      accessType: 'template',
      purchaseId
    });

    await access.save();
    return access;
  } catch (error) {
    console.error('Error granting template access:', error);
    throw error;
  }
}

// Grant folder access to user (includes all templates in the folder)
export async function grantFolderAccess(userId, folderId, purchaseId) {
  try {
    const existingAccess = await UserAccess.findOne({
      userId,
      folderId,
      accessType: 'folder'
    });

    if (existingAccess) return existingAccess;

    // Get all templates in the folder
    const templates = await Template.find({ folderId });
    const templateIds = templates.map(template => template._id);

    const access = new UserAccess({
      userId,
      folderId,
      accessType: 'folder',
      purchaseId,
      includedTemplates: templateIds
    });

    await access.save();
    return access;
  } catch (error) {
    console.error('Error granting folder access:', error);
    throw error;
  }
}

// Middleware to check template access
export function requireTemplateAccess(req, res, next) {
  return async (req, res, next) => {
    try {
      const { templateId } = req.params;
      const userId = req.user.userId;

      const hasAccess = await hasTemplateAccess(userId, templateId);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Please purchase this template or folder to access it.'
        });
      }

      next();
    } catch (error) {
      console.error('Access check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking access permissions'
      });
    }
  };
}

// Middleware to check folder access
export function requireFolderAccess(req, res, next) {
  return async (req, res, next) => {
    try {
      const { folderId } = req.params;
      const userId = req.user.userId;

      const hasAccess = await hasFolderAccess(userId, folderId);
      
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Please purchase this folder to access its contents.'
        });
      }

      next();
    } catch (error) {
      console.error('Access check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking access permissions'
      });
    }
  };
}
