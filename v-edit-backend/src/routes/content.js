import express from 'express';
import multer from 'multer';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';
import Folder from '../models/Folder.js';
import Template from '../models/Template.js';
import { uploadToR2 } from '../utils/r2.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 * 1000 * 200 } })

const router = express.Router()

router.post('/folders', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { name, parentId } = req.body
    if (!name) return res.status(400).json({ message: 'Name is required' })
    const folder = await Folder.create({ 
      name, 
      parentId: parentId || null,
      createdBy: req.user.userId
    })
    return res.json({ folder })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.post(
  '/templates',
  authMiddleware,
  roleMiddleware(['admin']),
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'qr', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, description, basePrice, discountPrice, parentId } = req.body
      if (!title || !basePrice) return res.status(400).json({ message: 'Missing fields' })
      const videoFile = req.files?.video?.[0]
      const qrFile = req.files?.qr?.[0]
      if (!videoFile || !qrFile) return res.status(400).json({ message: 'Files missing' })

      const folderId = parentId || null
      const bucket = process.env.R2_BUCKET
      const ts = Date.now()
      const videoKey = `videos/${ts}-${videoFile.originalname}`
      const qrKey = `qr/${ts}-${qrFile.originalname}`

      const [videoUrl, qrUrl] = await Promise.all([
        uploadToR2({ bucket, key: videoKey, contentType: videoFile.mimetype, body: videoFile.buffer }),
        uploadToR2({ bucket, key: qrKey, contentType: qrFile.mimetype, body: qrFile.buffer }),
      ])

      const template = await Template.create({
        folderId,
        title,
        description,
        basePrice: Number(basePrice),
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
        videoUrl,
        qrUrl,
      })

      return res.json({ template })
    } catch (err) {
      console.error('❌ Template upload error:', err)
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        statusCode: err.$metadata?.httpStatusCode
      })
      return res.status(500).json({ 
        message: 'Server error', 
        error: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      })
    }
  }
)

router.get('/hierarchy', async (req, res) => {
  try {
    const { folderId } = req.query
    const filter = { parentId: folderId || null }
    const [folders, rawTemplates, path] = await Promise.all([
      Folder.find(filter).sort({ createdAt: 1 }),
      Template.find(folderId ? { folderId } : { folderId: null }).sort({ createdAt: -1 }),
      buildPath(folderId),
    ])
    
    // Fix templates to handle both discountPrice and discountedPrice fields
    const templates = rawTemplates.map(template => {
      const templateObj = template.toObject()
      // If template has discountedPrice but not discountPrice, use discountedPrice
      if (templateObj.discountedPrice && !templateObj.discountPrice) {
        templateObj.discountPrice = templateObj.discountedPrice
      }
      // Remove the old field to avoid confusion
      delete templateObj.discountedPrice
      return templateObj
    })
    
    return res.json({ folders, templates, path })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params
    const template = await Template.findById(id)
    if (!template) return res.status(404).json({ message: 'Template not found' })
    return res.json({ template })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Update folder
router.put('/folders/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { name, parentId } = req.body
    if (!name) return res.status(400).json({ message: 'Name is required' })
    
    const folder = await Folder.findByIdAndUpdate(
      id, 
      { name, parentId: parentId || null }, 
      { new: true }
    )
    if (!folder) return res.status(404).json({ message: 'Folder not found' })
    
    return res.json({ folder })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Delete folder
router.delete('/folders/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    
    // Check if folder has children
    const [childFolders, childTemplates] = await Promise.all([
      Folder.find({ parentId: id }),
      Template.find({ folderId: id })
    ])
    
    if (childFolders.length > 0 || childTemplates.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete folder with contents. Move or delete contents first.' 
      })
    }
    
    const folder = await Folder.findByIdAndDelete(id)
    if (!folder) return res.status(404).json({ message: 'Folder not found' })
    
    return res.json({ message: 'Folder deleted successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Update template
router.put('/templates/:id', authMiddleware, roleMiddleware(['admin']), 
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'qr', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params
      const { title, description, basePrice, discountPrice, folderId } = req.body
      
      const template = await Template.findById(id)
      if (!template) return res.status(404).json({ message: 'Template not found' })
      
      const updateData = {
        title: title || template.title,
        description: description !== undefined ? description : template.description,
        basePrice: basePrice ? Number(basePrice) : template.basePrice,
        discountPrice: discountPrice ? Number(discountPrice) : template.discountPrice,
        folderId: folderId !== undefined ? (folderId || null) : template.folderId
      }
      
      // Handle file uploads if provided
      const videoFile = req.files?.video?.[0]
      const qrFile = req.files?.qr?.[0]
      
      if (videoFile || qrFile) {
        const bucket = process.env.R2_BUCKET
        const ts = Date.now()
        
        if (videoFile) {
          const videoKey = `videos/${ts}-${videoFile.originalname}`
          updateData.videoUrl = await uploadToR2({ 
            bucket, 
            key: videoKey, 
            contentType: videoFile.mimetype, 
            body: videoFile.buffer 
          })
        }
        
        if (qrFile) {
          const qrKey = `qr/${ts}-${qrFile.originalname}`
          updateData.qrUrl = await uploadToR2({ 
            bucket, 
            key: qrKey, 
            contentType: qrFile.mimetype, 
            body: qrFile.buffer 
          })
        }
      }
      
      const updatedTemplate = await Template.findByIdAndUpdate(id, updateData, { new: true })
      return res.json({ template: updatedTemplate })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Server error' })
    }
  }
)

// Delete template
router.delete('/templates/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const template = await Template.findByIdAndDelete(id)
    if (!template) return res.status(404).json({ message: 'Template not found' })
    
    return res.json({ message: 'Template deleted successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Move template to different folder
router.patch('/templates/:id/move', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { folderId } = req.body
    
    const template = await Template.findByIdAndUpdate(
      id, 
      { folderId: folderId || null }, 
      { new: true }
    )
    if (!template) return res.status(404).json({ message: 'Template not found' })
    
    return res.json({ template })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Move folder to different parent
router.patch('/folders/:id/move', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { id } = req.params
    const { parentId } = req.body
    
    // Prevent moving folder into itself or its children
    if (parentId) {
      const isDescendant = await checkIfDescendant(parentId, id)
      if (isDescendant || parentId === id) {
        return res.status(400).json({ message: 'Cannot move folder into itself or its descendants' })
      }
    }
    
    const folder = await Folder.findByIdAndUpdate(
      id, 
      { parentId: parentId || null }, 
      { new: true }
    )
    if (!folder) return res.status(404).json({ message: 'Folder not found' })
    
    return res.json({ folder })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
})

async function checkIfDescendant(potentialParent, folderId) {
  let current = await Folder.findById(potentialParent)
  while (current) {
    if (current._id.toString() === folderId) return true
    current = current.parentId ? await Folder.findById(current.parentId) : null
  }
  return false
}

async function buildPath(folderId) {
  if (!folderId) return []
  const path = []
  let current = await Folder.findById(folderId)
  while (current) {
    path.unshift({ _id: current._id, name: current.name })
    current = current.parentId ? await Folder.findById(current.parentId) : null
  }
  return path
}

export default router;


