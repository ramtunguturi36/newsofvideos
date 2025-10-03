import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createFolder, getHierarchy, uploadTemplate } from '@/lib/backend'
import { useCart } from '@/context/CartContext'
import type { Folder, TemplateItem } from '@/lib/backend'
import { useNavigate, useSearchParams } from 'react-router-dom'

function FolderCard({ folder, onClick }: { folder: Folder; onClick: () => void }) {
  return (
    <div onClick={onClick} className="cursor-pointer group">
      <Card className="p-4 hover:shadow-2xl transition-shadow">
        <div className="aspect-video grid place-items-center text-yellow-400 text-5xl">📁</div>
        <div className="mt-2 text-white/90 truncate">{folder.name}</div>
      </Card>
    </div>
  )
}

function TemplateCard({ item }: { item: TemplateItem }) {
  const [hover, setHover] = useState(false)
  return (
    <div className="group" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Card className="overflow-hidden">
        <div className="relative aspect-video bg-black">
          <video src={item.videoUrl} className="h-full w-full object-cover" muted loop autoPlay={hover} />
          <img src={item.qrUrl} alt="QR" className="absolute bottom-2 right-2 h-12 w-12 rounded-md shadow" />
        </div>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-white/90 truncate">{item.title}</div>
            <div className="text-white/70 text-sm">
              {item.discountPrice ? (
                <>
                  <span className="line-through mr-2">₹{item.basePrice}</span>
                  <span className="text-green-300 font-semibold">₹{item.discountPrice}</span>
                </>
              ) : (
                <span className="font-semibold">₹{item.basePrice}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminExplorer() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const currentFolderId = params.get('folderId') || undefined
  const [folders, setFolders] = useState<Folder[]>([])
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [path, setPath] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const { addItem } = useCart()

  // Create folder state
  const [folderName, setFolderName] = useState('')
  const [parentId, setParentId] = useState<string | undefined>(currentFolderId)

  // Upload template state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [basePrice, setBasePrice] = useState('')
  const [discountPrice, setDiscountPrice] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [qrFile, setQrFile] = useState<File | null>(null)

  useEffect(() => {
    setParentId(currentFolderId)
    setLoading(true)
    getHierarchy(currentFolderId)
      .then((data) => {
        setFolders(data.folders || [])
        setTemplates(data.templates || [])
        setPath(data.path || [])
      })
      .finally(() => setLoading(false))
  }, [currentFolderId])

  const breadcrumbs = useMemo(() => {
    const items = [{ _id: '', name: 'Home' }, ...path]
    return items
  }, [path])

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault()
    await createFolder(folderName, parentId)
    setCreateOpen(false)
    setFolderName('')
    const d = await getHierarchy(currentFolderId)
    setFolders(d.folders)
  }

  async function handleUploadTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!videoFile || !qrFile) return
    await uploadTemplate({
      title,
      description,
      basePrice: Number(basePrice),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      videoFile,
      qrFile,
      parentId: currentFolderId,
    })
    setUploadOpen(false)
    setTitle(''); setDescription(''); setBasePrice(''); setDiscountPrice(''); setVideoFile(null); setQrFile(null)
    const d = await getHierarchy(currentFolderId)
    setTemplates(d.templates)
  }

  return (
    <div className="min-h-screen text-white">
      <div className="flex h-16 items-center border-b border-white/10 px-4 justify-between">
        <div className="flex items-center gap-2 text-white/80">
          {breadcrumbs.map((b, idx) => (
            <div key={b._id} className="flex items-center gap-2">
              <button
                className="hover:underline"
                onClick={() => setParams(b._id ? { folderId: b._id } : {})}
              >
                {b.name}
              </button>
              {idx < breadcrumbs.length - 1 && <span className="text-white/40">/</span>}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => window.location.hash = '/admin/dashboard'}>
            Dashboard
          </Button>
          <Button onClick={() => setCreateOpen(true)}>Create Folder</Button>
          <Button variant="outline" onClick={() => setUploadOpen(true)}>Upload Template</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
        <AnimatePresence>
          {folders.map((f) => (
            <motion.div key={f._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <FolderCard folder={f} onClick={() => setParams({ folderId: f._id })} />
            </motion.div>
          ))}
          {templates.map((t) => (
            <motion.div key={t._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="space-y-2">
                <TemplateCard item={t} />
                <Button variant="outline" onClick={() => addItem({ id: t._id, type: 'template', title: t.title, price: t.discountPrice ?? t.basePrice })}>Add to Cart</Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen} title="Create Folder">
        <form onSubmit={handleCreateFolder} className="space-y-3">
          <div>
            <Label>Folder name</Label>
            <Input value={folderName} onChange={(e) => setFolderName(e.target.value)} required />
          </div>
          <div>
            <Label>Parent folder</Label>
            <select
              className="w-full rounded-md bg-white/10 border border-white/20 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/40"
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || undefined)}
            >
              <option value="">Home</option>
              {path.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full">Create</Button>
        </form>
      </Dialog>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen} title="Upload Template">
        <form onSubmit={handleUploadTemplate} className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Base Price</Label>
              <Input type="number" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
            </div>
            <div>
              <Label>Discount Price</Label>
              <Input type="number" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Video</Label>
              <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} required />
            </div>
            <div>
              <Label>QR Image</Label>
              <input type="file" accept="image/*" onChange={(e) => setQrFile(e.target.files?.[0] || null)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>{videoFile && <video src={URL.createObjectURL(videoFile)} className="w-full rounded-md" controls />}</div>
            <div>{qrFile && <img src={URL.createObjectURL(qrFile)} className="w-full rounded-md" />}</div>
          </div>
          <Button type="submit" className="w-full">Upload</Button>
        </form>
      </Dialog>
    </div>
  )
}




