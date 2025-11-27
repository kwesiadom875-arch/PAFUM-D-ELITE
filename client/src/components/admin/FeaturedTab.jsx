import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_URL from '../../config';
import { handleError, retryRequest } from '../../utils/errorHandler';
import { isRequired, isValidUrl } from '../../utils/validation';
import { FormSkeleton } from '../LoadingSkeleton';

const FeaturedTab = () => {
    const [featuredForm, setFeaturedForm] = useState({
        name: '', tagline: '', description: '', image: '', videoUrl: '', link: '/shop'
    });
    const [uploadingVideo, setUploadingVideo] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        fetchFeatured();
    }, []);

    const fetchFeatured = async () => {
        setIsFetching(true);
        try {
            await retryRequest(async () => {
                const res = await axios.get(`${API_URL}/api/featured`);
                if (res.data && res.data.name) {
                    setFeaturedForm(res.data);
                }
            });
        } catch (err) {
            handleError(err, 'Failed to load featured perfume');
        } finally {
            setIsFetching(false);
        }
    };

    const handleFeaturedChange = (e) => {
        setFeaturedForm({ ...featuredForm, [e.target.name]: e.target.value });
    };

    const handleFeaturedSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!isRequired(featuredForm.name)) return toast.error("Name is required");
        if (!isRequired(featuredForm.tagline)) return toast.error("Tagline is required");
        if (!isRequired(featuredForm.image)) return toast.error("Image URL is required");
        if (!isValidUrl(featuredForm.image)) return toast.error("Invalid Image URL");

        try {
            await axios.post(`${API_URL}/api/featured`, featuredForm);
            toast.success("Featured Perfume Updated!");
        } catch (error) {
            handleError(error, "Failed to update featured perfume");
        }
    };

    const handleVideoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('video', file);

        setUploadingVideo(true);
        try {
            const res = await axios.post(`${API_URL}/api/admin/upload-hero-video`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success("Video Uploaded & Processed!");
            setFeaturedForm(prev => ({ ...prev, videoUrl: res.data.videoUrl }));
        } catch (error) {
            handleError(error, "Video upload failed");
        } finally {
            setUploadingVideo(false);
        }
    };

    if (isFetching) {
        return (
            <div className="glass-card form-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Manage Featured Perfume</h3>
                <FormSkeleton />
            </div>
        );
    }

    return (
        <div className="glass-card form-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px', color: '#C5A059' }}>Manage Featured Perfume</h3>
            <p style={{ marginBottom: '20px', color: '#888' }}>This is the perfume that appears at the end of the Home page scroll.</p>
            <form onSubmit={handleFeaturedSubmit}>
                <input name="name" value={featuredForm.name} placeholder="Perfume Name" onChange={handleFeaturedChange} required />
                <input name="tagline" value={featuredForm.tagline} placeholder="Tagline (e.g. A journey through...)" onChange={handleFeaturedChange} required />
                <input name="image" value={featuredForm.image} placeholder="Image URL" onChange={handleFeaturedChange} required />
                {featuredForm.image && <img src={featuredForm.image} alt="Preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' }} />}

                <div style={{ marginBottom: '15px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hero Video (Auto-processed)</label>
                    <input type="file" accept="video/*" onChange={handleVideoUpload} disabled={uploadingVideo} />
                    {uploadingVideo && <p style={{ color: '#C5A059' }}>Processing video... please wait.</p>}
                    {featuredForm.videoUrl && <p style={{ fontSize: '0.8rem', color: 'green', marginTop: '5px' }}>Current Video: {featuredForm.videoUrl}</p>}
                </div>

                <textarea name="description" value={featuredForm.description} placeholder="Short Description" onChange={handleFeaturedChange} rows="3" required />
                <input name="link" value={featuredForm.link} placeholder="Link (e.g. /shop)" onChange={handleFeaturedChange} />
                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Update Featured Perfume</button>
            </form>
        </div>
    );
};

export default FeaturedTab;
