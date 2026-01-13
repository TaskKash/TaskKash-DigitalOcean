import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, TrendingUp } from 'lucide-react';
import { useLocation } from 'wouter';

const posts = [
  {
    id: 1,
    title: 'كيف تربح 1000 ريال شهرياً من TASKKASH',
    excerpt: 'دليل شامل للمبتدئين لتحقيق دخل ثابت من خلال إكمال المهام اليومية',
    image: '💰',
    category: 'نصائح',
    author: 'فريق TASKKASH',
    date: '2024-02-20',
    readTime: '5 دقائق'
  },
  {
    id: 2,
    title: '10 نصائح لزيادة أرباحك من المهام',
    excerpt: 'استراتيجيات مجربة لتحسين كفاءتك وزيادة دخلك اليومي',
    image: '📈',
    category: 'نصائح',
    author: 'أحمد محمد',
    date: '2024-02-18',
    readTime: '7 دقائق'
  },
  {
    id: 3,
    title: 'قصة نجاح: كيف حققت سارة 15,000 ريال في 3 أشهر',
    excerpt: 'تعرف على رحلة سارة من البداية حتى أصبحت من أنشط المستخدمين',
    image: '⭐',
    category: 'قصص نجاح',
    author: 'سارة أحمد',
    date: '2024-02-15',
    readTime: '10 دقائق'
  },
  {
    id: 4,
    title: 'دليل المعلنين: كيف تنشئ حملة ناجحة',
    excerpt: 'خطوات عملية لإنشاء حملات إعلانية فعالة تحقق أهدافك التسويقية',
    image: '🎯',
    category: 'للمعلنين',
    author: 'فريق TASKKASH',
    date: '2024-02-12',
    readTime: '8 دقائق'
  },
  {
    id: 5,
    title: 'تحديث جديد: ميزات جديدة في التطبيق',
    excerpt: 'اكتشف آخر التحديثات والميزات الجديدة التي أضفناها لتحسين تجربتك',
    image: '🚀',
    category: 'أخبار',
    author: 'فريق TASKKASH',
    date: '2024-02-10',
    readTime: '4 دقائق'
  },
  {
    id: 6,
    title: 'الأمان والخصوصية: كيف نحمي بياناتك',
    excerpt: 'شرح مفصل للإجراءات الأمنية التي نتخذها لحماية معلوماتك الشخصية',
    image: '🔒',
    category: 'أمان',
    author: 'فريق TASKKASH',
    date: '2024-02-08',
    readTime: '6 دقائق'
  }
];

const categories = ['الكل', 'نصائح', 'قصص نجاح', 'للمعلنين', 'أخبار', 'أمان'];

export default function Blog() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = React.useState('الكل');

  const filteredPosts = selectedCategory === 'الكل' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">مدونة TASKKASH</h1>
          <p className="text-xl opacity-90">
            نصائح، قصص نجاح، وآخر الأخبار
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Post */}
        {selectedCategory === 'الكل' && (
          <Card className="mb-8 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-12">
                <span className="text-9xl">{posts[0].image}</span>
              </div>
              <div className="p-8">
                <Badge className="mb-4">{posts[0].category}</Badge>
                <h2 className="text-3xl font-bold mb-4">{posts[0].title}</h2>
                <p className="text-muted-foreground mb-6">{posts[0].excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {posts[0].author}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {posts[0].date}
                  </div>
                  <span>{posts[0].readTime}</span>
                </div>
                <Button>
                  اقرأ المزيد
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.slice(selectedCategory === 'الكل' ? 1 : 0).map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-12">
                <span className="text-6xl">{post.image}</span>
              </div>
              <div className="p-6">
                <Badge className="mb-3">{post.category}</Badge>
                <h3 className="text-xl font-semibold mb-3 line-clamp-2">{post.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                  <span>{post.readTime}</span>
                </div>
                <Button variant="outline" className="w-full">
                  اقرأ المزيد
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Newsletter */}
        <Card className="mt-12 p-8 bg-gradient-to-r from-primary to-secondary text-white text-center">
          <h2 className="text-3xl font-bold mb-4">اشترك في نشرتنا البريدية</h2>
          <p className="text-lg opacity-90 mb-6">
            احصل على آخر النصائح والأخبار مباشرة في بريدك الإلكتروني
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="بريدك الإلكتروني"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <Button className="bg-white text-primary hover:bg-white/90">
              اشترك الآن
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

