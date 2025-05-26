'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  Eye, 
  Heart, 
  Star, 
  Filter,
  Grid3X3,
  List,
  Image as ImageIcon,
  Video,
  FileText,
  Download,
  Share2
} from 'lucide-react';

// サンプルコンテンツデータ
const contentData = [
  {
    id: 1,
    type: 'image',
    title: 'Sakura in Kimono',
    description: 'Beautiful anime girl in traditional Japanese kimono',
    thumbnail: '/api/placeholder/300/400',
    likes: 1245,
    views: 5678,
    createdAt: '2024-01-15',
    tags: ['anime', 'kimono', 'traditional', 'sakura'],
    premium: false
  },
  {
    id: 2,
    type: 'video',
    title: 'Magical Girl Transformation',
    description: 'Epic magical girl transformation sequence',
    thumbnail: '/api/placeholder/300/400',
    likes: 2134,
    views: 8901,
    createdAt: '2024-01-14',
    tags: ['magical girl', 'transformation', 'anime'],
    premium: true
  },
  {
    id: 3,
    type: 'story',
    title: 'Adventure in the Digital World',
    description: 'A thrilling story about a digital adventure',
    thumbnail: '/api/placeholder/300/400',
    likes: 567,
    views: 2345,
    createdAt: '2024-01-13',
    tags: ['story', 'adventure', 'digital'],
    premium: false
  },
  {
    id: 4,
    type: 'image',
    title: 'Cyberpunk Waifu',
    description: 'Futuristic cyberpunk-style character design',
    thumbnail: '/api/placeholder/300/400',
    likes: 3456,
    views: 12345,
    createdAt: '2024-01-12',
    tags: ['cyberpunk', 'futuristic', 'neon'],
    premium: true
  },
  {
    id: 5,
    type: 'image',
    title: 'School Uniform Collection',
    description: 'Various school uniform designs',
    thumbnail: '/api/placeholder/300/400',
    likes: 890,
    views: 4567,
    createdAt: '2024-01-11',
    tags: ['school', 'uniform', 'collection'],
    premium: false
  },
  {
    id: 6,
    type: 'video',
    title: 'Dance Performance',
    description: 'Anime character dance performance',
    thumbnail: '/api/placeholder/300/400',
    likes: 1789,
    views: 6789,
    createdAt: '2024-01-10',
    tags: ['dance', 'performance', 'music'],
    premium: true
  }
];

const contentTypes = [
  { value: 'all', label: 'All Content', icon: Grid3X3 },
  { value: 'image', label: 'Images', icon: ImageIcon },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'story', label: 'Stories', icon: FileText }
];

export default function ContentPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('recent');
  const [showPremiumOnly, setShowPremiumOnly] = useState(false);

  const filteredContent = contentData.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesPremium = !showPremiumOnly || item.premium;
    
    return matchesSearch && matchesType && matchesPremium;
  });

  const sortedContent = [...filteredContent].sort((a, b) => {
    switch (sortBy) {
      case 'likes':
        return b.likes - a.likes;
      case 'views':
        return b.views - a.views;
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'story':
        return <FileText className="w-4 h-4" />;
      default:
        return <Grid3X3 className="w-4 h-4" />;
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Content Library</h1>
        <p className="text-muted-foreground">
          Discover and explore your favorite AI-generated content
        </p>
      </div>

      {/* フィルター・検索バー */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border rounded-md text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="likes">Most Liked</option>
            <option value="views">Most Viewed</option>
          </select>
          
          <Button
            variant={showPremiumOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowPremiumOnly(!showPremiumOnly)}
          >
            <Star className="w-4 h-4 mr-1" />
            Premium Only
          </Button>
        </div>
      </div>      {/* コンテンツタイプタブ */}
      <div className="mb-6">
        <Tabs value={selectedType} onValueChange={setSelectedType}>
          <TabsList className="grid w-full grid-cols-4">
            {contentTypes.map((type) => {
              const Icon = type.icon;
              return (
                <TabsTrigger key={type.value} value={type.value} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* コンテンツグリッド */}
      <div className={`grid gap-6 ${
        viewMode === 'grid' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
          : 'grid-cols-1'
      }`}>
        {sortedContent.map((item) => (
          <Card key={item.id} className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${
            viewMode === 'list' ? 'flex flex-row' : ''
          }`}>
            <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
              <div className="relative aspect-[3/4] bg-gray-200">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {getTypeIcon(item.type)}
                  {item.premium && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <h3 className="font-semibold mb-1 line-clamp-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {item.description}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {formatNumber(item.likes)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatNumber(item.views)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {item.createdAt}
                </div>
              </div>
              
              {viewMode === 'list' && (
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline">
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 結果が見つからない場合 */}
      {sortedContent.length === 0 && (
        <div className="text-center py-12">
          <Grid3X3 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No content found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}
