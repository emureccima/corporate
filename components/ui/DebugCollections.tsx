'use client';

import { useState, useEffect } from 'react';
import { validateCollections } from '@/lib/appwrite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';
import { Button } from './Button';

interface CollectionStatus {
  name: string;
  id: string;
  status: 'OK' | 'NOT_FOUND' | 'ERROR';
  error?: string;
}

export function DebugCollections() {
  const [collections, setCollections] = useState<CollectionStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkCollections = async () => {
    setLoading(true);
    try {
      const results = await validateCollections();
      setCollections(results);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Error checking collections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkCollections();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OK':
        return 'text-green-600 bg-green-100';
      case 'NOT_FOUND':
        return 'text-red-600 bg-red-100';
      case 'ERROR':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Collection Status
          <Button 
            onClick={checkCollections} 
            disabled={loading}
            size="sm"
            variant="outline"
          >
            {loading ? 'Checking...' : 'Refresh'}
          </Button>
        </CardTitle>
        <CardDescription>
          Debug tool to check if all required Appwrite collections are accessible
          {lastChecked && (
            <span className="block text-xs text-gray-500 mt-1">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {collections.map((collection) => (
            <div key={collection.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">{collection.name}</div>
                <div className="text-sm text-gray-500 font-mono">{collection.id}</div>
                {collection.error && (
                  <div className="text-sm text-red-600 mt-1">{collection.error}</div>
                )}
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                {collection.status}
              </div>
            </div>
          ))}
        </div>
        
        {collections.some(c => c.status !== 'OK') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800">Issues Found</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Some collections are not accessible. Check your Appwrite dashboard and environment variables.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 