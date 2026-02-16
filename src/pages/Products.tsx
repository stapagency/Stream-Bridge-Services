import { useState, useEffect } from 'react';
import { Wrench, Package, ArrowRight, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductsProps {
  onNavigate: (page: string) => void;
}

interface Product {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  image_url: string;
  is_featured: boolean;
  order_position: number;
}

export default function Products({ onNavigate }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products_content')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setProducts(data || []);
      setFeaturedProducts((data || []).filter(p => p.is_featured).slice(0, 2));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Professional-grade quality',
    'Competitive pricing',
    'Fast delivery available',
    'Warranty included',
    'Expert consultation',
    'Bulk discounts',
  ];

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-[#003b67] to-[#005a9c] text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">Our Products</h1>
            <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-8"></div>
            <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              High-quality cleaning equipment and supplies for every business need
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center py-20">
                <p className="text-gray-500">Loading products...</p>
              </div>
            ) : products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-[#f57a18] w-14 h-14 rounded-xl flex items-center justify-center shadow-lg">
                        <Package className="h-7 w-7 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-[#003b67] mb-3">{product.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                    <ul className="space-y-2 mb-6">
                      {Array.isArray(product.features) && product.features.slice(0, 4).map((feature, iIndex) => (
                        <li key={iIndex} className="flex items-center space-x-2 text-gray-700">
                          <Star className="h-4 w-4 text-[#f57a18] fill-[#f57a18]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => onNavigate('contact')}
                      className="w-full bg-[#003b67] hover:bg-[#002a4d] text-white px-6 py-3 rounded-lg font-semibold transition inline-flex items-center justify-center space-x-2"
                    >
                      <span>Request Information</span>
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 flex items-center justify-center py-20">
                <p className="text-gray-500">No products available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#003b67] mb-6">Featured Products</h2>
            <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our most popular equipment and supplies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 mb-16">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="p-10">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-3xl font-bold text-[#003b67]">{product.title}</h3>
                      <div className="bg-[#f57a18] text-white px-4 py-2 rounded-lg font-bold">
                        {index === 0 ? 'Popular' : 'Featured'}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                      {product.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {Array.isArray(product.features) && product.features.slice(0, 4).map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center space-x-2 text-gray-700">
                          <Star className="h-5 w-5 text-[#f57a18] fill-[#f57a18]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => onNavigate('contact')}
                      className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-8 py-4 rounded-lg font-semibold transition w-full"
                    >
                      Request Quote
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 flex items-center justify-center py-10">
                <p className="text-gray-500">No featured products available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#003b67] to-[#005a9c] rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Maintenance Services</h2>
                <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                  Keep your equipment running at peak performance with our comprehensive maintenance and
                  repair services.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <Wrench className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Preventive Maintenance</h4>
                      <p className="text-gray-200">Regular service to prevent breakdowns</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Wrench className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Emergency Repairs</h4>
                      <p className="text-gray-200">24/7 emergency repair services</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Wrench className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Parts Replacement</h4>
                      <p className="text-gray-200">Genuine parts and accessories</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <Wrench className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-bold text-lg mb-1">Equipment Upgrades</h4>
                      <p className="text-gray-200">Modernize your existing equipment</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 border border-white/20">
                <h3 className="text-3xl font-bold mb-6">Why Buy From Us?</h3>
                <div className="grid grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Star className="h-5 w-5 text-[#f57a18] fill-[#f57a18] flex-shrink-0 mt-1" />
                      <span className="text-gray-200">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onNavigate('contact')}
                  className="mt-8 w-full bg-[#f57a18] hover:bg-[#d86a15] text-white px-8 py-4 rounded-lg font-semibold transition"
                >
                  Contact Sales Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-[#003b67] mb-6">Ready to Upgrade Your Equipment?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Contact our sales team today for expert advice and competitive pricing on all our products
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-12 py-5 rounded-lg font-bold text-lg inline-flex items-center space-x-3 transition transform hover:scale-105 shadow-xl"
          >
            <span>Get Product Information</span>
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </section>
    </div>
  );
}
