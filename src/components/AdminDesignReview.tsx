import React, { useState, useEffect } from 'react';
import { supabaseApi } from '../lib/supabaseApi';

interface Design {
  id: string;
  generatedImageUrl: string;
  handImageUrl: string;
  reviewStatus: string;
  canBeTemplate: boolean;
  userRating?: number;
  userFeedback?: string;
  feedbackAt?: string;
  createdAt: string;
  user: { id: string; name: string; email: string; avatar?: string };
  style?: { id: string; name: string };
}

const AdminDesignReview: React.FC = () => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [canBeTemplate, setCanBeTemplate] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadDesigns();
  }, [filter, page]);

  const loadStats = async () => {
    try {
      const data = await supabaseApi.getDesignReviewStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadDesigns = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 12 };
      if (filter !== 'all') params.status = filter;
      
      const data = await supabaseApi.getAdminDesigns(params);
      setDesigns(data.designs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to load designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedDesign) return;

    try {
      await supabaseApi.reviewDesign(selectedDesign.id, {
        status,
        notes: reviewNotes,
        canBeTemplate: status === 'APPROVED' ? canBeTemplate : false,
      });
      
      setSelectedDesign(null);
      setReviewNotes('');
      setCanBeTemplate(false);
      loadDesigns();
      loadStats();
    } catch (error) {
      console.error('Failed to review design:', error);
      alert('Failed to review design');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`material-symbols-outlined text-lg ${
          i < rating ? 'text-yellow-500' : 'text-gray-300'
        }`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        star
      </span>
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-yellow-600 text-sm font-medium">Pending Review</span>
              <span className="material-symbols-outlined text-yellow-500">pending</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700 mt-2">{stats.pending}</p>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-green-600 text-sm font-medium">Approved</span>
              <span className="material-symbols-outlined text-green-500">check_circle</span>
            </div>
            <p className="text-2xl font-bold text-green-700 mt-2">{stats.approved}</p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-red-600 text-sm font-medium">Rejected</span>
              <span className="material-symbols-outlined text-red-500">cancel</span>
            </div>
            <p className="text-2xl font-bold text-red-700 mt-2">{stats.rejected}</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-blue-600 text-sm font-medium">Avg Rating</span>
              <span className="material-symbols-outlined text-blue-500">star</span>
            </div>
            <p className="text-2xl font-bold text-blue-700 mt-2">
              {stats.avgRating ? stats.avgRating.toFixed(1) : 'N/A'}
            </p>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(['all', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(status => (
          <button
            key={status}
            onClick={() => { setFilter(status); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
          >
            {status === 'all' ? 'All Designs' : status}
            {status === 'PENDING' && stats?.pending > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {stats.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Designs Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : designs.length === 0 ? (
        <div className="text-center py-12 text-text-primary-light/50">
          <span className="material-symbols-outlined text-6xl mb-4">image</span>
          <p>No designs found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {designs.map(design => (
            <div
              key={design.id}
              className="bg-white dark:bg-background-dark/50 rounded-xl overflow-hidden shadow-md border border-primary/10 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedDesign(design)}
            >
              <div className="aspect-[3/4] bg-cover bg-center relative" style={{ backgroundImage: `url("${design.generatedImageUrl}")` }}>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(design.reviewStatus)}`}>
                    {design.reviewStatus}
                  </span>
                </div>
                {design.canBeTemplate && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-purple-500 text-white rounded-full text-xs font-medium">
                      Template
                    </span>
                  </div>
                )}
                {design.userRating && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-yellow-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="text-white text-xs">{design.userRating}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-medium text-sm truncate">{design.user.name}</p>
                <p className="text-xs text-text-primary-light/60">
                  {design.style?.name || 'Custom'} • {new Date(design.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-primary/20 rounded-lg hover:bg-primary/5 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-primary/20 rounded-lg hover:bg-primary/5 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Review Modal */}
      {selectedDesign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-background-dark rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-primary/10">
              <h3 className="text-xl font-bold">Review Design</h3>
              <button onClick={() => setSelectedDesign(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Design Image */}
                <div>
                  <img
                    src={selectedDesign.generatedImageUrl}
                    alt="Design"
                    className="w-full rounded-xl shadow-lg"
                  />
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-lg mb-2">Design Details</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-text-primary-light/60">User:</span> {selectedDesign.user.name}</p>
                      <p><span className="text-text-primary-light/60">Email:</span> {selectedDesign.user.email}</p>
                      <p><span className="text-text-primary-light/60">Style:</span> {selectedDesign.style?.name || 'Custom'}</p>
                      <p><span className="text-text-primary-light/60">Created:</span> {new Date(selectedDesign.createdAt).toLocaleString()}</p>
                      <p>
                        <span className="text-text-primary-light/60">Status:</span>{' '}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedDesign.reviewStatus)}`}>
                          {selectedDesign.reviewStatus}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* User Feedback */}
                  {selectedDesign.userRating && (
                    <div className="p-4 bg-blue-50 rounded-xl">
                      <h5 className="font-medium mb-2">User Feedback</h5>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(selectedDesign.userRating)}
                        <span className="text-sm text-text-primary-light/60">
                          ({selectedDesign.userRating}/5)
                        </span>
                      </div>
                      {selectedDesign.userFeedback && (
                        <p className="text-sm text-text-primary-light/70 italic">
                          "{selectedDesign.userFeedback}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Review Actions */}
                  {selectedDesign.reviewStatus === 'PENDING' && (
                    <div className="space-y-4 pt-4 border-t border-primary/10">
                      <div>
                        <label className="block text-sm font-medium mb-1">Review Notes (Optional)</label>
                        <textarea
                          value={reviewNotes}
                          onChange={e => setReviewNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-primary/20 rounded-lg resize-none"
                          rows={3}
                          placeholder="Add notes about this design..."
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={canBeTemplate}
                          onChange={e => setCanBeTemplate(e.target.checked)}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <span className="text-sm">Allow this design to be used as a template for other users</span>
                      </label>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleReview('REJECTED')}
                          className="flex-1 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleReview('APPROVED')}
                          className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDesignReview;
