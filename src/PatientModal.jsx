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
    currentCondition: patient ? (patient.endorsement?.currentCondition || '') : 'Stable, conscious, coherent.',
    diagnostics: patient ? (patient.endorsement?.diagnostics || '') : 'Pending baseline labs.',
    therapeutics: patient ? (patient.endorsement?.therapeutics || '') : 'As per initial hospital orders.',
    remarks: patient ? (patient.endorsement?.remarks || '') : ''
  });

  const isPendingQueue = room === 'Pending Room Assignment';
  const modalTitle = isPendingQueue ? 'Pending Room Assignment' : 'Add Referral Patient';

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
        {/* Hospital Branding Header inside the Modal */}
        <div style={styles.headerContainer}>
          <h1 style={styles.hospitalTitle}>Dr. Jose P. Rizal Memorial District Hospital</h1>
          <h2 style={styles.departmentTitle}>Department of Internal Medicine</h2>
        </div>

        <h3 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '16px', fontWeight: '700' }}>{modalTitle}</h3>
        
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

          <hr style={{ margin: '18px 0', border: '0', borderTop: '1px solid #e2e8f0' }} />
          <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Initial Endorsement Details</h4>

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

          <div style={{ marginBottom: '10px' }}>
            <label style={styles.label}>Therapeutics / Medications</label>
            <textarea 
              rows="2"
              value={formData.therapeutics}
              onChange={(e) => setFormData({...formData, therapeutics: e.target.value})}
              style={styles.textarea}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={styles.label}>Remarks / Special Notes</label>
            <textarea 
              rows="2"
              placeholder="e.g., Awaiting clearance, special monitoring instructions..."
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
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
  headerContainer: {
    textAlign: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #f1f5f9',
  },
  hospitalTitle: {
    margin: '0 0 4px 0',
    fontSize: '15px',
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: '-0.02em',
  },
  departmentTitle: {
    margin: '0',
    fontSize: '11px',
    fontWeight: '700',
    color: '#0284c7',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  modalOverlay: { 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    backgroundColor: 'rgba(15, 23, 42, 0.7)', 
    backdropFilter: 'blur(6px)', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 1000,
    padding: '20px'
  },
  modalCard: { 
    background: '#ffffff', 
    padding: '32px', 
    borderRadius: '16px', 
    width: '100%', 
    maxWidth: '520px', 
    maxHeight: '90vh', 
    overflowY: 'auto', 
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
    border: '1px solid #cbd5e1' 
  },
  label: { 
    display: 'block', 
    fontSize: '12px', 
    fontWeight: '700', 
    color: '#334155', 
    marginBottom: '5px',
    letterSpacing: '-0.01em'
  },
  helperText: { 
    display: 'block', 
    fontSize: '11px', 
    color: '#64748b', 
    marginTop: '3px' 
  },
  input: { 
    width: '100%', 
    padding: '10px 12px', 
    fontSize: '14px', 
    border: '1px solid #cbd5e1', 
    borderRadius: '8px', 
    boxSizing: 'border-box',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#1e293b'
  },
  textarea: { 
    width: '100%', 
    padding: '10px 12px', 
    fontSize: '14px', 
    border: '1px solid #cbd5e1', 
    borderRadius: '8px', 
    boxSizing: 'border-box', 
    resize: 'vertical',
    outline: 'none',
    backgroundColor: '#f8fafc',
    color: '#1e293b'
  },
  saveBtn: { 
    background: '#059669', 
    color: 'white', 
    border: 'none', 
    padding: '10px 18px', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)'
  },
  cancelBtn: { 
    background: '#64748b', 
    color: 'white', 
    border: 'none', 
    padding: '10px 18px', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px'
  }
};