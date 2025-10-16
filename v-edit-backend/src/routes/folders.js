import express from 'express';
import Folder from '../models/Folder.js';
import Template from '../models/Template.js';
import UserAccess from '../models/UserAccess.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all folders with template counts (admin only)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const folders = await Folder.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Calculate template counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const templateCount = await Template.countDocuments({ folderId: folder._id });
        return {
          ...folder.toObject(),
          totalTemplates: templateCount
        };
      })
    );

    res.json({
      success: true,
      data: { folders: foldersWithCounts }
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch folders'
    });
  }
});

// Update folder pricing and purchasability (admin only)
router.put('/:id/pricing', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      basePrice,
      discountPrice,
      isPurchasable,
      description,
      thumbnailUrl,
      previewVideoUrl,
      coverPhotoUrl
    } = req.body;

    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Validate pricing
    if (basePrice !== undefined && basePrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Base price must be non-negative'
      });
    }

    if (discountPrice !== undefined && basePrice !== undefined && discountPrice >= basePrice) {
      return res.status(400).json({
        success: false,
        message: 'Discount price must be less than base price'
      });
    }

    // Update folder using findByIdAndUpdate to avoid validation issues
    const updateData = {};
    if (basePrice !== undefined) updateData.basePrice = basePrice;
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
    if (isPurchasable !== undefined) updateData.isPurchasable = isPurchasable;
    if (description !== undefined) updateData.description = description;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl;
    if (previewVideoUrl !== undefined) updateData.previewVideoUrl = previewVideoUrl;
    if (coverPhotoUrl !== undefined) updateData.coverPhotoUrl = coverPhotoUrl;

    // Update template count
    updateData.totalTemplates = await Template.countDocuments({ folderId: folder._id });

    await Folder.findByIdAndUpdate(id, updateData, { new: true });

    const updatedFolder = await Folder.findById(folder._id)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: { folder: updatedFolder },
      message: 'Folder updated successfully'
    });
  } catch (error) {
    console.error('Error updating folder:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update folder'
    });
  }
});

// Get purchasable folders (public)
router.get('/purchasable', async (req, res) => {
  try {
    const folders = await Folder.find({ 
      isPurchasable: true,
      basePrice: { $gt: 0 }
    })
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 });

    // Add template counts and sample templates
    const foldersWithDetails = await Promise.all(
      folders.map(async (folder) => {
        const templateCount = await Template.countDocuments({ folderId: folder._id });
        const sampleTemplates = await Template.find({ folderId: folder._id })
          .select('title videoUrl')
          .limit(3);

        return {
          ...folder.toObject(),
          totalTemplates: templateCount,
          sampleTemplates
        };
      })
    );

    res.json({
      success: true,
      data: { folders: foldersWithDetails }
    });
  } catch (error) {
    console.error('Error fetching purchasable folders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchasable folders'
    });
  }
});

// Check user access to folder (authenticated users)
router.get('/:id/access', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if user has access to this folder
    const access = await UserAccess.findOne({
      userId,
      folderId: id,
      accessType: 'folder'
    });

    const hasAccess = !!access;
    let templates = [];

    if (hasAccess) {
      // Get all templates in the folder that user has access to
      templates = await Template.find({ 
        folderId: id,
        _id: { $in: access.includedTemplates }
      });
    }

    res.json({
      success: true,
      data: {
        hasAccess,
        purchaseDate: access ? access.grantedAt : null,
        templates
      }
    });
  } catch (error) {
    console.error('Error checking folder access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check folder access'
    });
  }
});

// Get folder details with templates (for preview)
router.get('/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;

    const folder = await Folder.findById(id)
      .populate('createdBy', 'name');

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Get all templates in the folder
    const templates = await Template.find({ folderId: id })
      .select('title description basePrice discountPrice videoUrl qrUrl');

    res.json({
      success: true,
      data: {
        ...folder.toObject(),
        templateCount: templates.length,
        templates
      }
    });
  } catch (error) {
    console.error('Error fetching folder preview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch folder preview'
    });
  }
});

// Get user's purchased folders
router.get('/user/purchased', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get all folder access records for this user
    const folderAccesses = await UserAccess.find({
      userId,
      accessType: 'folder'
    }).populate({
      path: 'folderId',
      select: '_id name description coverPhotoUrl thumbnailUrl'
    });

    // Get folder details and templates for each purchased folder
    const purchasedFolders = await Promise.all(
      folderAccesses.map(async (access) => {
        const folder = await Folder.findById(access.folderId);
        if (!folder) return null;

        // Get all templates in the folder that user has access to
        const templates = await Template.find({
          _id: { $in: access.includedTemplates }
        }).select('title description basePrice discountPrice videoUrl qrUrl');

        const folderData = {
          _id: folder._id,
          name: folder.name,
          description: folder.description,
          purchaseDate: access.grantedAt,
          templates: templates,
          coverPhotoUrl: folder.coverPhotoUrl || null,
          thumbnailUrl: folder.thumbnailUrl || null
        };
        console.log('Folder data being sent:', folderData);
        return folderData;
      })
    );

    // Filter out null results
    const validFolders = purchasedFolders.filter(folder => folder !== null);

    res.json({
      success: true,
      data: { folders: validFolders }
    });
  } catch (error) {
    console.error('Error fetching purchased folders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchased folders'
    });
  }
});

export default router;
