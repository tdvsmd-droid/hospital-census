import React, { useState, useEffect } from 'react';
import PatientModal from './PatientModal';

export default function App() {
  const [currentView, setCurrentView] = useState('splash'); // 'splash', 'census', or 'archive'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date and Internist on Duty state for the Splash screen
  const [currentDateString, setCurrentDateString] = useState('');
  const [internistOnDuty, setInternistOnDuty] = useState('Dr. Maria Santos');
  const [isEditingInternist, setIsEditingInternist] = useState(false);
  const [tempInternist, setTempInternist] = useState('');

  // Modal states for admissions/referrals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialRoom, setModalInitialRoom] = useState('Pending Room Assignment');

  // Transfer / Room Assignment modal states
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [customTransferText, setCustomTransferText] = useState('');
  const [isCustomTransfer, setIsCustomTransfer] = useState(false);

  // State for editing clinical details & endorsement
  const [isEditingClinical, setIsEditingClinical] = useState(false);
  const [clinicalForm, setClinicalForm] = useState({
    admittingDiagnosis: '',
    workingImpression: '',
    currentCondition: '',
    diagnostics: '',
    therapeutics: '',
    status: 'Stable'
  });

  // Automatically set today's date on load
  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);
    setCurrentDateString(today);
  }, []);

  // Helper function to calculate Hospital Day where admission date is Day 0
  const calculateHospitalDay = (admissionDateStr) => {
    if (!admissionDateStr) return 0;
    
    // Split the YYYY-MM-DD string to avoid UTC/local timezone shift bugs
    const parts = admissionDateStr.split('-');
    if (parts.length !== 3) return 0;
    
    const admissionDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    
    // Reset time portions to compare calendar days accurately
    admissionDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - admissionDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    // Admission day is Day 0. If it's a future date, default to 0.
    return diffDays >= 0 ? diffDays : 0;
  };

  // Sample initial data reflecting Dr. Jose P. Rizal Memorial District Hospital inpatients (Last Name, Given Name format)
  const [patients, setPatients] = useState([
    {
      id: 1,
      wardRoom: '303-1',
      name: 'Dela Cruz, Juan',
      ageSex: '65 / M',
      admissionDate: '2026-08-20',
      admittingDiagnosis: 'Community-Acquired Pneumonia, High Risk',
      workingImpression: 'Resolving CAP, rule out secondary bacterial infection',
      endorsement: {
        currentCondition: 'Stable, conscious, coherent, mild productive cough.',
        diagnostics: 'CBC pending. Chest X-ray showed clearing infiltrates.',
        therapeutics: 'IV Levofloxacin 500mg OD, Salbutamol nebulization Q6H.'
      },
      status: 'MGH',
      isReferral: false
    },
    {
      id: 2,
      wardRoom: 'Pending Room Assignment',
      name: 'Santos, Maria',
      ageSex: '52 / F',
      admissionDate: '2026-08-28',
      admittingDiagnosis: 'Type 2 Diabetes Mellitus with DKA',
      workingImpression: 'Type 2 Diabetes Mellitus with DKA',
      endorsement: {
        currentCondition: 'Newly admitted, awaiting bed allocation.',
        diagnostics: 'Initial labs ordered.',
        therapeutics: 'Pending initial hospital orders.'
      },
      status: 'New Admission',
      isReferral: false
    }
  ]);

  // Historical archive state for discharged patients (Read-Only, Last Name first format)
  const [dischargedArchive, setDischargedArchive] = useState([
    {
      id: 101,
      name: 'Reyes, Pedro',
      ageSex: '58 / M',
      admissionPeriod: 'August 1 - August 5, 2026',
      finalImpression: 'Acute Gastroenteritis, resolved with oral hydration and antibiotics.'
    }
  ]);

  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');

  // Pre-defined fixed rooms and wards structure (IM Beds only)
  const fixedRooms = [
    "301",
    "303-1", "303-2", "303-3", "303-4",
    "304-1", "304-2", "304-3", "304-4",
    "305",
    "307",
    "309-1", "309-2",
    "PR",
    "310-1", "310-2", "310-3", "310-4",
    "312-1", "312-2", "312-3", "312-4",
    "ICU-B2",
    "ICU-B3",
    "ICU-High-Risk",
    "ICU-ISO"
  ];

  // Helper function to identify custom referral locations for the grid overview
  const isReferralLocation = (room) => {
    return room !== 'Pending Room Assignment' && !fixedRooms.includes(room);
  };

  // Dynamically extract any referral rooms/locations from current patients so they appear in the grid overview
  const customReferrals = patients
    .map(p => p.wardRoom)
    .filter(room => isReferralLocation(room));

  const allRooms = [...fixedRooms, ...Array.from(new Set(customReferrals))];

  const openNewAdmissionModal = () => {
    setModalInitialRoom('Pending Room Assignment');
    setIsModalOpen(true);
  };

  const openAddReferralModal = () => {
    setModalInitialRoom('');
    setIsModalOpen(true);
  };

  const openTransferModal = () => {
    setTransferTarget(fixedRooms[0]);
    setIsCustomTransfer(false);
    setCustomTransferText('');
    setIsTransferModalOpen(true);
  };

  const executeTransfer = (e) => {
    e.preventDefault();
    let targetRoom = isCustomTransfer ? customTransferText.trim() : transferTarget;

    if (!targetRoom) {
      alert("Please select or specify a valid destination room.");
      return;
    }

    if (targetRoom !== 'Pending Room Assignment') {
      const occupant = patients.find(p => p.wardRoom.toLowerCase() === targetRoom.toLowerCase() && p.id !== selectedPatient.id);
      if (occupant) {
        alert(`Cannot assign: ${targetRoom} is currently occupied by ${occupant.name}.`);
        return;
      }
    }

    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        const updatedPatient = { ...p, wardRoom: targetRoom };
        setSelectedPatient(updatedPatient);
        return updatedPatient;
      }
      return p;
    }));

    setIsTransferModalOpen(false);
    alert(`Patient location updated to ${targetRoom}.`);
  };

  const handleClearRoom = (idOrRoom, e) => {
    if (e) e.stopPropagation();
    
    if (window.confirm("Clear this room and archive patient record? This will mark the bed as vacant.")) {
      const patientToArchive = patients.find(p => p.id === idOrRoom || p.wardRoom === idOrRoom);
      
      if (patientToArchive) {
        const todayStr = new Date().toISOString().split('T')[0];
        const archivedRecord = {
          id: Date.now(),
          name: patientToArchive.name,
          ageSex: patientToArchive.ageSex,
          admissionPeriod: `${patientToArchive.admissionDate} - ${todayStr}`,
          finalImpression: patientToArchive.workingImpression || patientToArchive.admittingDiagnosis
        };
        setDischargedArchive(prev => [archivedRecord, ...prev]);
      }

      setPatients(patients.filter(p => p.id !== idOrRoom && p.wardRoom !== idOrRoom));
      if (selectedPatient && (selectedPatient.id === idOrRoom || selectedPatient.wardRoom === idOrRoom)) {
        setSelectedPatient(null);
      }
      setIsModalOpen(false);
    }
  };

  const handleSavePatientModal = (roomName, formData) => {
    const finalRoom = roomName.trim();

    if (finalRoom !== 'Pending Room Assignment' && finalRoom !== '') {
      const occupant = patients.find(p => p.wardRoom.toLowerCase() === finalRoom.toLowerCase());
      if (occupant) {
        alert(`Warning: ${finalRoom} is already occupied by ${occupant.name}.`);
      }
    }

    const isReferralSave = modalInitialRoom === '';
    const assignedStatus = isReferralSave ? 'Referral' : (formData.status || 'New Admission');

    const newPatientObj = {
      id: Date.now(),
      wardRoom: finalRoom || 'Pending Room Assignment',
      name: formData.name,
      ageSex: `${formData.age} / ${formData.gender[0]}`,
      admissionDate: formData.admissionDate,
      admittingDiagnosis: formData.diagnosis,
      workingImpression: formData.diagnosis,
      endorsement: {
        currentCondition: formData.currentCondition || (isReferralSave ? 'Newly referred patient.' : 'Newly admitted, stable.'),
        diagnostics: formData.diagnostics || 'Pending labs.',
        therapeutics: formData.therapeutics || 'As per initial orders.'
      },
      status: assignedStatus,
      physician: formData.physician,
      isReferral: isReferralSave
    };

    setPatients(prev => [...prev, newPatientObj]);
    setIsModalOpen(false);
  };

  const startEditingClinical = (patient) => {
    setClinicalForm({
      admittingDiagnosis: patient.admittingDiagnosis || '',
      workingImpression: patient.workingImpression || '',
      currentCondition: patient.endorsement?.currentCondition || '',
      diagnostics: patient.endorsement?.diagnostics || '',
      therapeutics: patient.endorsement?.therapeutics || '',
      status: patient.status || 'Stable'
    });
    setIsEditingClinical(true);
  };

  const saveClinicalEdits = (e) => {
    e.preventDefault();
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        const updated = {
          ...p,
          admittingDiagnosis: clinicalForm.admittingDiagnosis,
          workingImpression: clinicalForm.workingImpression,
          status: clinicalForm.status,
          endorsement: {
            currentCondition: clinicalForm.currentCondition,
            diagnostics: clinicalForm.diagnostics,
            therapeutics: clinicalForm.therapeutics
          }
        };
        setSelectedPatient(updated);
        return updated;
      }
      return p;
    }));
    setIsEditingClinical(false);
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.wardRoom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.admittingDiagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const imPatientsList = filteredPatients.filter(p => !p.isReferral);
  const referralPatientsList = filteredPatients.filter(p => p.isReferral);

  const filteredArchive = dischargedArchive.filter(record =>
    record.name.toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
    record.finalImpression.toLowerCase().includes(archiveSearchQuery.toLowerCase()) ||
    record.admissionPeriod.toLowerCase().includes(archiveSearchQuery.toLowerCase())
  );

  // 1. Welcome Splash View with Date and Internists on Duty
  if (currentView === 'splash') {
    return (
      <div style={styles.splashContainer}>
        <div style={styles.splashCard}>
          <h1 style={styles.hospitalTitle}>Dr. Jose P. Rizal Memorial District Hospital</h1>
          <h2 style={styles.deptTitle}>Department of Internal Medicine &mdash; Inpatient Census</h2>
          
          {/* Shift Details Info Box */}
          <div style={styles.splashInfoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>📅 Date:</span>
              <span style={styles.infoValue}>{currentDateString || 'Loading...'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>🩺 IM on Duty:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isEditingInternist ? (
                  <>
                    <input 
                      type="text" 
                      value={tempInternist} 
                      onChange={(e) => setTempInternist(e.target.value)}
                      style={styles.physicianInput}
                      placeholder="Enter internist name(s)..."
                    />
                    <button 
                      style={styles.savePhysicianBtn} 
                      onClick={() => {
                        if(tempInternist.trim()) setInternistOnDuty(tempInternist.trim());
                        setIsEditingInternist(false);
                      }}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <span style={styles.infoValue}>{internistOnDuty}</span>
                    <button 
                      style={styles.editPhysicianBtn} 
                      onClick={() => {
                        setTempInternist(internistOnDuty);
                        setIsEditingInternist(true);
                      }}
                    >
                      Change
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div style={styles.badgeContainer}>
            <span style={styles.badge}>Active Census: {patients.length}</span>
            <span style={styles.badgeArchive}>Archived Records: {dischargedArchive.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              style={styles.enterButton} 
              onClick={() => setCurrentView('census')}
            >
              Enter Daily Census
            </button>
            <button 
              style={styles.archiveNavButton} 
              onClick={() => setCurrentView('archive')}
            >
              View Historical Archive (Past Admissions)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Historical Archive View
  if (currentView === 'archive') {
    const isSearching = archiveSearchQuery.trim() !== '';

    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2>Historical Admission Archive</h2>
          <button style={styles.homeButton} onClick={() => setCurrentView('splash')}>
            Home Splash
          </button>
        </div>

        <input 
          type="text" 
          placeholder="Type patient name (Last Name, Given Name), diagnosis, or period..." 
          value={archiveSearchQuery}
          onChange={(e) => setArchiveSearchQuery(e.target.value)}
          style={styles.searchBar}
          autoFocus
        />

        <p style={styles.subText}>
          {!isSearching 
            ? "Type in the search bar above to look up past discharged admissions." 
            : `Found ${filteredArchive.length} matching historical record(s):`}
        </p>

        {isSearching && (
          <div style={styles.archiveTableContainer}>
            <table style={styles.archiveTable}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Patient Name (Last, First)</th>
                  <th style={styles.th}>Age / Sex</th>
                  <th style={styles.th}>Admission Period</th>
                  <th style={styles.th}>Final Working Impression</th>
                </tr>
              </thead>
              <tbody>
                {filteredArchive.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                      No matching historical records found.
                    </td>
                  </tr>
                ) : (
                  filteredArchive.map(record => (
                    <tr key={record.id} style={styles.tableRow}>
                      <td style={styles.td}><strong>{record.name}</strong></td>
                      <td style={styles.td}>{record.ageSex}</td>
                      <td style={styles.td}><span style={styles.periodBadge}>{record.admissionPeriod}</span></td>
                      <td style={styles.td}>{record.finalImpression}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: '25px' }}>
          <button style={styles.backButton} onClick={() => setCurrentView('census')}>
            &larr; Back to Active Census
          </button>
        </div>
      </div>
    );
  }

  // 3. Detailed Patient View
  if (selectedPatient) {
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => { setSelectedPatient(null); setIsEditingClinical(false); }}>
          &larr; Back to Census List
        </button>

        <div style={styles.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2>{selectedPatient.name} ({selectedPatient.ageSex})</h2>
              <p><strong>Location / Room:</strong> <span style={{ color: '#0056b3', fontWeight: 'bold' }}>{selectedPatient.wardRoom}</span></p>
              <p><strong>Attending Physician:</strong> {selectedPatient.physician || 'Not specified'}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={styles.transferButton} onClick={openTransferModal}>
                {selectedPatient.wardRoom === 'Pending Room Assignment' ? 'Assign Room/Bed' : 'Transfer Bed'}
              </button>
              <button 
                style={styles.editButton} 
                onClick={() => {
                  if (isEditingClinical) {
                    setIsEditingClinical(false);
                  } else {
                    startEditingClinical(selectedPatient);
                  }
                }}
              >
                {isEditingClinical ? 'Close Edit Form' : 'Edit Clinical Data'}
              </button>
            </div>
          </div>

          <p><strong>Admission Date:</strong> {selectedPatient.admissionDate} (Hospital Day {calculateHospitalDay(selectedPatient.admissionDate)})</p>
          
          <hr style={styles.divider} />

          {isEditingClinical ? (
            <form onSubmit={saveClinicalEdits} style={styles.editFormBox}>
              <h3 style={{ margin: '0 0 15px 0', color: '#0056b3' }}>Update Clinical Details & Disposition</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Admitting Diagnosis</label>
                <input 
                  type="text" 
                  value={clinicalForm.admittingDiagnosis} 
                  onChange={(e) => setClinicalForm({...clinicalForm, admittingDiagnosis: e.target.value})}
                  style={styles.input}
                  required
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Working Impression</label>
                <input 
                  type="text" 
                  value={clinicalForm.workingImpression} 
                  onChange={(e) => setClinicalForm({...clinicalForm, workingImpression: e.target.value})}
                  style={styles.input}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Status / Disposition</label>
                <select 
                  value={clinicalForm.status} 
                  onChange={(e) => setClinicalForm({...clinicalForm, status: e.target.value})}
                  style={styles.input}
                >
                  <option value="Referral">Referral</option>
                  <option value="New Admission">New Admission</option>
                  <option value="Stable">Stable</option>
                  <option value="Improving">Improving</option>
                  <option value="Guarded">Guarded</option>
                  <option value="Critical">Critical</option>
                  <option value="MGH">MGH (May Go Home - Pending Bills/Exit)</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Absconded">Absconded</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Endorsement: Current Condition</label>
                <textarea 
                  rows="2" 
                  value={clinicalForm.currentCondition} 
                  onChange={(e) => setClinicalForm({...clinicalForm, currentCondition: e.target.value})}
                  style={styles.textarea}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Endorsement: Diagnostics / Labs</label>
                <textarea 
                  rows="2" 
                  value={clinicalForm.diagnostics} 
                  onChange={(e) => setClinicalForm({...clinicalForm, diagnostics: e.target.value})}
                  style={styles.textarea}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={styles.label}>Endorsement: Therapeutics / Medications</label>
                <textarea 
                  rows="2" 
                  value={clinicalForm.therapeutics} 
                  onChange={(e) => setClinicalForm({...clinicalForm, therapeutics: e.target.value})}
                  style={styles.textarea}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={styles.saveClinicalBtn}>Save Changes</button>
                <button type="button" onClick={() => setIsEditingClinical(false)} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h3>Clinical Details</h3>
              <p><strong>Admitting Diagnosis:</strong> {selectedPatient.admittingDiagnosis}</p>
              <p><strong>Working Impression:</strong> {selectedPatient.workingImpression}</p>
              
              <div style={styles.endorsementBox}>
                <h4>Daily Endorsement</h4>
                <p><strong>Current Condition:</strong> {selectedPatient.endorsement?.currentCondition}</p>
                <p><strong>Diagnostics:</strong> {selectedPatient.endorsement?.diagnostics}</p>
                <p><strong>Therapeutics:</strong> {selectedPatient.endorsement?.therapeutics}</p>
              </div>

              <p><strong>Status / Disposition:</strong> <span style={styles.statusBadge(selectedPatient.status)}>{selectedPatient.status}</span></p>
            </>
          )}

          <button 
            style={styles.clearRoomButton} 
            onClick={(e) => handleClearRoom(selectedPatient.id, e)}
          >
            Clear Room & Archive Record
          </button>
        </div>

        {isTransferModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <h3 style={{ margin: '0 0 15px 0', color: '#003d82' }}>Assign Room / Transfer &mdash; {selectedPatient.name}</h3>
              <form onSubmit={executeTransfer}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={styles.label}>Select Destination Room / Bed</label>
                  <select 
                    value={isCustomTransfer ? 'OTHER_OPTION' : transferTarget}
                    onChange={(e) => {
                      if (e.target.value === 'OTHER_OPTION') {
                        setIsCustomTransfer(true);
                      } else {
                        setIsCustomTransfer(false);
                        setTransferTarget(e.target.value);
                      }
                    }}
                    style={styles.input}
                  >
                    <option value="Pending Room Assignment">Pending Room Assignment</option>
                    {fixedRooms.map((room) => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                    <option value="OTHER_OPTION">-- Other (Type Referral Location) --</option>
                  </select>
                </div>

                {isCustomTransfer && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={styles.label}>Custom Referral Location / Ward</label>
                    <input 
                      type="text" 
                      placeholder="e.g., ER Cubicle 4, Surgical Ward" 
                      value={customTransferText}
                      onChange={(e) => setCustomTransferText(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button 
                    type="button" 
                    onClick={() => setIsTransferModalOpen(false)} 
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    style={styles.saveClinicalBtn}
                  >
                    Confirm Location
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Main Scrollable Census List & Room Grid Overview
  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2>Internists on Duty</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={styles.admitNewButton} onClick={openNewAdmissionModal}>
            + Admit New Patient
          </button>
          <button style={styles.referralButton} onClick={openAddReferralModal}>
            + Add Referral
          </button>
          <button style={styles.archiveNavBtnHeader} onClick={() => setCurrentView('archive')}>
            📚 Archive ({dischargedArchive.length})
          </button>
          <button style={styles.homeButton} onClick={() => setCurrentView('splash')}>
            Home Splash
          </button>
        </div>
      </div>

      <input 
        type="text" 
        placeholder="Search active inpatients by name (Last, First), room, or diagnosis..." 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={styles.searchBar}
      />

      <h3 style={{ fontSize: '16px', color: '#444', marginTop: '20px' }}>Ward, Room & ICU Status (Bed Management Overview)</h3>
      <div style={styles.roomGrid}>
        {allRooms.map(room => {
          const occupant = patients.find(p => p.wardRoom === room);
          return (
            <div 
              key={room}
              onClick={() => occupant && setSelectedPatient(occupant)}
              style={{
                ...styles.roomCard,
                background: occupant ? '#e3f2fd' : '#ffffff',
                borderColor: occupant ? '#90caf9' : '#ddd',
                cursor: occupant ? 'pointer' : 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px' }}>{room}</strong>
                <span style={{ fontSize: '10px', padding: '2px 4px', borderRadius: '4px', background: occupant ? '#bbdefb' : '#f1f3f5', color: occupant ? '#0d47a1' : '#6c757d' }}>
                  {occupant ? 'Occ' : 'Vac'}
                </span>
              </div>
              <p style={{ fontSize: '12px', margin: '6px 0 0 0', color: occupant ? '#333' : '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {occupant ? occupant.name : 'Vacant'}
              </p>
            </div>
          );
        })}
      </div>

      {/* SECTION 1: IM Patients (Admissions & Unassigned Beds) */}
      <h3 style={{ fontSize: '16px', color: '#003d82', marginTop: '25px', marginBottom: '10px' }}>
        IM Inpatients & Unassigned Admissions ({imPatientsList.length})
      </h3>
      <div style={styles.listContainer}>
        {imPatientsList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '15px', color: '#666', background: '#fff', borderRadius: '8px' }}>No IM inpatients found.</p>
        ) : (
          imPatientsList.map(patient => (
            <div 
              key={patient.id} 
              style={styles.patientRow} 
              onClick={() => setSelectedPatient(patient)}
            >
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#0056b3' }}>{patient.wardRoom} &mdash; {patient.name}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{patient.admittingDiagnosis} (Day {calculateHospitalDay(patient.admissionDate)})</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={styles.statusBadge(patient.status)}>{patient.status}</span>
                <button 
                  style={styles.smallClearBtn} 
                  onClick={(e) => handleClearRoom(patient.id, e)}
                  title="Clear Room and Archive Record"
                >
                  Clear Room
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECTION 2: Referrals from Other Departments */}
      <h3 style={{ fontSize: '16px', color: '#28a745', marginTop: '25px', marginBottom: '10px' }}>
        External Department Referrals ({referralPatientsList.length})
      </h3>
      <div style={styles.listContainer}>
        {referralPatientsList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '15px', color: '#666', background: '#fff', borderRadius: '8px' }}>No active referrals.</p>
        ) : (
          referralPatientsList.map(patient => (
            <div 
              key={patient.id} 
              style={{ ...styles.patientRow, borderLeftColor: '#28a745' }} 
              onClick={() => setSelectedPatient(patient)}
            >
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#28a745' }}>{patient.wardRoom} &mdash; {patient.name}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{patient.admittingDiagnosis}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={styles.statusBadge(patient.status)}>{patient.status}</span>
                <button 
                  style={styles.smallClearBtn} 
                  onClick={(e) => handleClearRoom(patient.id, e)}
                  title="Clear Record and Archive"
                >
                  Clear Record
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <PatientModal
          room={modalInitialRoom}
          allRooms={fixedRooms}
          patient={null}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePatientModal}
          onDischarge={(room) => handleClearRoom(room, null)}
        />
      )}
    </div>
  );
}

// Styling elements
const styles = {
  splashContainer: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
    background: 'linear-gradient(135deg, #0056b3 0%, #003d82 100%)', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
  },
  splashCard: { background: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', maxWidth: '580px', width: '90%' },
  hospitalTitle: { color: '#003d82', margin: '0 0 10px 0', fontSize: '22px' },
  deptTitle: { color: '#555', fontSize: '15px', fontWeight: 'normal', marginBottom: '20px' },
  splashInfoBox: { background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px', padding: '15px 20px', marginBottom: '20px', textAlign: 'left' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '14px' },
  infoLabel: { fontWeight: 'bold', color: '#444' },
  infoValue: { color: '#0056b3', fontWeight: '600' },
  physicianInput: { padding: '4px 8px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '4px' },
  savePhysicianBtn: { background: '#28a745', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' },
  editPhysicianBtn: { background: 'none', border: 'none', color: '#0056b3', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontWeight: 'bold' },
  badgeContainer: { display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' },
  badge: { background: '#e3f2fd', color: '#0d47a1', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  badgeArchive: { background: '#fff3cd', color: '#856404', padding: '6px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' },
  enterButton: { background: '#0056b3', color: 'white', border: 'none', padding: '12px 20px', fontSize: '15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  archiveNavButton: { background: '#6c757d', color: 'white', border: 'none', padding: '12px 20px', fontSize: '15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  admitNewButton: { background: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  archiveNavBtnHeader: { background: '#ffc107', color: '#333', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  container: { maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  homeButton: { background: '#f0f0f0', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  referralButton: { background: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  transferButton: { background: '#ffc107', color: '#333', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  editButton: { background: '#17a2b8', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  searchBar: { width: '100%', padding: '12px', fontSize: '15px', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '10px', boxSizing: 'border-box' },
  subText: { color: '#666', fontSize: '13px', marginBottom: '10px' },
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginTop: '10px', maxHeight: '260px', overflowY: 'auto', padding: '4px', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' },
  roomCard: { padding: '8px', borderRadius: '6px', border: '1px solid', transition: 'all 0.2s ease' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  patientRow: { background: 'white', padding: '16px 20px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderLeft: '5px solid #0056b3' },
  archiveTableContainer: { maxHeight: '450px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '8px', background: 'white', boxShadow: '0 2px 6px rgba(0,0,0,0.05)' },
  archiveTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' },
  tableHeaderRow: { background: '#f1f3f5', color: '#333', position: 'sticky', top: 0, zIndex: 1 },
  th: { padding: '12px 15px', borderBottom: '2px solid #ddd', fontWeight: 'bold' },
  td: { padding: '12px 15px', borderBottom: '1px solid #eee', color: '#444' },
  tableRow: { transition: 'background 0.2s ease' },
  periodBadge: { background: '#e2e3e5', color: '#383d41', padding: '3px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' },
  detailCard: { background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  backButton: { background: 'none', border: 'none', color: '#0056b3', fontSize: '15px', cursor: 'pointer', marginBottom: '15px', padding: 0, fontWeight: 'bold' },
  divider: { border: '0', height: '1px', background: '#eee', margin: '20px 0' },
  endorsementBox: { background: '#f9f9f9', padding: '15px', borderRadius: '6px', borderLeft: '4px solid #28a745', margin: '20px 0' },
  editFormBox: { background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', margin: '20px 0' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: '0', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '1000' },
  modalCard: { background: 'white', padding: '25px', borderRadius: '10px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' },
  label: { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#444', marginBottom: '4px' },
  input: { width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box', resize: 'vertical' },
  saveClinicalBtn: { background: '#28a745', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  clearRoomButton: { background: '#dc3545', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '20px' },
  smallClearBtn: { background: '#ffcdd2', color: '#b71c1c', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  statusBadge: (status) => ({
    background: status === 'MGH' ? '#d1ecf1' : status === 'New Admission' ? '#cce5ff' : status === 'Referral' ? '#d4edda' : status === 'Improving' ? '#d4edda' : status === 'Critical' ? '#f8d7da' : '#fff3cd',
    color: status === 'MGH' ? '#0c5460' : status === 'New Admission' ? '#004085' : status === 'Referral' ? '#155724' : status === 'Improving' ? '#155724' : status === 'Critical' ? '#721c24' : '#856404',
    padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
  })
};