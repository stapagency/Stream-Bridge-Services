import { useState, useEffect } from 'react';
import { Trash2, Eye, CheckCircle, Clock, Loader, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ContactRequest {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  service: string | null;
  message: string;
  status: 'pending' | 'contacted' | 'completed';
  email_sent: boolean;
  created_at: string;
}

interface ContactRequestsManagerProps {
  onUpdate: () => void;
}

export default function ContactRequestsManager({ onUpdate }: ContactRequestsManagerProps) {
  const [requests, setRequests] = useState<ContactRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ContactRequest | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contact_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_requests')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await fetchRequests();
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    try {
      const { error } = await supabase
        .from('contact_requests')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchRequests();
      onUpdate();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'contacted': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="h-8 w-8 text-[#003b67] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#003b67]">Contact Requests</h2>
        <p className="text-gray-600">Manage customer inquiries and contact form submissions</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p>No contact requests yet</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-gray-50 rounded-lg p-6 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-[#003b67]">{request.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-1">{request.email}</p>
                  {request.phone && <p className="text-gray-600 mb-1">{request.phone}</p>}
                  {request.service && (
                    <p className="text-sm text-gray-500">Service: {request.service}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(request.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
                    className="p-2 text-[#003b67] hover:bg-white rounded-lg transition"
                    title="View details"
                  >
                    <Eye className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteRequest(request.id)}
                    className="p-2 text-red-600 hover:bg-white rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {selectedRequest?.id === request.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-bold text-[#003b67] mb-2">Message:</h4>
                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">{request.message}</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => updateStatus(request.id, 'pending')}
                      className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-medium hover:bg-yellow-200 transition flex items-center space-x-2"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Pending</span>
                    </button>
                    <button
                      onClick={() => updateStatus(request.id, 'contacted')}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium hover:bg-blue-200 transition flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Contacted</span>
                    </button>
                    <button
                      onClick={() => updateStatus(request.id, 'completed')}
                      className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium hover:bg-green-200 transition flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Completed</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
