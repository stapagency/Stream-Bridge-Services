import { useState, useEffect } from 'react';
import { CheckCircle, Target, Eye, Award, Shield, Globe2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AboutSection {
  id: string;
  section: string;
  title: string;
  content: string;
  image_url?: string;
  order_position: number;
}

export default function About() {
  const [aboutSections, setAboutSections] = useState<AboutSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .eq('is_active', true)
        .order('order_position', { ascending: true });

      if (error) throw error;
      setAboutSections(data || []);
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const values = [
    {
      icon: Target,
      title: 'Quality First',
      description: 'We never compromise on the quality of our services and products',
    },
    {
      icon: Shield,
      title: 'Reliability',
      description: 'Consistent, dependable service you can count on',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Striving for perfection in every project we undertake',
    },
    {
      icon: Globe2,
      title: 'Global Reach',
      description: 'International capabilities with local expertise',
    },
  ];

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-[#003b67] to-[#005a9c] text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">About Stream Bridge Services</h1>
            <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-8"></div>
            <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              Your trusted partner in professional cleaning and industrial equipment solutions
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-500">Loading about content...</p>
            </div>
          ) : aboutSections.length > 0 ? (
            <div className="space-y-24">
              {aboutSections.map((section) => (
                <div key={section.id} className="grid lg:grid-cols-2 gap-16 items-center">
                  <div>
                    <h2 className="text-5xl font-bold text-[#003b67] mb-8">
                      {section.title}
                    </h2>
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                      {section.content}
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="h-7 w-7 text-[#f57a18] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-[#003b67] text-lg mb-1">Certified Professionals</h4>
                          <p className="text-gray-600">Our team consists of highly trained and certified specialists</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="h-7 w-7 text-[#f57a18] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-[#003b67] text-lg mb-1">Quality Equipment</h4>
                          <p className="text-gray-600">We use and supply state-of-the-art machines and tools</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-4">
                        <CheckCircle className="h-7 w-7 text-[#f57a18] flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-bold text-[#003b67] text-lg mb-1">Global Reach</h4>
                          <p className="text-gray-600">International operations and capabilities</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {section.image_url && (
                      <img
                        src={section.image_url}
                        alt={section.title}
                        className="rounded-2xl shadow-2xl w-full h-[400px] object-cover"
                      />
                    )}
                    <img
                      src="https://images.pexels.com/photos/8199166/pexels-photo-8199166.jpeg?auto=compress&cs=tinysrgb&w=1200"
                      alt="Professional service"
                      className="rounded-2xl shadow-2xl w-full h-[300px] object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-gray-500">No about content available</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div className="bg-white rounded-2xl p-12 shadow-xl border-l-4 border-[#f57a18]">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-[#003b67] p-4 rounded-xl">
                  <Target className="h-10 w-10 text-[#f57a18]" />
                </div>
                <h3 className="text-4xl font-bold text-[#003b67]">Our Mission</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To provide exceptional cleaning services and quality equipment that exceed client
                expectations while maintaining the highest standards of professionalism, safety, and
                environmental responsibility. We are committed to being the most trusted partner for
                businesses seeking comprehensive cleaning and equipment solutions.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-12 shadow-xl border-l-4 border-[#f57a18]">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-[#003b67] p-4 rounded-xl">
                  <Eye className="h-10 w-10 text-[#f57a18]" />
                </div>
                <h3 className="text-4xl font-bold text-[#003b67]">Our Vision</h3>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                To be the leading provider of integrated cleaning and industrial equipment solutions across
                North America and beyond. We envision a future where businesses of all sizes have access to
                world-class cleaning services and equipment that promote health, safety, and productivity in
                every workspace.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#003b67] mb-6">Our Core Values</h2>
            <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="text-center bg-gradient-to-br from-gray-50 to-white rounded-2xl p-10 hover:shadow-2xl transition-all transform hover:-translate-y-2"
                >
                  <div className="bg-gradient-to-br from-[#003b67] to-[#005a9c] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Icon className="h-10 w-10 text-[#f57a18]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#003b67] mb-4">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-[#003b67] to-[#005a9c] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6">Why Businesses Trust Us</h2>
            <div className="w-24 h-1 bg-[#f57a18] mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold mb-4">Experience</h3>
              <p className="text-gray-200 leading-relaxed">
                Over 15 years of proven expertise in commercial and industrial cleaning services with
                hundreds of satisfied clients.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold mb-4">Versatility</h3>
              <p className="text-gray-200 leading-relaxed">
                From routine cleaning to specialized equipment supply and international trade, we handle it
                all with professionalism.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold mb-4">Commitment</h3>
              <p className="text-gray-200 leading-relaxed">
                24/7 support, eco-friendly practices, and a 100% satisfaction guarantee on every service we
                provide.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
