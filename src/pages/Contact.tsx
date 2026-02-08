import { Phone, Mail, MapPin, Clock, Send, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ContactContent {
  section: string;
  title: string;
  subtitle: string;
  phone_primary: string;
  phone_secondary: string;
  phone_hours: string;
  email_primary: string;
  email_secondary: string;
  email_response_time: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  business_hours_line1: string;
  business_hours_line2: string;
  business_hours_line3: string;
  emergency_note: string;
  cta_phone: string;
  cta_email: string;
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [content, setContent] = useState<Record<string, ContactContent>>({});

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_content')
        .select('*');

      if (error) throw error;

      const contentMap: Record<string, ContactContent> = {};
      data?.forEach((item) => {
        contentMap[item.section] = item;
      });
      setContent(contentMap);
    } catch (error) {
      console.error('Error fetching contact content:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      try {
        const emailResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          }
        );

        if (emailResponse.ok) {
          await supabase
            .from('contact_requests')
            .update({ email_sent: true })
            .eq('id', data.id);
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }

      setStatus({
        type: 'success',
        message: 'Thank you for contacting us! We will respond within 24 hours.',
      });
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
      });
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.message || 'Failed to submit your request. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="pt-20">
      <section className="bg-gradient-to-br from-[#003b67] to-[#005a9c] text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-6">{content.hero?.title || 'Contact Us'}</h1>
            <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-8"></div>
            <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              {content.hero?.subtitle || 'Get in touch with us today for a free consultation and quote'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-bold text-[#003b67] mb-8">{content.contact_info?.title || 'Get In Touch'}</h2>
              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                {content.contact_info?.subtitle || "Have questions or need a quote? Our team is here to help. Reach out to us through any of the methods below, and we'll respond promptly."}
              </p>

              <div className="space-y-8">
                <div className="flex items-start space-x-5">
                  <div className="bg-[#f57a18] p-4 rounded-xl shadow-lg flex-shrink-0">
                    <Phone className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-[#003b67] mb-2">Phone</h3>
                    {content.contact_info?.phone_primary && (
                      <p className="text-gray-700 text-lg">{content.contact_info.phone_primary}</p>
                    )}
                    {content.contact_info?.phone_secondary && (
                      <p className="text-gray-700 text-lg">{content.contact_info.phone_secondary}</p>
                    )}
                    {content.contact_info?.phone_hours && (
                      <p className="text-gray-600 text-sm mt-1">{content.contact_info.phone_hours}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <div className="bg-[#f57a18] p-4 rounded-xl shadow-lg flex-shrink-0">
                    <Mail className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-[#003b67] mb-2">Email</h3>
                    {content.contact_info?.email_primary && (
                      <p className="text-gray-700 text-lg">{content.contact_info.email_primary}</p>
                    )}
                    {content.contact_info?.email_secondary && (
                      <p className="text-gray-700 text-lg">{content.contact_info.email_secondary}</p>
                    )}
                    {content.contact_info?.email_response_time && (
                      <p className="text-gray-600 text-sm mt-1">{content.contact_info.email_response_time}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <div className="bg-[#f57a18] p-4 rounded-xl shadow-lg flex-shrink-0">
                    <MapPin className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-[#003b67] mb-2">Address</h3>
                    <p className="text-gray-700 text-lg">
                      {content.contact_info?.address_line1 && <>{content.contact_info.address_line1}<br /></>}
                      {content.contact_info?.address_line2 && <>{content.contact_info.address_line2}<br /></>}
                      {content.contact_info?.address_line3 && content.contact_info.address_line3}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-5">
                  <div className="bg-[#f57a18] p-4 rounded-xl shadow-lg flex-shrink-0">
                    <Clock className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-[#003b67] mb-2">Business Hours</h3>
                    {content.contact_info?.business_hours_line1 && (
                      <p className="text-gray-700">{content.contact_info.business_hours_line1}</p>
                    )}
                    {content.contact_info?.business_hours_line2 && (
                      <p className="text-gray-700">{content.contact_info.business_hours_line2}</p>
                    )}
                    {content.contact_info?.business_hours_line3 && (
                      <p className="text-gray-700">{content.contact_info.business_hours_line3}</p>
                    )}
                    {content.contact_info?.emergency_note && (
                      <p className="text-[#f57a18] font-semibold mt-2">
                        {content.contact_info.emergency_note}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 shadow-2xl border border-gray-100">
              <h2 className="text-4xl font-bold text-[#003b67] mb-3">{content.form?.title || 'Send Us a Message'}</h2>
              <p className="text-gray-600 mb-8 text-lg">
                {content.form?.subtitle || "Fill out the form below and we'll get back to you as soon as possible"}
              </p>

              {status && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
                    status.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  {status.type === 'success' ? (
                    <CheckCircle className="h-6 w-6 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-6 w-6 flex-shrink-0" />
                  )}
                  <p>{status.message}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#003b67] mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#f57a18] transition text-gray-900"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#003b67] mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#f57a18] transition text-gray-900"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#003b67] mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#f57a18] transition text-gray-900"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#003b67] mb-2">
                    Service Interested In
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#f57a18] transition text-gray-900"
                  >
                    <option value="">Select a service</option>
                    <option value="commercial">Commercial & Industrial Cleaning</option>
                    <option value="floor">Floor Waxing & Polishing</option>
                    <option value="duct">Duct Cleaning</option>
                    <option value="equipment">Equipment Supply</option>
                    <option value="slaughterhouse">Slaughterhouse Equipment</option>
                    <option value="import">Import/Export Services</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#003b67] mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#f57a18] transition text-gray-900 resize-none"
                    placeholder="Tell us about your needs..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#f57a18] hover:bg-[#d86a15] text-white px-8 py-5 rounded-xl font-bold text-lg transition transform hover:scale-105 shadow-xl inline-flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader className="h-6 w-6 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-6 w-6" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#003b67] to-[#005a9c] rounded-3xl p-12 md:p-16 text-white shadow-2xl text-center">
            <h2 className="text-5xl font-bold mb-6">{content.cta?.title || 'Need Immediate Assistance?'}</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
              {content.cta?.subtitle || "For urgent matters or emergency services, don't hesitate to call us directly"}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {content.cta?.cta_phone && (
                <a
                  href={`tel:${content.cta.cta_phone.replace(/[^\d+]/g, '')}`}
                  className="bg-[#f57a18] hover:bg-[#d86a15] text-white px-10 py-5 rounded-xl font-bold text-lg inline-flex items-center space-x-3 transition transform hover:scale-105 shadow-xl"
                >
                  <Phone className="h-6 w-6" />
                  <span>{content.cta.cta_phone}</span>
                </a>
              )}
              {content.cta?.cta_email && (
                <a
                  href={`mailto:${content.cta.cta_email}`}
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-10 py-5 rounded-xl font-bold text-lg border-2 border-white/30 inline-flex items-center space-x-3 transition"
                >
                  <Mail className="h-6 w-6" />
                  <span>Email Us</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-[#003b67] mb-6">{content.location?.title || 'Visit Our Location'}</h2>
            <div className="w-24 h-1 bg-[#f57a18] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {content.location?.subtitle || 'Stop by our office to discuss your needs in person'}
            </p>
          </div>

          <div className="bg-gray-200 rounded-2xl overflow-hidden shadow-xl h-[500px] flex items-center justify-center">
            <div className="text-center p-12">
              <MapPin className="h-20 w-20 text-[#003b67] mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-[#003b67] mb-4">
                {content.location?.address_line1 || '1234 Industrial Parkway'}
              </h3>
              <p className="text-xl text-gray-700">
                {content.location?.address_line2 && <>{content.location.address_line2}</>}
                {content.location?.address_line2 && content.location?.address_line3 && ', '}
                {content.location?.address_line3 && content.location.address_line3}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
