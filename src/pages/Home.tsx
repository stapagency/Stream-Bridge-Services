import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Users, Award, Clock, Play, Star, Quote } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HomeProps {
  onNavigate: (page: string) => void;
}

interface Testimonial {
  id: string;
  client_name: string;
  company: string | null;
  position: string | null;
  content: string;
  rating: number;
  is_featured: boolean;
}

interface HomeContent {
  id: string;
  section: string;
  title: string;
  description: string;
  content: any;
  order_position: number;
}

interface Video {
  id: string;
  title: string;
  description: string;
  video_url: string | null;
  thumbnail_url: string | null;
  duration: string;
  position: number;
  is_active: boolean;
}

export default function Home({ onNavigate }: HomeProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [homeContent, setHomeContent] = useState<HomeContent[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [playingVideo, setPlayingVideo] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testimonialRes, homeRes, videoRes] = await Promise.all([
        supabase
          .from('testimonials')
          .select('*')
          .eq('is_featured', true)
          .limit(3),
        supabase
          .from('home_content')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
        supabase
          .from('videos')
          .select('*')
          .eq('is_active', true)
          .order('position', { ascending: true }),
      ]);

      if (testimonialRes.error) throw testimonialRes.error;
      if (homeRes.error) throw homeRes.error;
      if (videoRes.error) throw videoRes.error;

      setTestimonials(testimonialRes.data || []);
      setHomeContent(homeRes.data || []);
      setVideos(videoRes.data || []);
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  };

  const features = [
    {
      icon: Award,
      title: 'Certified Excellence',
      description: '15+ years of industry-leading cleaning and equipment services',
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Highly trained professionals dedicated to quality service',
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Emergency services and support available around the clock',
    },
    {
      icon: Sparkles,
      title: 'Quality Guaranteed',
      description: '100% satisfaction guarantee on all our services',
    },
  ];

  const heroContent = homeContent.find(c => c.section === 'hero');
  const statsContent = homeContent.find(c => c.section === 'stats');

  return (
    <div className="pt-20">
      <section className="relative bg-gradient-to-br from-[#003b67] via-[#004a7f] to-[#005a9c] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              {heroContent ? (
                <>
                  <h1 className="text-6xl font-bold mb-8 leading-tight">
                    {heroContent.title}
                    <span className="block text-[#f57a18]">Solutions</span>
                  </h1>
                  <p className="text-xl mb-8 text-gray-200 leading-relaxed">
                    {heroContent.description}
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-6xl font-bold mb-8 leading-tight">
                    Professional Cleaning
                    <span className="block text-[#f57a18]">Solutions</span>
                  </h1>
                  <p className="text-xl mb-8 text-gray-200 leading-relaxed">
                    Stream Bridge Services Inc. is your trusted partner for comprehensive commercial and
                    industrial cleaning services, state-of-the-art equipment supply, and international
                    trade solutions.
                  </p>
                </>
              )}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onNavigate('services')}
                  className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-8 py-4 rounded-lg font-semibold inline-flex items-center space-x-2 transition transform hover:scale-105 shadow-xl"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onNavigate('contact')}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold border-2 border-white/30 transition"
                >
                  Get a Quote
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-2 border border-white/20 shadow-2xl">
                <img
                  src="https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Professional cleaning team"
                  className="rounded-xl w-full h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-[#f57a18] text-white p-6 rounded-xl shadow-2xl">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-sm">Satisfied Clients</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative bg-[#f57a18] py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {statsContent && statsContent.content ? (
                <>
                  <div>
                    <div className="text-4xl font-bold">{statsContent.content.years || '15+'}</div>
                    <div className="text-sm opacity-90">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">{statsContent.content.clients || '500+'}</div>
                    <div className="text-sm opacity-90">Happy Clients</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">{statsContent.content.support || '24/7'}</div>
                    <div className="text-sm opacity-90">Support Available</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">{statsContent.content.satisfaction || '100%'}</div>
                    <div className="text-sm opacity-90">Satisfaction</div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <div className="text-4xl font-bold">15+</div>
                    <div className="text-sm opacity-90">Years Experience</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">500+</div>
                    <div className="text-sm opacity-90">Happy Clients</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">24/7</div>
                    <div className="text-sm opacity-90">Support Available</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">100%</div>
                    <div className="text-sm opacity-90">Satisfaction</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#003b67] mb-6">Why Choose Us</h2>
            <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We combine expertise, quality, and reliability to deliver exceptional results
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 rounded-2xl p-8 hover:border-[#f57a18] hover:shadow-2xl transition-all transform hover:-translate-y-2"
                >
                  <div className="bg-gradient-to-br from-[#003b67] to-[#005a9c] w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg">
                    <Icon className="h-8 w-8 text-[#f57a18]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#003b67] mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-[#003b67] mb-6">See Us In Action</h2>
              <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Watch how we deliver professional cleaning solutions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all">
                  <div className="relative bg-gradient-to-br from-[#003b67] to-[#005a9c] aspect-video">
                    {video.video_url && playingVideo === video.position ? (
                      <video
                        src={video.video_url}
                        controls
                        autoPlay
                        className="absolute inset-0 w-full h-full object-cover"
                        onEnded={() => setPlayingVideo(null)}
                      />
                    ) : (
                      <div
                        className="relative w-full h-full flex items-center justify-center group cursor-pointer"
                        onClick={() => video.video_url && setPlayingVideo(video.position)}
                      >
                        <div className="absolute inset-0 bg-black/20"></div>
                        {video.thumbnail_url ? (
                          <img
                            src={video.thumbnail_url}
                            alt={video.title}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={video.position === 1
                              ? "https://images.pexels.com/photos/4108715/pexels-photo-4108715.jpeg?auto=compress&cs=tinysrgb&w=800"
                              : "https://images.pexels.com/photos/5691607/pexels-photo-5691607.jpeg?auto=compress&cs=tinysrgb&w=800"
                            }
                            alt={video.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-40"
                          />
                        )}
                        {video.video_url && (
                          <div className="relative text-center z-10">
                            <div className="w-20 h-20 bg-[#f57a18] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl group-hover:scale-110 transition-transform">
                              <Play className="h-10 w-10 text-white ml-1" fill="white" />
                            </div>
                            <p className="text-white text-lg font-semibold">{video.title}</p>
                            <p className="text-gray-200 text-sm mt-2">{video.duration} minutes</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-[#003b67] mb-3">
                      {video.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {testimonials.length > 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-[#003b67] mb-6">What Our Clients Say</h2>
              <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-6"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Don't just take our word for it - hear from businesses we've helped
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2"
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
          <h2 className="text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-10 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Contact us today for a free consultation and discover how we can transform your space
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-12 py-5 rounded-lg font-bold text-lg inline-flex items-center space-x-3 transition transform hover:scale-105 shadow-2xl"
          >
            <span>Get Your Free Quote</span>
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </section>
    </div>
  );
}
