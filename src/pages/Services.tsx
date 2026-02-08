import { useState, useEffect } from 'react';
import { Sparkles, Droplets, Package, Wind, Factory, Globe, CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ServicesProps {
  onNavigate: (page: string) => void;
}

interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: string;
  image_url: string;
  order_position: number;
}

const iconMap: { [key: string]: any } = {
  Sparkles,
  Droplets,
  Package,
  Wind,
  Factory,
  Globe,
};

export default function Services({ onNavigate }: ServicesProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services_content')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-[#003b67] to-[#005a9c] text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">Our Services</h1>
            <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-8"></div>
            <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Comprehensive cleaning and equipment solutions tailored to your business needs
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-500">Loading services...</p>
              </div>
            ) : services.length > 0 ? (
              services.map((service, index) => {
                const IconComponent = iconMap[service.icon] || Sparkles;
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={service.id}
                    className={`grid lg:grid-cols-2 gap-12 items-center ${
                      !isEven ? 'lg:flex-row-reverse' : ''
                    }`}
                  >
                    <div className={isEven ? '' : 'lg:order-2'}>
                      <div className="bg-gradient-to-br from-[#003b67] to-[#005a9c] w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                        <IconComponent className="h-8 w-8 text-[#f57a18]" />
                      </div>
                      <h2 className="text-4xl font-bold text-[#003b67] mb-6">{service.title}</h2>
                      <p className="text-lg text-gray-700 mb-8 leading-relaxed">{service.description}</p>
                      <ul className="space-y-4 mb-8">
                        {Array.isArray(service.features) && service.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start space-x-3">
                            <CheckCircle className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => onNavigate('contact')}
                        className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center space-x-2 transition transform hover:scale-105 shadow-lg"
                      >
                        <span>Request Quote</span>
                        <ArrowRight className="h-5 w-5" />
                      </button>
                    </div>

                    <div className={isEven ? '' : 'lg:order-1'}>
                      <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-br from-[#f57a18]/20 to-[#003b67]/20 rounded-2xl blur-xl"></div>
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="relative rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-20">
                <p className="text-gray-500">No services available</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#003b67] to-[#005a9c] rounded-3xl p-12 md:p-16 text-white shadow-2xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">Why Choose Our Services?</h2>
                <p className="text-xl text-gray-200 mb-8 leading-relaxed">
                  We combine expertise, quality equipment, and exceptional customer service to deliver
                  results that exceed expectations.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <span className="text-lg">Eco-friendly cleaning products and methods</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <span className="text-lg">Flexible scheduling to minimize business disruption</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <span className="text-lg">Fully insured and bonded professional teams</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <span className="text-lg">Competitive pricing with transparent quotes</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <span className="text-lg">24/7 emergency services available</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-[#f57a18] flex-shrink-0 mt-1" />
                    <span className="text-lg">100% satisfaction guarantee</span>
                  </li>
                </ul>
              </div>

              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/5691607/pexels-photo-5691607.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Professional team"
                  className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
                />
                <div className="absolute -bottom-6 -right-6 bg-[#f57a18] text-white p-8 rounded-xl shadow-2xl">
                  <div className="text-5xl font-bold">100%</div>
                  <div className="text-lg">Satisfaction Guaranteed</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-[#003b67] mb-6">Ready to Experience Excellence?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Contact us today for a free consultation and let us show you how our services can transform
            your business environment
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-12 py-5 rounded-lg font-bold text-lg inline-flex items-center space-x-3 transition transform hover:scale-105 shadow-xl"
          >
            <span>Get Your Free Quote</span>
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </section>
    </div>
  );
}
