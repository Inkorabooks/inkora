import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  Image,
  X,
  Check,
  BookOpen,
  MapPin,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Shield,
  Loader2,
} from 'lucide-react';
import { Button, Card, Input, Badge } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

const categories = [
  'Fiction',
  'Non-Fiction',
  'Academic',
  'Business',
  'Self-Help',
  'Technology',
  'Art & Design',
  'Science',
];

const contentTypes = [
  { id: 'book', label: 'Book', icon: BookOpen, description: 'Full-length book' },
  { id: 'notes', label: 'Notes', icon: FileText, description: 'Study notes, summaries' },
  { id: 'study_material', label: 'Study Material', icon: FileText, description: 'Guides, cheat sheets' },
];

const languages = ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi'];

export function UploadPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [isPhysical, setIsPhysical] = useState<boolean | null>(null);
  const [contentType, setContentType] = useState('book');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('English');
  const [tags, setTags] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [agreeCopyright, setAgreeCopyright] = useState(false);
  const [loading, setLoading] = useState(false);

  const { getRootProps: getPdfProps, getInputProps: getPdfInput } = useDropzone({
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    onDrop: files => setPdfFile(files[0]),
  });

  const { getRootProps: getCoverProps, getInputProps: getCoverInput } = useDropzone({
    accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] },
    maxFiles: 1,
    onDrop: files => setCoverImage(files[0]),
  });

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in');
      return;
    }
    if (!title || !author || !price) {
      toast.error('Please fill all required fields');
      return;
    }
    if (!isPhysical && !pdfFile) {
      toast.error('Please upload a PDF file');
      return;
    }
    if (!agreeCopyright) {
      toast.error('Please agree to the copyright declaration');
      return;
    }

    setLoading(true);
    try {
      let pdfUrl = '';
      let coverUrl = '';

      // Upload PDF
      if (!isPhysical && pdfFile) {
        const fileExt = pdfFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { data: pdfData, error: pdfError } = await supabase.storage
          .from('books')
          .upload(fileName, pdfFile);
        if (pdfError) throw pdfError;
        if (pdfData) {
          const { data: urlData } = supabase.storage.from('books').getPublicUrl(pdfData.path);
          pdfUrl = urlData.publicUrl;
        }
      }

      // Upload cover
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from('covers')
          .upload(fileName, coverImage);
        if (coverError) throw coverError;
        if (coverData) {
          const { data: urlData } = supabase.storage.from('covers').getPublicUrl(coverData.path);
          coverUrl = urlData.publicUrl;
        }
      }

      // Insert book
      const { error: insertError } = await supabase.from('books').insert({
        seller_id: user.id,
        title,
        author,
        category,
        language,
        price: parseFloat(price),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        description,
        pdf_url: pdfUrl,
        cover_url: coverUrl,
        is_physical: isPhysical,
        content_type: contentType,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        is_active: true,
        is_approved: false, // Needs admin approval
      });

      if (insertError) throw insertError;

      toast.success('Book submitted for review!');
      navigate('/seller/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <p className="text-dark-400 mb-4">Please sign in to sell books</p>
          <Button onClick={() => navigate('/login')}>Sign In</Button>
        </div>
      </div>
    );
  }

  const steps = ['Type', 'Details', 'Files', 'Review'];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge variant="primary" className="mb-4">
              <Upload className="w-3 h-3 mr-1" />
              Sell on Inkora
            </Badge>
            <h1 className="text-3xl font-bold text-white mb-2">List Your Book</h1>
            <p className="text-dark-400">Share your work with thousands of readers</p>
          </motion.div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((stepName, i) => (
            <div key={stepName} className="flex items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all',
                  i <= step
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-800 text-dark-500'
                )}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    'w-16 h-0.5 mx-2',
                    i < step ? 'bg-primary-500' : 'bg-dark-800'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form card */}
        <Card className="p-8">
          <AnimatePresence mode="wait">
            {/* Step 0: Type selection */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    What would you like to sell?
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsPhysical(false)}
                      className={cn(
                        'p-6 rounded-2xl border-2 transition-all text-left',
                        isPhysical === false
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-700 hover:border-dark-600'
                      )}
                    >
                      <FileText className="w-12 h-12 mb-4 text-primary-400" />
                      <h3 className="font-semibold text-white mb-1">Digital Book</h3>
                      <p className="text-sm text-dark-400">PDF e-books, notes, guides</p>
                    </button>
                    <button
                      onClick={() => setIsPhysical(true)}
                      className={cn(
                        'p-6 rounded-2xl border-2 transition-all text-left',
                        isPhysical === true
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-700 hover:border-dark-600'
                      )}
                    >
                      <MapPin className="w-12 h-12 mb-4 text-accent-400" />
                      <h3 className="font-semibold text-white mb-1">Physical Book</h3>
                      <p className="text-sm text-dark-400">Sell second-hand nearby</p>
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">
                    What type of content?
                  </h2>
                  <div className="grid grid-cols-3 gap-3">
                    {contentTypes.map(type => (
                      <button
                        key={type.id}
                        onClick={() => setContentType(type.id)}
                        className={cn(
                          'p-4 rounded-xl border-2 transition-all text-center',
                          contentType === type.id
                            ? 'border-primary-500 bg-primary-500/10'
                            : 'border-dark-700 hover:border-dark-600'
                        )}
                      >
                        <type.icon className="w-8 h-8 mx-auto mb-2 text-primary-400" />
                        <h4 className="font-medium text-white">{type.label}</h4>
                        <p className="text-xs text-dark-400 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={() => setStep(1)}
                    disabled={isPhysical === null}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <Input
                  label="Title *"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter book title"
                  required
                />
                <Input
                  label="Author *"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Author name"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                    >
                      <option value="">Select category</option>
                      {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                    >
                      {languages.map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Price (INR) *"
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="299"
                    required
                  />
                  <Input
                    label="Original Price (optional)"
                    type="number"
                    value={originalPrice}
                    onChange={e => setOriginalPrice(e.target.value)}
                    placeholder="499"
                    hint="For showing discount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe your book..."
                    className="w-full px-4 py-3 bg-dark-900/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 resize-none"
                  />
                </div>
                <Input
                  label="Tags (comma separated)"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="fiction, adventure, fantasy"
                  hint="Help readers find your book"
                />
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep(isPhysical ? 3 : 2)}
                    disabled={!title || !author || !price}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Files */}
            {step === 2 && !isPhysical && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* PDF Upload */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-3">
                    PDF File *
                  </label>
                  <div
                    {...getPdfProps()}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                      pdfFile
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 hover:border-dark-600'
                    )}
                  >
                    <input {...getPdfInput()} />
                    {pdfFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-10 h-10 text-primary-400" />
                        <div className="text-left">
                          <p className="text-white font-medium">{pdfFile.name}</p>
                          <p className="text-sm text-dark-400">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setPdfFile(null);
                          }}
                          className="p-2 hover:bg-dark-800 rounded-lg"
                        >
                          <X className="w-5 h-5 text-dark-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-4 text-dark-500" />
                        <p className="text-white font-medium">Drag & drop PDF here</p>
                        <p className="text-sm text-dark-400 mt-1">or click to browse</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Cover Upload */}
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-3">
                    Cover Image
                  </label>
                  <div
                    {...getCoverProps()}
                    className={cn(
                      'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                      coverImage
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-700 hover:border-dark-600'
                    )}
                  >
                    <input {...getCoverInput()} />
                    {coverImage ? (
                      <div className="flex items-center justify-center gap-4">
                        <img
                          src={URL.createObjectURL(coverImage)}
                          alt="Cover"
                          className="w-24 h-32 object-cover rounded-lg"
                        />
                        <div className="text-left">
                          <p className="text-white font-medium">{coverImage.name}</p>
                          <p className="text-sm text-dark-400">
                            {(coverImage.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setCoverImage(null);
                          }}
                          className="p-2 hover:bg-dark-800 rounded-lg"
                        >
                          <X className="w-5 h-5 text-dark-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Image className="w-12 h-12 mx-auto mb-4 text-dark-500" />
                        <p className="text-white font-medium">Upload cover image</p>
                        <p className="text-sm text-dark-400 mt-1">JPG, PNG or WebP</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setStep(3)}
                    disabled={!pdfFile}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-lg font-semibold text-white">Review & Publish</h2>

                {/* Summary */}
                <div className="glass rounded-xl p-6 space-y-4">
                  <div className="flex gap-4">
                    {coverImage ? (
                      <img
                        src={URL.createObjectURL(coverImage)}
                        alt="Cover"
                        className="w-20 h-28 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-20 h-28 bg-dark-800 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-dark-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-white text-lg">{title}</h3>
                      <p className="text-dark-400">by {author}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge>{category || 'No category'}</Badge>
                        <Badge variant="primary">{contentType}</Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="text-2xl font-bold gradient-text">
                          {formatPrice(parseFloat(price) || 0)}
                        </span>
                        {originalPrice && (
                          <span className="text-dark-500 line-through">
                            {formatPrice(parseFloat(originalPrice) || 0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Copyright declaration */}
                <div className="glass rounded-xl p-5">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeCopyright}
                      onChange={e => setAgreeCopyright(e.target.checked)}
                      className="w-5 h-5 mt-0.5 rounded border-dark-700 text-primary-500 bg-dark-900 focus:ring-primary-500/50"
                    />
                    <div>
                      <p className="text-white font-medium flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary-400" />
                        Copyright Declaration
                      </p>
                      <p className="text-sm text-dark-400 mt-1">
                        I confirm that I own the rights to this content or have permission to sell it.
                        I understand that uploading copyrighted material without permission is illegal
                        and may result in account suspension.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setStep(isPhysical ? 1 : 2)}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    isLoading={loading}
                    disabled={!agreeCopyright}
                    glow
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Publishing...
                      </>
                    ) : (
                      'Publish Listing'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        {/* Help text */}
        <p className="text-center text-dark-500 text-sm mt-6">
          Need help?{' '}
          <Link to="/help" className="text-primary-400 hover:text-primary-300">
            View seller guide
          </Link>
        </p>
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
