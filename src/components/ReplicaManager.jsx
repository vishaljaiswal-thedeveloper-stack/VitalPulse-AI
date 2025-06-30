import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  createTavusReplica, 
  getTavusReplicaStatus, 
  listTavusReplicas, 
  deleteTavusReplica,
  uploadTrainingVideo,
  TavusApiError 
} from '../lib/tavusApi';
import './ReplicaManager.css';

function ReplicaManager({ onReplicaSelect, selectedReplicaId }) {
  const { t } = useTranslation();
  const [replicas, setReplicas] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    description: '',
    videoFile: null,
    audioFile: null,
    type: 'standard'
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReplicas();
  }, []);

  const loadReplicas = async () => {
    try {
      setIsLoading(true);
      const replicaList = await listTavusReplicas();
      setReplicas(replicaList.replicas || []);
    } catch (error) {
      console.error('Error loading replicas:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setCreateFormData(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const handleCreateReplica = async (e) => {
    e.preventDefault();
    
    if (!createFormData.videoFile) {
      setError('Please select a training video file');
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // Step 1: Upload training video
      console.log('📤 Uploading training files...');
      setUploadProgress(25);
      
      const uploadResult = await uploadTrainingVideo(
        createFormData.videoFile, 
        createFormData.audioFile
      );
      
      setUploadProgress(50);
      
      // Step 2: Create replica with uploaded video
      console.log('🎭 Creating replica...');
      const replicaData = {
        name: createFormData.name || 'VitalPulse Health Guide',
        description: createFormData.description || 'AI Health Assistant for VitalPulse',
        videoUrl: uploadResult.videoUrl,
        audioUrl: uploadResult.audioUrl,
        type: createFormData.type,
        properties: {
          voice_enhancement: true,
          face_enhancement: true,
          background_removal: true
        }
      };
      
      setUploadProgress(75);
      
      const replica = await createTavusReplica(replicaData);
      
      setUploadProgress(100);
      
      console.log('✅ Replica created successfully:', replica);
      
      // Reset form and reload replicas
      setCreateFormData({
        name: '',
        description: '',
        videoFile: null,
        audioFile: null,
        type: 'standard'
      });
      setShowCreateForm(false);
      setUploadProgress(0);
      
      await loadReplicas();
      
      // Auto-select the new replica
      if (onReplicaSelect) {
        onReplicaSelect(replica.replicaId);
      }
      
    } catch (error) {
      console.error('❌ Replica creation failed:', error);
      setError(error.message);
    } finally {
      setIsCreating(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteReplica = async (replicaId) => {
    if (!confirm('Are you sure you want to delete this replica? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteTavusReplica(replicaId);
      await loadReplicas();
      
      // If deleted replica was selected, clear selection
      if (selectedReplicaId === replicaId && onReplicaSelect) {
        onReplicaSelect(null);
      }
    } catch (error) {
      console.error('Error deleting replica:', error);
      setError(error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return '#138808';
      case 'training': return '#FF9933';
      case 'failed': return '#dc3545';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ready': return '✅';
      case 'training': return '⏳';
      case 'failed': return '❌';
      default: return '⚪';
    }
  };

  if (isLoading) {
    return (
      <div className="replica-manager">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading replicas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="replica-manager">
      <div className="replica-header">
        <h2>Tavus Replica Manager</h2>
        <button 
          className="create-replica-btn"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Replica'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="create-replica-form">
          <h3>Create New Health Guide Replica</h3>
          <form onSubmit={handleCreateReplica}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="replicaName">Replica Name</label>
                <input
                  type="text"
                  id="replicaName"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="VitalPulse Health Guide"
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="replicaType">Replica Type</label>
                <select
                  id="replicaType"
                  value={createFormData.type}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="form-select"
                >
                  <option value="standard">Standard Quality</option>
                  <option value="premium">Premium Quality</option>
                  <option value="custom">Custom Training</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="replicaDescription">Description</label>
              <textarea
                id="replicaDescription"
                value={createFormData.description}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="AI Health Assistant for VitalPulse healthcare platform"
                className="form-textarea"
                rows="3"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="trainingVideo">Training Video *</label>
                <input
                  type="file"
                  id="trainingVideo"
                  accept="video/*"
                  onChange={(e) => handleFileChange(e, 'videoFile')}
                  className="form-file"
                  required
                />
                <small className="file-hint">
                  Upload a 2-5 minute video of the person speaking clearly. MP4 format recommended.
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="trainingAudio">Training Audio (Optional)</label>
                <input
                  type="file"
                  id="trainingAudio"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, 'audioFile')}
                  className="form-file"
                />
                <small className="file-hint">
                  Optional: Separate audio file for better voice quality.
                </small>
              </div>
            </div>

            {isCreating && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  {uploadProgress < 50 ? 'Uploading files...' :
                   uploadProgress < 75 ? 'Creating replica...' :
                   uploadProgress < 100 ? 'Finalizing...' : 'Complete!'}
                </p>
              </div>
            )}

            <div className="form-actions">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isCreating || !createFormData.videoFile}
              >
                {isCreating ? 'Creating Replica...' : 'Create Replica'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="replicas-list">
        <h3>Available Replicas ({replicas.length})</h3>
        
        {replicas.length === 0 ? (
          <div className="no-replicas">
            <div className="no-replicas-icon">🎭</div>
            <h4>No Replicas Found</h4>
            <p>Create your first replica to get started with personalized AI video calls.</p>
          </div>
        ) : (
          <div className="replicas-grid">
            {replicas.map((replica) => (
              <div 
                key={replica.replica_id} 
                className={`replica-card ${selectedReplicaId === replica.replica_id ? 'selected' : ''}`}
              >
                <div className="replica-header">
                  <div className="replica-info">
                    <h4>{replica.replica_name}</h4>
                    <p className="replica-id">ID: {replica.replica_id}</p>
                  </div>
                  
                  <div className="replica-status">
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: getStatusColor(replica.status),
                        color: 'white'
                      }}
                    >
                      {getStatusIcon(replica.status)} {replica.status}
                    </span>
                  </div>
                </div>

                {replica.training_progress !== undefined && replica.status === 'training' && (
                  <div className="training-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${replica.training_progress}%` }}
                      ></div>
                    </div>
                    <p className="progress-text">Training: {replica.training_progress}%</p>
                  </div>
                )}

                <div className="replica-details">
                  <p><strong>Type:</strong> {replica.replica_type || 'Standard'}</p>
                  <p><strong>Created:</strong> {new Date(replica.created_at).toLocaleDateString()}</p>
                  {replica.estimated_completion_time && (
                    <p><strong>ETA:</strong> {new Date(replica.estimated_completion_time).toLocaleString()}</p>
                  )}
                </div>

                <div className="replica-actions">
                  <button 
                    className={`select-btn ${selectedReplicaId === replica.replica_id ? 'selected' : ''}`}
                    onClick={() => onReplicaSelect && onReplicaSelect(replica.replica_id)}
                    disabled={replica.status !== 'ready'}
                  >
                    {selectedReplicaId === replica.replica_id ? '✓ Selected' : 'Select'}
                  </button>
                  
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteReplica(replica.replica_id)}
                    title="Delete Replica"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReplicaManager;