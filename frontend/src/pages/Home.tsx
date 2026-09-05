import { useState, useRef } from 'react'
import { Image, X, Loader2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import PostCard from '../components/ui/PostCard'
import { PostSkeleton } from '../components/ui/Skeleton'
import Avatar from '../components/ui/Avatar'
import { useAuth } from '../context/AuthContext'
import { getFeed, createPost } from '../api/feed'

const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // 2 MB

export default function Home() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCompose, setShowCompose] = useState(false)
  const [postText, setPostText] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
  })

  const createPostMutation = useMutation({
    mutationFn: (vars: { content: string; media_urls: string[] }) => createPost(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] })
      setPostText('')
      setImagePreview(null)
      setImageError('')
      setShowCompose(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    },
  })

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError('')
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('Image must be under 2 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setImagePreview(null)
    setImageError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePost = () => {
    if (!postText.trim() || createPostMutation.isPending) return
    createPostMutation.mutate({
      content: postText.trim(),
      media_urls: imagePreview ? [imagePreview] : [],
    })
  }

  const handleOpenCompose = () => {
    setShowCompose(true)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold text-white">Your Feed</h1>

      {/* Compose area */}
      {user && (
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <Avatar src={user.profile_image_url} name={user.full_name} size="md" />
            <button
              onClick={handleOpenCompose}
              className="flex-1 text-left bg-dark-bg hover:bg-dark-hover border border-dark-border rounded-xl px-4 py-2.5 text-sm text-gray-500 transition-colors"
            >
              What&apos;s on your mind, {user.full_name.split(' ')[0]}?
            </button>
            <button
              onClick={() => { handleOpenCompose(); setTimeout(() => fileInputRef.current?.click(), 100) }}
              className="text-gray-500 hover:text-accent transition-colors p-2 rounded-xl hover:bg-dark-hover"
              aria-label="Add image"
            >
              <Image className="w-5 h-5" />
            </button>
          </div>

          {/* Expanded compose */}
          {showCompose && (
            <div className="mt-4 space-y-3 border-t border-dark-border pt-4">
              <div className="flex items-start gap-3">
                <Avatar src={user.profile_image_url} name={user.full_name} size="md" />
                <textarea
                  className="input-base flex-1 min-h-[100px] resize-none"
                  placeholder="Share your ride, your bike, your story..."
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                  autoFocus
                  aria-label="Post content"
                />
              </div>

              {/* Image preview */}
              {imagePreview && (
                <div className="relative ml-11 rounded-xl overflow-hidden border border-dark-border">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="w-full max-h-72 object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/70 hover:bg-black/90 rounded-full flex items-center justify-center text-white transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {imageError && (
                <p className="text-xs text-red-400 ml-11">{imageError}</p>
              )}

              {/* Toolbar + actions */}
              <div className="flex items-center justify-between ml-11 gap-2">
                <div className="flex items-center gap-1">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleImageSelect}
                    aria-label="Upload image"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-colors ${
                      imagePreview
                        ? 'text-accent bg-accent/10'
                        : 'text-gray-500 hover:text-accent hover:bg-dark-hover'
                    }`}
                    aria-label="Attach image"
                  >
                    <Image className="w-4 h-4" />
                    <span className="text-xs">{imagePreview ? 'Change' : 'Photo'}</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowCompose(false)
                      setPostText('')
                      handleRemoveImage()
                    }}
                    className="btn-secondary flex items-center gap-1 text-sm"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    disabled={!postText.trim() || createPostMutation.isPending}
                    className="btn-primary flex items-center gap-2 text-sm"
                  >
                    {createPostMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <PostSkeleton key={n} />
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center text-gray-500">
          <p>Failed to load feed. Please try again.</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-12 text-center text-gray-500">
          <p className="text-lg font-medium">No posts yet</p>
          <p className="text-sm mt-1">Be the first to share something with the community!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.post_id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
