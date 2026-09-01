import React, { useState, useEffect } from 'react';
import PatientModal from './PatientModal';

export default function App() {
  const [currentView, setCurrentView] = useState('splash'); // 'splash', 'census', or 'archive'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Date and Internist on Duty state for the Splash screen (persistent with localStorage)
  const [currentDateString, setCurrentDateString] = useState(() => {
    const savedDateSpan = localStorage.getItem('jrrmdh_datespan');
    if (savedDateSpan) {
      return savedDateSpan;
    }
    // Default fallback anchor reverted back to September 1-2, 2026 as requested
    return 'September 1 - September 2, 2026';
  });

  const [internistOnDuty, setInternistOnDuty] = useState(() => {
    const savedInternist = localStorage.getItem('jrrmdh_internist');
    return savedInternist ? savedInternist : 'Dr. Maria Santos';
  });
  const [isEditingInternist, setIsEditingInternist] = useState(false);
  const [tempInternist, setTempInternist] = useState('');

  // Save Date Span to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jrrmdh_datespan', currentDateString);
  }, [currentDateString]);

  // Save Internist on Duty to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jrrmdh_internist', internistOnDuty);
  }, [internistOnDuty]);

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
  // Toggle switch specifically for locked core details (Name, Age/Sex, Admission Date, Physician)
  const [isEditingCoreDetails, setIsEditingCoreDetails] = useState(false);

  const [clinicalForm, setClinicalForm] = useState({
    name: '',
    ageSex: '',
    admissionDate: '',
    physician: '',
    admittingDiagnosis: '',
    workingImpression: '',
    currentCondition: '',
    diagnostics: '',
    therapeutics: '',
    remarks: '',
    status: 'Stable'
  });

  // Persistent Storage: Load patients from browser memory on startup
  const [patients, setPatients] = useState(() => {
    const savedPatients = localStorage.getItem('jrrmdh_patients');
    if (savedPatients) {
      try {
        return JSON.parse(savedPatients);
      } catch (e) {
        console.error("Failed to parse saved patients", e);
      }
    }
    return [
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
          therapeutics: 'IV Levofloxacin 500mg OD, Salbutamol nebulization Q6H.',
          remarks: 'Waiting for relative to bring PhilHealth forms.'
        },
        status: 'MGH',
        physician: 'Dr. Maria Santos',
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
          therapeutics: 'Pending initial hospital orders.',
          remarks: 'Needs strict monitoring of capillary blood sugar every 2 hours.'
        },
        status: 'New Admission',
        physician: 'Dr. Juan Reyes',
        isReferral: false
      }
    ];
  });

  // Persistent Storage: Save patients whenever the list changes
  useEffect(() => {
    localStorage.setItem('jrrmdh_patients', JSON.stringify(patients));
  }, [patients]);

  // Persistent Storage: Load historical archive from browser memory on startup
  const [dischargedArchive, setDischargedArchive] = useState(() => {
    const savedArchive = localStorage.getItem('jrrmdh_archive');
    if (savedArchive) {
      try {
        return JSON.parse(savedArchive);
      } catch (e) {
        console.error("Failed to parse saved archive", e);
      }
    }
    return [
      {
        id: 101,
        name: 'Reyes, Pedro (Archived Individual Record)',
        ageSex: '58 / M',
        admissionPeriod: 'August 1 - August 5, 2026',
        finalImpression: 'Acute Gastroenteritis, resolved with oral hydration and antibiotics.',
        isSnapshot: false
      }
    ];
  });

  // Persistent Storage: Save archive whenever it changes
  useEffect(() => {
    localStorage.setItem('jrrmdh_archive', JSON.stringify(dischargedArchive));
  }, [dischargedArchive]);

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

  const isReferralLocation = (room) => {
    return room !== 'Pending Room Assignment' && !fixedRooms.includes(room);
  };

  const customReferrals = patients
    .map(p => p.wardRoom)
    .filter(room => isReferralLocation(room));

  const allRooms = [...fixedRooms, ...Array.from(new Set(customReferrals))];

  const calculateHospitalDay = (admissionDateStr) => {
    if (!admissionDateStr) return 0;
    const parts = admissionDateStr.split('-');
    if (parts.length !== 3) return 0;
    
    const admissionDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const today = new Date();
    
    admissionDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - admissionDate;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const movePatientOrder = (id, direction, e) => {
    if (e) e.stopPropagation();
    setPatients(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handlePerformEndorsement = () => {
    // Two-step confirmation safeguard to prevent accidental clicks
    const confirmEndorsement = window.confirm(
      "Are you sure you want to endorse the shift? This will generate a duty snapshot, archive current data, and advance the duty span."
    );
    if (!confirmEndorsement) return;

    const incomingDoctor = prompt("Enter the name of the incoming Internist on Duty for the next shift:", "Dr. ");
    if (!incomingDoctor) return;

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const startDateFormatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const endDateFormatted = tomorrow.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const dutyPeriodSpan = `${startDateFormatted} - ${endDateFormatted}`;

    const snapshotRecord = {
      id: Date.now(),
      name: `Duty Shift Snapshot (${internistOnDuty} -> ${incomingDoctor})`,
      ageSex: `${patients.length} Inpatients`,
      admissionPeriod: dutyPeriodSpan,
      finalImpression: `Endorsed from ${internistOnDuty} to ${incomingDoctor}. Total active census: ${patients.length} patients.`,
      isSnapshot: true,
      snapshotPatients: [...patients]
    };

    setDischargedArchive(prev => [snapshotRecord, ...prev]);
    setInternistOnDuty(incomingDoctor);
    setCurrentDateString(dutyPeriodSpan);
    alert(`Shift successfully endorsed to ${incomingDoctor}!\nDuty Period updated to [ ${dutyPeriodSpan} ]. Snapshot saved to archives.`);
  };

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
    
    if (window.confirm("Clear this room and archive individual patient record?")) {
      const patientToArchive = patients.find(p => p.id === idOrRoom || p.wardRoom === idOrRoom);
      
      if (patientToArchive) {
        const todayStr = new Date().toISOString().split('T')[0];
        const archivedRecord = {
          id: Date.now(),
          name: patientToArchive.name,
          ageSex: patientToArchive.ageSex,
          admissionPeriod: `${patientToArchive.admissionDate} - ${todayStr}`,
          finalImpression: patientToArchive.workingImpression || patientToArchive.admittingDiagnosis,
          isSnapshot: false
        };
        setDischargedArchive(prev => [archivedRecord, ...prev]);
      }

      setPatients(prev => prev.filter(p => p.id !== idOrRoom && p.wardRoom !== idOrRoom));
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
        therapeutics: formData.therapeutics || 'As per initial orders.',
        remarks: formData.remarks || ''
      },
      status: assignedStatus,
      physician: formData.physician || internistOnDuty,
      isReferral: isReferralSave
    };

    setPatients(prev => [...prev, newPatientObj]);
    setIsModalOpen(false);
  };

  const startEditingClinical = (patient) => {
    setClinicalForm({
      name: patient.name || '',
      ageSex: patient.ageSex || '',
      admissionDate: patient.admissionDate || '',
      physician: patient.physician || '',
      admittingDiagnosis: patient.admittingDiagnosis || '',
      workingImpression: patient.workingImpression || '',
      currentCondition: patient.endorsement?.currentCondition || '',
      diagnostics: patient.endorsement?.diagnostics || '',
      therapeutics: patient.endorsement?.therapeutics || '',
      remarks: patient.endorsement?.remarks || '',
      status: patient.status || 'Stable'
    });
    setIsEditingCoreDetails(false); // Default to locked core details
    setIsEditingClinical(true);
  };

  const saveClinicalEdits = (e) => {
    e.preventDefault();
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        const updated = {
          ...p,
          // Update core details only if core toggle is enabled, otherwise keep original values
          name: isEditingCoreDetails ? clinicalForm.name : p.name,
          ageSex: isEditingCoreDetails ? clinicalForm.ageSex : p.ageSex,
          admissionDate: isEditingCoreDetails ? clinicalForm.admissionDate : p.admissionDate,
          physician: isEditingCoreDetails ? clinicalForm.physician : p.physician,
          admittingDiagnosis: clinicalForm.admittingDiagnosis,
          workingImpression: clinicalForm.workingImpression,
          status: clinicalForm.status,
          endorsement: {
            currentCondition: clinicalForm.currentCondition,
            diagnostics: clinicalForm.diagnostics,
            therapeutics: clinicalForm.therapeutics,
            remarks: clinicalForm.remarks
          }
        };
        setSelectedPatient(updated);
        return updated;
      }
      return p;
    }));
    setIsEditingClinical(false);
    setIsEditingCoreDetails(false);
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

  // 1. Welcome Splash View
  if (currentView === 'splash') {
    return (
      <div style={styles.splashContainer}>
        <div style={styles.splashCard}>
          <h1 style={styles.hospitalTitle}>Dr. Jose P. Rizal Memorial District Hospital</h1>
          <h2 style={styles.deptTitle}>Department of Internal Medicine &mdash; Inpatient Census</h2>
          
          <div style={styles.splashInfoBox}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>📅 Duty Span:</span>
              <span style={styles.infoValue}>{currentDateString}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>👨‍⚕️ IM on Duty:</span>
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
              style={styles.endorseSplashButton} 
              onClick={handlePerformEndorsement}
            >
              🔄 Endorse Shift (New Duty Span & Handover)
            </button>
            <button 
              style={styles.archiveNavButton} 
              onClick={() => setCurrentView('archive')}
            >
              View Historical Archive (Snapshots & Discharges)
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
          <h2>Historical Archive & Duty Snapshots</h2>
          <button style={styles.homeButton} onClick={() => setCurrentView('splash')}>
            Home Splash
          </button>
        </div>

        <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
          <input 
            type="text" 
            placeholder="Search archive by duty period, snapshot title, or diagnosis..." 
            value={archiveSearchQuery}
            onChange={(e) => setArchiveSearchQuery(e.target.value)}
            style={{ ...styles.searchBar, marginBottom: 0, paddingRight: archiveSearchQuery ? '35px' : '12px' }}
            autoFocus
          />
          {archiveSearchQuery && (
            <button 
              onClick={() => setArchiveSearchQuery('')}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', fontSize: '18px', fontWeight: 'bold', color: '#666', cursor: 'pointer'
              }}
            >
              &times;
            </button>
          )}
        </div>

        <p style={styles.subText}>
          {!isSearching 
            ? "Showing all saved duty-shift snapshots and individual patient archives." 
            : `Found ${filteredArchive.length} matching archive record(s):`}
        </p>

        <div style={styles.listContainer}>
          {filteredArchive.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#666', background: '#fff', borderRadius: '8px' }}>No matching archive records found.</p>
          ) : (
            filteredArchive.map(record => (
              <div key={record.id} style={{ ...styles.patientRow, borderLeftColor: record.isSnapshot ? '#28a745' : '#6c757d', display: 'block' }}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: '0 0 4px 0', color: record.isSnapshot ? '#28a745' : '#0056b3' }}>
                      {record.isSnapshot ? `📦 ${record.name}` : record.name}
                    </h4>
                    <span style={styles.periodBadge}>{record.admissionPeriod}</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#555' }}>{record.finalImpression}</p>

                  {record.isSnapshot && record.snapshotPatients && (
                    <div style={{ marginTop: '12px', overflowX: 'auto', border: '1px solid #ddd', borderRadius: '6px', background: '#fafafa', padding: '8px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#333', margin: '0 0 6px 0' }}>Endorsed Census Snapshot Table ({record.snapshotPatients.length} patients):</p>
                      <table style={styles.archiveTable}>
                        <thead>
                          <tr style={styles.tableHeaderRow}>
                            <th style={styles.th}>Room</th>
                            <th style={styles.th}>Patient Name</th>
                            <th style={styles.th}>Age/Sex</th>
                            <th style={styles.th}>Diagnosis</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Endorsement Summary</th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.snapshotPatients.map(sp => (
                            <tr key={sp.id} style={styles.tableRow}>
                              <td style={styles.td}><strong>{sp.wardRoom}</strong></td>
                              <td style={styles.td}>{sp.name}</td>
                              <td style={styles.td}>{sp.ageSex}</td>
                              <td style={styles.td}>{sp.admittingDiagnosis}</td>
                              <td style={styles.td}><span style={styles.statusBadge(sp.status)}>{sp.status}</span></td>
                              <td style={styles.td}>
                                <div style={{ fontSize: '12px' }}>
                                  <strong>Cond:</strong> {sp.endorsement?.currentCondition}<br/>
                                  <strong>Labs:</strong> {sp.endorsement?.diagnostics}<br/>
                                  <strong>Meds:</strong> {sp.endorsement?.therapeutics}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

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
        <button style={styles.backButton} onClick={() => { setSelectedPatient(null); setIsEditingClinical(false); setIsEditingCoreDetails(false); }}>
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
                    setIsEditingCoreDetails(false);
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#0056b3' }}>Update Clinical Details & Disposition</h3>
                
                {/* Separate toggle switch for core fields */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#e9ecef', padding: '6px 10px', borderRadius: '6px', border: '1px solid #ced4da' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={isEditingCoreDetails} 
                      onChange={(e) => setIsEditingCoreDetails(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    Unlock Name, Age/Sex, Date & Physician
                  </label>
                </div>
              </div>

              {/* Core Details Section (Editable only if toggle is checked) */}
              <div style={{ background: isEditingCoreDetails ? '#fff3cd' : '#f1f3f5', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid', borderColor: isEditingCoreDetails ? '#ffeeba' : '#dee2e6' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 'bold', color: isEditingCoreDetails ? '#856404' : '#6c757d' }}>
                  {isEditingCoreDetails ? '⚠️ Core Information Unlocked for Editing' : '🔒 Core Information Locked (Toggle above to edit)'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
                  <div>
                    <label style={styles.label}>Patient Name</label>
                    <input 
                      type="text" 
                      value={clinicalForm.name} 
                      onChange={(e) => setClinicalForm({...clinicalForm, name: e.target.value})}
                      style={styles.input}
                      disabled={!isEditingCoreDetails}
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Age / Sex</label>
                    <input 
                      type="text" 
                      value={clinicalForm.ageSex} 
                      onChange={(e) => setClinicalForm({...clinicalForm, ageSex: e.target.value})}
                      style={styles.input}
                      disabled={!isEditingCoreDetails}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={styles.label}>Admission Date (YYYY-MM-DD)</label>
                    <input 
                      type="text" 
                      value={clinicalForm.admissionDate} 
                      onChange={(e) => setClinicalForm({...clinicalForm, admissionDate: e.target.value})}
                      style={styles.input}
                      disabled={!isEditingCoreDetails}
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Attending Physician</label>
                    <input 
                      type="text" 
                      value={clinicalForm.physician} 
                      onChange={(e) => setClinicalForm({...clinicalForm, physician: e.target.value})}
                      style={styles.input}
                      disabled={!isEditingCoreDetails}
                    />
                  </div>
                </div>
              </div>

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
                  <option value="MGH">MGH (May Go Home)</option>
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

              <div style={{ marginBottom: '12px' }}>
                <label style={styles.label}>Endorsement: Therapeutics / Medications</label>
                <textarea 
                  rows="2" 
                  value={clinicalForm.therapeutics} 
                  onChange={(e) => setClinicalForm({...clinicalForm, therapeutics: e.target.value})}
                  style={styles.textarea}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={styles.label}>Endorsement: Remarks / Notes</label>
                <textarea 
                  rows="2" 
                  value={clinicalForm.remarks} 
                  onChange={(e) => setClinicalForm({...clinicalForm, remarks: e.target.value})}
                  style={styles.textarea}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={styles.saveClinicalBtn}>Save Changes</button>
                <button type="button" onClick={() => { setIsEditingClinical(false); setIsEditingCoreDetails(false); }} style={styles.cancelBtn}>Cancel</button>
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
                {selectedPatient.endorsement?.remarks && (
                  <p><strong>Remarks:</strong> {selectedPatient.endorsement?.remarks}</p>
                )}
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
                  <button type="button" onClick={() => setIsTransferModalOpen(false)} style={styles.cancelBtn}>Cancel</button>
                  <button type="submit" style={styles.saveClinicalBtn}>Confirm Location</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Main Census List & Room Grid Overview
  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2>IM on Duty: <span style={{ color: '#0056b3' }}>{internistOnDuty}</span></h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button style={styles.admitNewButton} onClick={openNewAdmissionModal}>
            + Admit
          </button>
          <button style={styles.referralButton} onClick={openAddReferralModal}>
            + Referral
          </button>
          <button style={styles.archiveNavBtnHeader} onClick={() => setCurrentView('archive')}>
            Archive
          </button>
          <button style={styles.homeButton} onClick={() => setCurrentView('splash')}>
            Home
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', marginBottom: '10px' }}>
        <input 
          type="text" 
          placeholder="Search active inpatients by name (Last, First), room, or diagnosis..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...styles.searchBar, marginBottom: 0, paddingRight: searchQuery ? '35px' : '12px' }}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', fontSize: '18px', fontWeight: 'bold', color: '#666', cursor: 'pointer'
            }}
          >
            &times;
          </button>
        )}
      </div>

      <h3 style={{ fontSize: '16px', color: '#444', marginTop: '20px' }}>Ward, Room & ICU Status (Bed Management Overview)</h3>
      <div style={styles.roomGrid}>
        {allRooms.map(room => {
          const occupant = patients.find(p => p.wardRoom === room);
          
          let cardBg = '#ffffff';
          let cardBorder = '#ddd';
          let badgeBg = '#f1f3f5';
          let badgeColor = '#6c757d';

          if (occupant) {
            const hDay = calculateHospitalDay(occupant.admissionDate);
            if (hDay <= 1) {
              cardBg = '#e3f2fd'; cardBorder = '#90caf9'; badgeBg = '#bbdefb'; badgeColor = '#0d47a1';
            } else if (hDay >= 2 && hDay <= 7) {
              cardBg = '#e8f5e9'; cardBorder = '#a5d6a7'; badgeBg = '#c8e6c9'; badgeColor = '#1b5e20';
            } else if (hDay >= 8 && hDay <= 14) {
              cardBg = '#fff3e0'; cardBorder = '#ffcc80'; badgeBg = '#ffe0b2'; badgeColor = '#e65100';
            } else {
              cardBg = '#ffebee'; cardBorder = '#ef9a9a'; badgeBg = '#ffcdd2'; badgeColor = '#b71c1c';
            }
          }

          return (
            <div 
              key={room}
              onClick={() => occupant && setSelectedPatient(occupant)}
              style={{
                ...styles.roomCard,
                background: cardBg,
                borderColor: cardBorder,
                cursor: occupant ? 'pointer' : 'default'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px' }}>{room}</strong>
                <span style={{ fontSize: '10px', padding: '2px 4px', borderRadius: '4px', background: badgeBg, color: badgeColor }}>
                  {occupant ? `Day ${calculateHospitalDay(occupant.admissionDate)}` : 'Vacant'}
                </span>
              </div>
              <p style={{ fontSize: '12px', margin: '6px 0 0 0', color: occupant ? '#333' : '#aaa', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {occupant ? occupant.name : 'Vacant'}
              </p>
            </div>
          );
        })}
      </div>

      {/* SECTION 1: IM Patients */}
      <h3 style={{ fontSize: '16px', color: '#003d82', marginTop: '25px', marginBottom: '10px' }}>
        IM Inpatients & Unassigned Admissions ({imPatientsList.length})
      </h3>
      <div style={styles.listContainer}>
        {imPatientsList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '15px', color: '#666', background: '#fff', borderRadius: '8px' }}>No IM inpatients found.</p>
        ) : (
          imPatientsList.map(patient => (
            <div key={patient.id} style={styles.patientRow} onClick={() => setSelectedPatient(patient)}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#0056b3' }}>{patient.wardRoom} &mdash; {patient.name}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{patient.admittingDiagnosis} (Day {calculateHospitalDay(patient.admissionDate)})</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={styles.statusBadge(patient.status)}>{patient.status}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button style={styles.orderArrowBtn} onClick={(e) => movePatientOrder(patient.id, 'up', e)} title="Move Up">▲</button>
                  <button style={styles.orderArrowBtn} onClick={(e) => movePatientOrder(patient.id, 'down', e)} title="Move Down">▼</button>
                </div>
                <button style={styles.smallClearBtn} onClick={(e) => handleClearRoom(patient.id, e)} title="Clear Room">Clear</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* SECTION 2: Referrals */}
      <h3 style={{ fontSize: '16px', color: '#28a745', marginTop: '25px', marginBottom: '10px' }}>
        External Department Referrals ({referralPatientsList.length})
      </h3>
      <div style={styles.listContainer}>
        {referralPatientsList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '15px', color: '#666', background: '#fff', borderRadius: '8px' }}>No active referrals.</p>
        ) : (
          referralPatientsList.map(patient => (
            <div key={patient.id} style={{ ...styles.patientRow, borderLeftColor: '#28a745' }} onClick={() => setSelectedPatient(patient)}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#28a745' }}>{patient.wardRoom} &mdash; {patient.name}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{patient.admittingDiagnosis}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={styles.statusBadge(patient.status)}>{patient.status}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <button style={styles.orderArrowBtn} onClick={(e) => movePatientOrder(patient.id, 'up', e)} title="Move Up">▲</button>
                  <button style={styles.orderArrowBtn} onClick={(e) => movePatientOrder(patient.id, 'down', e)} title="Move Down">▼</button>
                </div>
                <button style={styles.smallClearBtn} onClick={(e) => handleClearRoom(patient.id, e)} title="Clear Record">Clear</button>
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
  endorseSplashButton: { background: '#28a745', color: 'white', border: 'none', padding: '12px 20px', fontSize: '15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  archiveNavButton: { background: '#6c757d', color: 'white', border: 'none', padding: '12px 20px', fontSize: '15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  admitNewButton: { background: '#007bff', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  archiveNavBtnHeader: { background: '#ffc107', color: '#333', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  container: { maxWidth: '900px', margin: '40px auto', padding: '20px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  homeButton: { background: '#f0f0f0', border: '1px solid #ccc', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  referralButton: { background: '#17a2b8', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  transferButton: { background: '#ffc107', color: '#333', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  editButton: { background: '#17a2b8', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  searchBar: { width: '100%', padding: '12px', fontSize: '15px', border: '1px solid #ccc', borderRadius: '6px', marginBottom: '10px', boxSizing: 'border-box' },
  subText: { color: '#666', fontSize: '13px', marginBottom: '10px' },
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px', marginTop: '10px', maxHeight: '260px', overflowY: 'auto', padding: '4px', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' },
  roomCard: { padding: '8px', borderRadius: '6px', border: '1px solid', transition: 'all 0.2s ease' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  patientRow: { background: 'white', padding: '16px 20px', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderLeft: '5px solid #0056b3' },
  archiveTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', marginTop: '6px' },
  tableHeaderRow: { background: '#e9ecef', color: '#333' },
  th: { padding: '8px 10px', borderBottom: '2px solid #ddd', fontWeight: 'bold' },
  td: { padding: '8px 10px', borderBottom: '1px solid #eee', color: '#444' },
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
  orderArrowBtn: { background: '#f1f3f5', border: '1px solid #ced4da', color: '#495057', width: '22px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', padding: 0 },
  statusBadge: (status) => ({
    background: status === 'MGH' ? '#d1ecf1' : status === 'New Admission' ? '#cce5ff' : status === 'Referral' ? '#d4edda' : status === 'Improving' ? '#d4edda' : status === 'Critical' ? '#f8d7da' : '#fff3cd',
    color: status === 'MGH' ? '#0c5460' : status === 'New Admission' ? '#004085' : status === 'Referral' ? '#155724' : status === 'Improving' ? '#155724' : status === 'Critical' ? '#721c24' : '#856404',
    padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
  })
};