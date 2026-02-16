import { useState, useEffect } from 'react';
import { Building2, Star, Quote, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Customer {
  id: string;
  company_name: string;
  logo_url: string | null;
  description: string;
  category: string;
  order_position: number;
}

interface Testimonial {
  id: string;
  client_name: string;
  company: string | null;
  position: string | null;
  content: string;
  rating: number;
}

const categories = ['All', 'Retail', 'Restaurants', 'Wholesale', 'Corporate'];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, testimonialsRes] = await Promise.all([
        supabase
          .from('customers')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
        supabase
          .from('testimonials')
          .select('*')
          .eq('is_featured', true)
          .limit(6),
      ]);

      if (customersRes.error) throw customersRes.error;
      if (testimonialsRes.error) throw testimonialsRes.error;

      setCustomers(customersRes.data || []);
      setTestimonials(testimonialsRes.data || []);
    } catch (error) {
      console.error('Error fetching customers data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = selectedCategory === 'All'
    ? customers
    : customers.filter(c => c.category === selectedCategory);

  const getCategoryCount = (category: string) => {
    if (category === 'All') return customers.length;
    return customers.filter(c => c.category === category).length;
  };

  return (
    <div className="pt-20">
      <section className="relative bg-gradient-to-br from-[#003b67] via-[#004a7f] to-[#005a9c] text-white py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#f57a18] rounded-2xl mb-6 shadow-2xl">
            <Building2 className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-6">Our Customers</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Trusted by businesses and organizations across our region
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-12">
            <Filter className="h-5 w-5 text-[#003b67] mr-3" />
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    selectedCategory === category
                      ? 'bg-[#f57a18] text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                  <span className="ml-2 text-sm opacity-75">
                    ({getCategoryCount(category)})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-[#003b67] border-t-[#f57a18] rounded-full animate-spin"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-20">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No customers found in this category</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-gray-100 hover:border-[#f57a18]"
                >
                  <div className="flex items-center justify-center h-32 mb-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden">
                    {customer.logo_url ? (
                      <img
                        src={customer.logo_url}
                        alt={customer.company_name}
                        className="max-w-full max-h-full object-contain p-4"
                      />
                    ) : (
                      <div className="text-center">
                        <Building2 className="h-12 w-12 text-[#003b67] mx-auto mb-2" />
                        <span className="text-xs text-gray-500 uppercase tracking-wide">
                          {customer.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-[#003b67] mb-3 text-center">
                    {customer.company_name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed text-center">
                    {customer.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="inline-block bg-[#003b67] text-white text-xs px-3 py-1 rounded-full">
                      {customer.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-[#003b67] mb-6">What Our Customers Say</h2>
              <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Hear directly from the businesses we've helped succeed
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
                >
                  <div className="flex items-center justify-between mb-6">
                    <Quote className="h-12 w-12 text-[#f57a18] opacity-50" />
                    <div className="flex space-x-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-[#f57a18] fill-[#f57a18]" />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="border-t border-gray-200 pt-4">
                    <p className="font-bold text-[#003b67]">{testimonial.client_name}</p>
                    {testimonial.position && testimonial.company && (
                      <p className="text-sm text-gray-600">
                        {testimonial.position}, {testimonial.company}
                      </p>
                    )}
                    {!testimonial.position && testimonial.company && (
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-24 bg-gradient-to-br from-[#003b67] to-[#005a9c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-6">Join Our Growing Family</h2>
          <p className="text-xl mb-10 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Become part of our trusted network of satisfied customers
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="#contact"
              className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-12 py-5 rounded-lg font-bold text-lg transition transform hover:scale-105 shadow-2xl inline-block"
            >
              Get Started Today
            </a>
            <a
              href="#services"
              className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-12 py-5 rounded-lg font-bold text-lg border-2 border-white/30 transition inline-block"
            >
              View Our Services
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
