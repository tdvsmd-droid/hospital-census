import React, { useState } from 'react';

export default function PatientModal({ room, allRooms, patient, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: patient ? patient.name : '',
    age: patient ? patient.ageSex.split('/')[0].trim() : '',
    gender: patient ? (patient.ageSex.includes('M') ? 'Male' : 'Female') : 'Male',
    admissionDate: patient ? patient.admissionDate : new Date().toISOString().split('T')[0],
    diagnosis: patient ? patient.admittingDiagnosis : '',
    physician: patient ? (patient.physician || '') : '',
    status: patient ? patient.status : 'New Admission',
    // Endorsement fields added directly upon intake
    currentCondition: patient ? (patient.endorsement?.currentCondition || '') : 'Stable, conscious, coherent.',
    diagnostics: patient ? (patient.endorsement?.diagnostics || '') : 'Pending baseline labs.',
    therapeutics: patient ? (patient.endorsement?.therapeutics || '') : 'As per initial hospital orders.'
  });

  // Local state for location input
  const isPendingQueue = room === 'Pending Room Assignment';
  const modalTitle = isPendingQueue ? 'Pending Room Assignment' : 'Add Referral Patient';

  // For referrals, start blank. For pending room assignments, use the default string.
  const [customLocationText, setCustomLocationText] = useState(isPendingQueue ? 'Pending Room Assignment' : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    let finalRoom = customLocationText.trim();
    if (!finalRoom) {
      finalRoom = 'External Referral Location';
    }

    onSave(finalRoom, formData);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCard}>
        <h3 style={{ margin: '0 0 15px 0', color: '#003d82' }}>{modalTitle}</h3>
        
        <form onSubmit={handleSubmit}>
          {!isPendingQueue && (
            <div style={{ marginBottom: '12px' }}>
              <label style={styles.label}>Referring Department / External Location & Bed</label>
              <input 
                type="text" 
                placeholder="e.g., ER Cubicle 4, Surgical Ward Bed 2" 
                value={customLocationText}
                onChange={(e) => setCustomLocationText(e.target.value)}
                style={styles.input}
                required
              />
              <span style={styles.helperText}>Type the exact ward, room, or bed where the patient is currently located.</span>
            </div>
          )}

          <div style={{ marginBottom: '12px' }}>
            <label style={styles.label}>Patient Full Name</label>
            <input 
              type="text" 
              placeholder="e.g., Dela Cruz, Juan" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Age</label>
              <input 
                type="number" 
                placeholder="e.g., 65" 
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                style={styles.input}
                required
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.label}>Gender</label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                style={styles.input}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={styles.label}>Admission Date</label>
            <input 
              type="date" 
              value={formData.admissionDate}
              onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={styles.label}>Admitting Diagnosis / Impression</label>
            <input 
              type="text" 
              placeholder="e.g., Community-Acquired Pneumonia" 
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={styles.label}>Attending Physician</label>
            <input 
              type="text" 
              placeholder="e.g., Dr. Santos" 
              value={formData.physician}
              onChange={(e) => setFormData({...formData, physician: e.target.value})}
              style={styles.input}
            />
          </div>

          <hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #eee' }} />
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#0056b3' }}>Initial Endorsement Details</h4>

          <div style={{ marginBottom: '10px' }}>
            <label style={styles.label}>Current Condition</label>
            <textarea 
              rows="2"
              value={formData.currentCondition}
              onChange={(e) => setFormData({...formData, currentCondition: e.target.value})}
              style={styles.textarea}
            />
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={styles.label}>Diagnostics / Labs Ordered</label>
            <textarea 
              rows="2"
              value={formData.diagnostics}
              onChange={(e) => setFormData({...formData, diagnostics: e.target.value})}
              style={styles.textarea}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={styles.label}>Therapeutics / Medications</label>
            <textarea 
              rows="2"
              value={formData.therapeutics}
              onChange={(e) => setFormData({...formData, therapeutics: e.target.value})}
              style={styles.textarea}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.saveBtn}>
              Save Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalCard: { background: 'white', padding: '25px', borderRadius: '10px', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#444', marginBottom: '4px' },
  helperText: { display: 'block', fontSize: '11px', color: '#666', marginTop: '3px' },
  input: { width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' },
  saveBtn: { background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }
};