'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

// Mock data - in production, this would come from Appwrite Storage
const galleryImages = [
  {
    id: '1',
    title: 'Annual General Meeting 2024',
    description: 'Members gathering for our yearly AGM',
    url: '/images/placeholder-event1.jpg',
    category: 'events',
    date: '2024-12-15',
  },
  {
    id: '2',
    title: 'Community Garden Project',
    description: 'Members working together on our community garden',
    url: '/images/placeholder-community1.jpg',
    category: 'community',
    date: '2024-11-20',
  },
  {
    id: '3',
    title: 'Financial Literacy Workshop',
    description: 'Educational workshop for our members',
    url: '/images/placeholder-workshop1.jpg',
    category: 'education',
    date: '2024-10-30',
  },
  {
    id: '4',
    title: 'Chamber Office Opening',
    description: 'Grand opening of our new office space',
    url: '/images/placeholder-office1.jpg',
    category: 'events',
    date: '2024-09-15',
  },
  {
    id: '5',
    title: 'Members Appreciation Day',
    description: 'Celebrating our wonderful Chamber members',
    url: '/images/placeholder-celebration1.jpg',
    category: 'events',
    date: '2024-08-25',
  },
  {
    id: '6',
    title: 'Youth Outreach Program',
    description: 'Engaging with local youth about Chamber values',
    url: '/images/placeholder-youth1.jpg',
    category: 'community',
    date: '2024-07-10',
  },
];

const categories = [
  { id: 'all', name: 'All Images' },
  { id: 'events', name: 'Events' },
  { id: 'community', name: 'Community' },
  { id: 'education', name: 'Education' },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const filteredImages = selectedCategory === 'all' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-bold">Photo Gallery</h1>
        <p className="text-xl text-neutral max-w-2xl mx-auto">
          Explore moments from our Chamber community events and activities
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'primary' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
            size="sm"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredImages.map((image) => (
          <Card key={image.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div
                className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden"
                onClick={() => setSelectedImage(image.id)}
              >
                {/* Placeholder for images - in production, use Appwrite Storage URLs */}
                <div className="w-full h-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="text-lg font-medium text-accent mb-2">{image.title}</div>
                    <div className="text-sm text-neutral">{image.description}</div>
                    <div className="text-xs text-neutral mt-2">
                      {new Date(image.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="text-white">
                      View Image
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal for selected image */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <Card>
              <CardContent className="p-4">
                {(() => {
                  const image = galleryImages.find(img => img.id === selectedImage);
                  return image ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-gradient-to-br from-accent/20 to-accent/5 rounded-lg flex items-center justify-center">
                        <div className="text-center p-8">
                          <h3 className="text-2xl font-bold text-accent mb-4">{image.title}</h3>
                          <p className="text-neutral mb-4">{image.description}</p>
                          <p className="text-sm text-neutral">
                            {new Date(image.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" onClick={() => setSelectedImage(null)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Upload Section (for admins) */}
      <div className="text-center space-y-4 py-12 border-t border-border">
        <h2 className="text-2xl font-serif font-bold">Share Your Moments</h2>
        <p className="text-neutral">
          Have photos from our events? Contact our admin team to share them with the community.
        </p>
        <Button variant="accent">
          Contact Admin
        </Button>
      </div>
    </div>
  );
}