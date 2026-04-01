import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';

const aboutSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  projects_completed: z.number().min(0),
  happy_clients: z.number().min(0),
  countries_served: z.number().min(0),
  image_url: z.string().url('Invalid image URL'),
});

type AboutFormValues = z.infer<typeof aboutSchema>;

export const AboutManagement = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aboutId, setAboutId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AboutFormValues>({
    resolver: zodResolver(aboutSchema),
    defaultValues: {
      title: '',
      description: '',
      projects_completed: 0,
      happy_clients: 0,
      countries_served: 0,
      image_url: '',
    },
  });

  const imageUrl = watch('image_url');

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const { data, error } = await supabase
          .from('about')
          .select('*')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setAboutId(data.id);
          setValue('title', data.title);
          setValue('description', data.description);
          setValue('projects_completed', data.projects_completed);
          setValue('happy_clients', data.happy_clients);
          setValue('countries_served', data.countries_served);
          setValue('image_url', data.image_url);
          setPreviewUrl(data.image_url);
        }
      } catch (error) {
        console.error('Error fetching about data:', error);
        setMessage({ type: 'error', text: 'Failed to load about data' });
      } finally {
        setLoading(false);
      }
    };

    fetchAbout();
  }, [setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `about/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      setValue('image_url', publicUrl);
      setPreviewUrl(publicUrl);
      setMessage({ type: 'success', text: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: AboutFormValues) => {
    try {
      setSaving(true);
      setMessage(null);
      
      if (aboutId) {
        const { error } = await supabase
          .from('about')
          .update({
            ...values,
            updated_at: new Date().toISOString(),
          })
          .eq('id', aboutId);

        if (error) throw error;
        setMessage({ type: 'success', text: 'About section updated successfully' });
      } else {
        const { error } = await supabase
          .from('about')
          .insert([values]);

        if (error) throw error;
        setMessage({ type: 'success', text: 'About section created successfully' });
        
        // Refresh to get the new ID
        const { data } = await supabase.from('about').select('id').maybeSingle();
        if (data) setAboutId(data.id);
      }
    } catch (error) {
      console.error('Error saving about data:', error);
      setMessage({ type: 'error', text: 'Failed to save about data' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">About Management</h1>
          <p className="text-muted-foreground">Control the content of your About section.</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          <p className="text-sm font-medium">{message.text}</p>
          <button onClick={() => setMessage(null)} className="ml-auto text-xs opacity-50 hover:opacity-100 uppercase tracking-widest font-bold">Dismiss</button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Main Content</CardTitle>
              <CardDescription>The primary text and heading for the about section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Engineering the future of digital experiences."
                  {...register('title')}
                  className="bg-muted/50 border-border"
                />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell your story..."
                  rows={6}
                  {...register('description')}
                  className="bg-muted/50 border-border resize-none"
                />
                {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
              <CardDescription>Dynamic numbers shown in the about section.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="projects_completed">Projects Completed</Label>
                <Input
                  id="projects_completed"
                  type="number"
                  {...register('projects_completed', { valueAsNumber: true })}
                  className="bg-muted/50 border-border"
                />
                {errors.projects_completed && <p className="text-xs text-destructive">{errors.projects_completed.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="happy_clients">Happy Clients</Label>
                <Input
                  id="happy_clients"
                  type="number"
                  {...register('happy_clients', { valueAsNumber: true })}
                  className="bg-muted/50 border-border"
                />
                {errors.happy_clients && <p className="text-xs text-destructive">{errors.happy_clients.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="countries_served">Countries Served</Label>
                <Input
                  id="countries_served"
                  type="number"
                  {...register('countries_served', { valueAsNumber: true })}
                  className="bg-muted/50 border-border"
                />
                {errors.countries_served && <p className="text-xs text-destructive">{errors.countries_served.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Section Image</CardTitle>
              <CardDescription>The main visual for the about section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-[4/5] rounded-xl overflow-hidden bg-muted/50 border border-border flex items-center justify-center relative group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="About Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Label htmlFor="image-upload" className="cursor-pointer p-3 rounded-full bg-primary text-white hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </Label>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  placeholder="https://..."
                  {...register('image_url')}
                  className="bg-muted/50 border-border"
                />
                {errors.image_url && <p className="text-xs text-destructive">{errors.image_url.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={saving || uploading}>
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
