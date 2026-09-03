import React, { useState, useEffect, useRef } from 'react';

// --- Patient Modal Component (Self-Contained) ---
function PatientModal({ room, allRooms, patient, onClose, onSave, onDischarge }) {
  const [modalRoom, setModalRoom] = useState(room || 'Pending Room Assignment');
  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [customRoomText, setCustomRoomText] = useState('');

  const [formData, setFormData] = useState({
    name: patient ? patient.name : '',
    age: patient ? patient.ageSex.split('/')[0].trim() : '',
    gender: patient ? (patient.ageSex.includes('F') ? 'Female' : 'Male') : 'Male',
    admissionDate: patient ? patient.admissionDate : new Date().toISOString().split('T')[0],
    physician: patient ? patient.physician : '',
    diagnosis: patient ? patient.admittingDiagnosis : '',
    currentCondition: patient ? patient.endorsement?.currentCondition : '',
    diagnostics: patient ? patient.endorsement?.diagnostics : '',
    therapeutics: patient ? patient.endorsement?.therapeutics : '',
    remarks: patient ? patient.endorsement?.remarks : '',
    status: patient ? patient.status : (room === '' ? 'Referral' : 'New Admission')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalRoom = isCustomRoom ? customRoomText.trim() : modalRoom;
    onSave(finalRoom, formData);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalCardLarge}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '20px' }}>
            {room === '' ? '📝 Register New Referral' : '➕ New Inpatient Admission'}
          </h3>
          <button onClick={onClose} style={styles.modalCloseBtn}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '14px' }}>
            <div>
              <label style={styles.label}>Patient Full Name (Last, First M.I.)</label>
              <input 
                type="text" 
                placeholder="e.g., Dela Cruz, Juan A." 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={styles.input}
                required
              />
            </div>
            <div>
              <label style={styles.label}>Age & Gender</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="number" 
                  placeholder="Age" 
                  value={formData.age} 
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  style={{ ...styles.input, width: '70px' }}
                  required
                />
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '14px' }}>
            <div>
              <label style={styles.label}>Ward / Room / Bed Assignment</label>
              <select 
                value={isCustomRoom ? 'OTHER_ROOM' : modalRoom}
                onChange={(e) => {
                  if (e.target.value === 'OTHER_ROOM') {
                    setIsCustomRoom(true);
                  } else {
                    setIsCustomRoom(false);
                    setModalRoom(e.target.value);
                  }
                }}
                style={styles.input}
              >
                <option value="Pending Room Assignment">Pending Room Assignment</option>
                {allRooms.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="OTHER_ROOM">-- Other Custom Location / Referral Ward --</option>
              </select>
            </div>
            {isCustomRoom && (
              <div>
                <label style={styles.label}>Specify Custom Location</label>
                <input 
                  type="text" 
                  placeholder="e.g., ER Cubicle 2, Surgical Ward" 
                  value={customRoomText}
                  onChange={(e) => setCustomRoomText(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            )}
            <div>
              <label style={styles.label}>Admission Date</label>
              <input 
                type="date" 
                value={formData.admissionDate} 
                onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '14px' }}>
            <div>
              <label style={styles.label}>Attending Physician</label>
              <input 
                type="text" 
                placeholder="e.g., Dr. Maria Santos" 
                value={formData.physician} 
                onChange={(e) => setFormData({...formData, physician: e.target.value})}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.label}>Initial Status / Disposition</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={styles.input}
              >
                <option value="New Admission">New Admission</option>
                <option value="Referral">Referral</option>
                <option value="Stable">Stable</option>
                <option value="Improving">Improving</option>
                <option value="Guarded">Guarded</option>
                <option value="Close Watch">Close Watch</option>
                <option value="Critical">Critical</option>
                <option value="MGH">MGH</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={styles.label}>Admitting Diagnosis / Working Impression</label>
            <input 
              type="text" 
              placeholder="e.g., Community-Acquired Pneumonia, High Risk" 
              value={formData.diagnosis} 
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              style={styles.input}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={styles.label}>Initial Endorsement: Current Condition</label>
            <textarea 
              rows="2" 
              placeholder="Brief clinical description..." 
              value={formData.currentCondition} 
              onChange={(e) => setFormData({...formData, currentCondition: e.target.value})}
              style={styles.textarea}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={styles.label}>Diagnostics / Pending Labs</label>
              <textarea 
                rows="2" 
                value={formData.diagnostics} 
                onChange={(e) => setFormData({...formData, diagnostics: e.target.value})}
                style={styles.textarea}
              />
            </div>
            <div>
              <label style={styles.label}>Therapeutics / Medications</label>
              <textarea 
                rows="2" 
                value={formData.therapeutics} 
                onChange={(e) => setFormData({...formData, therapeutics: e.target.value})}
                style={styles.textarea}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>Cancel</button>
            <button type="submit" style={styles.saveClinicalBtn}>Save Admission Record</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [currentView, setCurrentView] = useState('splash'); // 'splash', 'census', or 'archive'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const lastViewedIdRef = useRef(null);

  const [currentDateString, setCurrentDateString] = useState(() => {
    return localStorage.getItem('jrrmdh_datespan') || 'September 1 - September 2, 2026';
  });

  const [internistOnDuty, setInternistOnDuty] = useState(() => {
    return localStorage.getItem('jrrmdh_internist') || 'Dr. Maria Santos';
  });
  const [isEditingInternist, setIsEditingInternist] = useState(false);
  const [tempInternist, setTempInternist] = useState('');

  // Reversion States
  const [showRevertBox, setShowRevertBox] = useState(false);
  const [revertPassword, setRevertPassword] = useState('');

  useEffect(() => {
    localStorage.setItem('jrrmdh_datespan', currentDateString);
  }, [currentDateString]);

  useEffect(() => {
    localStorage.setItem('jrrmdh_internist', internistOnDuty);
  }, [internistOnDuty]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialRoom, setModalInitialRoom] = useState('Pending Room Assignment');

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTarget, setTransferTarget] = useState('');
  const [customTransferText, setCustomTransferText] = useState('');
  const [isCustomTransfer, setIsCustomTransfer] = useState(false);

  const [isEditingClinical, setIsEditingClinical] = useState(false);
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

  const [patients, setPatients] = useState(() => {
    const savedPatients = localStorage.getItem('jrrmdh_patients');
    if (savedPatients) {
      try { return JSON.parse(savedPatients); } catch (e) { console.error(e); }
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

  useEffect(() => {
    localStorage.setItem('jrrmdh_patients', JSON.stringify(patients));
  }, [patients]);

  const [dischargedArchive, setDischargedArchive] = useState(() => {
    const savedArchive = localStorage.getItem('jrrmdh_archive');
    if (savedArchive) {
      try { return JSON.parse(savedArchive); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 101,
        name: 'Reyes, Pedro',
        ageSex: '58 / M',
        admissionDate: '2026-08-01',
        dischargeDate: '2026-08-05',
        admissionPeriod: 'August 1 - August 5, 2026',
        physician: 'Dr. Maria Santos',
        finalImpression: 'Acute Gastroenteritis, resolved with oral hydration and antibiotics.',
        isSnapshot: false
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('jrrmdh_archive', JSON.stringify(dischargedArchive));
  }, [dischargedArchive]);

  // Section 1: Duty Date Search State
  const [dutyDateQuery, setDutyDateQuery] = useState('');
  const [selectedSnapshotOption, setSelectedSnapshotOption] = useState(null);

  // Section 2: Patient Details Search States (Tabbed)
  const [activeDetailTab, setActiveDetailTab] = useState('name'); // 'name', 'admissionDate', 'dischargeDate', 'physician', 'impression'
  const [nameQuery, setNameQuery] = useState('');
  const [admissionDateQuery, setAdmissionDateQuery] = useState('');
  const [dischargeDateQuery, setDischargeDateQuery] = useState('');
  const [physicianQuery, setPhysicianQuery] = useState('');
  const [impressionQuery, setImpressionQuery] = useState('');

  // Scroll back to specific patient row upon returning from detail view
  useEffect(() => {
    if (!selectedPatient && lastViewedIdRef.current) {
      const el = document.getElementById(`patient-row-${lastViewedIdRef.current}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      lastViewedIdRef.current = null;
    }
  }, [selectedPatient]);

  const fixedRooms = [
    "301", "303-1", "303-2", "303-3", "303-4",
    "304-1", "304-2", "304-3", "304-4", "305", "307",
    "309-1", "309-2", "PR", "310-1", "310-2", "310-3", "310-4",
    "312-1", "312-2", "312-3", "312-4", "ICU-B2", "ICU-B3",
    "ICU-High-Risk", "ICU-ISO"
  ];

  const isReferralLocation = (room) => room !== 'Pending Room Assignment' && !fixedRooms.includes(room);

  const customReferrals = patients.map(p => p.wardRoom).filter(room => isReferralLocation(room));
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
    const confirmEndorsement = window.confirm(
      "Are you sure you want to endorse the shift? This will generate a duty snapshot, archive current data, and advance the duty span."
    );
    if (!confirmEndorsement) return;

    const incomingDoctor = prompt("Enter the name of the incoming Internist on Duty for the next shift:", "Dr. ");
    if (!incomingDoctor) return;

    // Save backup state for reversion if accidental
    const previousStateBackup = {
      patients: [...patients],
      internistOnDuty: internistOnDuty,
      currentDateString: currentDateString,
      timestamp: Date.now()
    };
    localStorage.setItem('jrrmdh_previous_state', JSON.stringify(previousStateBackup));

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

  const handleRevertEndorsement = (e) => {
    e.preventDefault();
    if (revertPassword !== 'IMjprizal000') {
      alert("Incorrect password.");
      return;
    }
    const savedPrevState = localStorage.getItem('jrrmdh_previous_state');
    if (!savedPrevState) {
      alert("No previous duty span backup found to revert to.");
      return;
    }
    try {
      const prevState = JSON.parse(savedPrevState);
      setPatients(prevState.patients);
      setInternistOnDuty(prevState.internistOnDuty);
      setCurrentDateString(prevState.currentDateString);

      // Remove the accidental snapshot from archive if present
      setDischargedArchive(prev => prev.filter(rec => !rec.isSnapshot || rec.id < prevState.timestamp));

      localStorage.removeItem('jrrmdh_previous_state');
      setRevertPassword('');
      setShowRevertBox(false);
      alert(`Successfully reverted back to previous duty span: [ ${prevState.currentDateString} ] with Dr. ${prevState.internistOnDuty}.`);
    } catch (err) {
      console.error(err);
      alert("Error restoring previous state.");
    }
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
          admissionDate: patientToArchive.admissionDate,
          dischargeDate: todayStr,
          admissionPeriod: `${patientToArchive.admissionDate} - ${todayStr}`,
          physician: patientToArchive.physician || internistOnDuty,
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
      workingImpression: patient.workingImpression || patient.admittingDiagnosis || '',
      currentCondition: patient.endorsement?.currentCondition || '',
      diagnostics: patient.endorsement?.diagnostics || '',
      therapeutics: patient.endorsement?.therapeutics || '',
      remarks: patient.endorsement?.remarks || '',
      status: patient.status || 'Stable'
    });
    setIsEditingCoreDetails(false);
    setIsEditingClinical(true);
  };

  const saveClinicalEdits = (e) => {
    e.preventDefault();
    setPatients(prev => prev.map(p => {
      if (p.id === selectedPatient.id) {
        const updated = {
          ...p,
          name: isEditingCoreDetails ? clinicalForm.name : p.name,
          ageSex: isEditingCoreDetails ? clinicalForm.ageSex : p.ageSex,
          admissionDate: isEditingCoreDetails ? clinicalForm.admissionDate : p.admissionDate,
          physician: isEditingCoreDetails ? clinicalForm.physician : p.physician,
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

  const statusBadge = (status) => {
    let bg = '#e2e8f0';
    let color = '#334155';
    if (status === 'New Admission') { bg = '#dbeafe'; color = '#1d4ed8'; }
    else if (status === 'Guarded') { bg = '#ffedd5'; color = '#c2410c'; }
    else if (status === 'Close Watch') { bg = '#fed7aa'; color = '#9a3412'; }
    else if (status === 'Critical') { bg = '#fee2e2'; color = '#b91c1c'; }
    else if (status === 'MGH') { bg = '#dcfce7'; color = '#15803d'; }
    else if (status === 'Expired') { bg = '#111827'; color = '#ffffff'; }
    else if (status === 'Stable') { bg = '#f1f5f9'; color = '#475569'; }
    else if (status === 'Improving') { bg = '#ccfbf1'; color = '#0f766e'; }
    else if (status === 'Referral') { bg = '#d1fae5'; color = '#047857'; }
    else if (status === 'Transferred') { bg = '#f3e8ff'; color = '#7e22ce'; }
    else if (status === 'Absconded') { bg = '#ffe4e6'; color = '#9f1239'; }

    return {
      background: bg,
      color: color,
      padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold'
    };
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.wardRoom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.admittingDiagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.workingImpression && p.workingImpression.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const imPatientsList = filteredPatients.filter(p => !p.isReferral);
  const referralPatientsList = filteredPatients.filter(p => p.isReferral);

  // Home Splash Metrics Calculation
  const splashActiveCount = patients.filter(p => p.wardRoom !== 'Pending Room Assignment' && !p.isReferral).length;
  const splashPendingRoomCount = patients.filter(p => p.wardRoom === 'Pending Room Assignment').length;
  const splashForDischargeCount = patients.filter(p => p.status === 'MGH' || p.status === 'For Discharge').length;
  const splashDischargedCount = dischargedArchive.filter(rec => !rec.isSnapshot).length;
  const splashReferralCount = patients.filter(p => p.isReferral || isReferralLocation(p.wardRoom)).length;

  // Archive Filtering Logic
  const matchingSnapshots = dischargedArchive.filter(rec => rec.isSnapshot && rec.admissionPeriod.toLowerCase().includes(dutyDateQuery.toLowerCase()));
  
  // Tabbed Patient Details Filtering Logic
  const matchingPatientRecords = dischargedArchive.filter(rec => {
    if (rec.isSnapshot) return false;
    if (activeDetailTab === 'name') {
      return nameQuery.trim() === '' || rec.name.toLowerCase().includes(nameQuery.toLowerCase());
    }
    if (activeDetailTab === 'admissionDate') {
      return admissionDateQuery.trim() === '' || (rec.admissionDate && rec.admissionDate.toLowerCase().includes(admissionDateQuery.toLowerCase()));
    }
    if (activeDetailTab === 'dischargeDate') {
      return dischargeDateQuery.trim() === '' || (rec.dischargeDate && rec.dischargeDate.toLowerCase().includes(dischargeDateQuery.toLowerCase()));
    }
    if (activeDetailTab === 'physician') {
      return physicianQuery.trim() === '' || (rec.physician && rec.physician.toLowerCase().includes(physicianQuery.toLowerCase()));
    }
    if (activeDetailTab === 'impression') {
      return impressionQuery.trim() === '' || (rec.finalImpression && rec.finalImpression.toLowerCase().includes(impressionQuery.toLowerCase()));
    }
    return false;
  });

  const clearAllArchiveSearches = () => {
    setDutyDateQuery('');
    setSelectedSnapshotOption(null);
    setNameQuery('');
    setAdmissionDateQuery('');
    setDischargeDateQuery('');
    setPhysicianQuery('');
    setImpressionQuery('');
  };

  if (currentView === 'splash') {
    return (
      <div style={styles.splashContainer}>
        <div style={styles.splashCard}>
          <h1 style={styles.hospitalTitle}>Dr. Jose P. Rizal Memorial District Hospital</h1>
          <h2 style={styles.deptTitle}>Department of Internal Medicine</h2>
          <p style={styles.portalSubtitle}>Inpatient Duty Portal &bull; Census & Shift Management System</p>
          
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
                      placeholder="Enter internist name..."
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

          {/* Updated Splash Count Panels */}
          <div style={styles.splashMetricsSection}>
            <div style={styles.splashMetricBox}>
              <h4 style={styles.splashMetricHeader}>Inpatient Counts</h4>
              <div style={styles.splashMetricGrid}>
                <div style={styles.splashMetricItem}>
                  <span style={styles.splashMetricNum}>{splashActiveCount}</span>
                  <span style={styles.splashMetricLabel}>Active</span>
                </div>
                <div style={styles.splashMetricItem}>
                  <span style={styles.splashMetricNum}>{splashPendingRoomCount}</span>
                  <span style={styles.splashMetricLabel}>Pending Room</span>
                </div>
                <div style={styles.splashMetricItem}>
                  <span style={styles.splashMetricNum}>{splashForDischargeCount}</span>
                  <span style={styles.splashMetricLabel}>For Discharge</span>
                </div>
                <div style={styles.splashMetricItem}>
                  <span style={styles.splashMetricNum}>{splashDischargedCount}</span>
                  <span style={styles.splashMetricLabel}>Discharged (Cleared)</span>
                </div>
              </div>
            </div>

            <div style={styles.splashMetricBox}>
              <h4 style={styles.splashMetricHeader}>Referral Counts</h4>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '8px 0' }}>
                <div style={styles.splashMetricItemSingle}>
                  <span style={styles.splashMetricNum}>{splashReferralCount}</span>
                  <span style={styles.splashMetricLabel}>Total Referrals</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
            <button style={styles.enterButton} onClick={() => setCurrentView('census')}>
              Enter Daily Census Dashboard
            </button>
            <button style={styles.endorseSplashButton} onClick={handlePerformEndorsement}>
              🔄 Endorse Shift (New Duty Span & Handover)
            </button>
          </div>

          {/* Password-Protected Reversion Section */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', textAlign: 'left' }}>
            {!showRevertBox ? (
              <button 
                onClick={() => setShowRevertBox(true)} 
                style={{ background: 'none', border: 'none', color: '#b91c1c', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
              >
                ⚠️ Accidental endorsement? Click here to revert...
              </button>
            ) : (
              <form onSubmit={handleRevertEndorsement} style={{ background: '#fef2f2', padding: '14px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
                <h4 style={{ margin: '0 0 6px 0', color: '#991b1b', fontSize: '14px' }}>Revert Accidental Shift Endorsement</h4>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#7f1d1d' }}>Enter password to restore previous duty span and census data:</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="password" 
                    placeholder="Enter password..." 
                    value={revertPassword}
                    onChange={(e) => setRevertPassword(e.target.value)}
                    style={{ ...styles.input, fontSize: '13px', padding: '6px 10px' }}
                    required
                  />
                  <button type="submit" style={{ background: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Revert
                  </button>
                  <button type="button" onClick={() => { setShowRevertBox(false); setRevertPassword(''); }} style={{ background: '#64748b', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'archive') {
    return (
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2>Historical Archive & Search Hub</h2>
          <button style={styles.homeButton} onClick={() => { setCurrentView('splash'); clearAllArchiveSearches(); }}>Home Splash</button>
        </div>

        {/* SECTION 1: Duty Date Search */}
        <div style={styles.archiveSectionCard}>
          <h3 style={{ margin: '0 0 6px 0', color: '#1e3a8a', fontSize: '16px' }}>1) Duty Date Search</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>Search by duty date span to look up complete shift snapshots.</p>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <input 
              type="text" 
              placeholder="e.g., September 1, August 28..." 
              value={dutyDateQuery}
              onChange={(e) => {
                setDutyDateQuery(e.target.value);
                setSelectedSnapshotOption(null);
              }}
              style={{ ...styles.searchBar, marginBottom: 0, paddingRight: dutyDateQuery ? '35px' : '14px' }}
            />
            {dutyDateQuery && (
              <button 
                onClick={() => { setDutyDateQuery(''); setSelectedSnapshotOption(null); }}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', fontWeight: 'bold', color: '#666', cursor: 'pointer' }}
              >
                &times;
              </button>
            )}
          </div>

          {dutyDateQuery.trim() && (
            <div style={{ marginTop: '15px' }}>
              {matchingSnapshots.length > 0 && !selectedSnapshotOption && (
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '14px 16px', borderRadius: '8px', marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: '#b45309', fontSize: '15px' }}>Multiple Duty Shift Records Found for "{dutyDateQuery}"</h4>
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#78350f' }}>Since duty dates are recorded by duty span (2 shifts per date), please choose which specific duty span you wish to view:</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {matchingSnapshots.map(snap => (
                      <button 
                        key={snap.id} 
                        onClick={() => setSelectedSnapshotOption(snap)}
                        style={{ background: '#ffffff', border: '1px solid #f59e0b', padding: '10px 14px', borderRadius: '6px', textAlign: 'left', cursor: 'pointer', fontWeight: 'bold', color: '#92400e', fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <span>📦 {snap.name}</span>
                        <span style={{ background: '#fef3c7', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>{snap.admissionPeriod}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedSnapshotOption && (
                <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#059669', fontSize: '16px' }}>📦 {selectedSnapshotOption.name}</h4>
                    <button onClick={() => setSelectedSnapshotOption(null)} style={{ background: '#e2e8f0', border: 'none', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>&larr; Choose Other Duty Span</button>
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#475569' }}><strong>Duty Span:</strong> {selectedSnapshotOption.admissionPeriod} | {selectedSnapshotOption.finalImpression}</p>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={styles.archiveTable}>
                      <thead>
                        <tr style={styles.tableHeaderRow}>
                          <th style={styles.th}>Room</th>
                          <th style={styles.th}>Patient Name</th>
                          <th style={styles.th}>Age/Sex</th>
                          <th style={styles.th}>Impression / Diagnosis</th>
                          <th style={styles.th}>Status</th>
                          <th style={styles.th}>Endorsement Summary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSnapshotOption.snapshotPatients?.map(sp => (
                          <tr key={sp.id} style={styles.tableRow}>
                            <td style={styles.td}><strong>{sp.wardRoom}</strong></td>
                            <td style={styles.td}>{sp.name}</td>
                            <td style={styles.td}>{sp.ageSex}</td>
                            <td style={styles.td}>{sp.workingImpression || sp.admittingDiagnosis}</td>
                            <td style={styles.td}><span style={statusBadge(sp.status)}>{sp.status}</span></td>
                            <td style={styles.td}>
                              <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
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
                </div>
              )}

              {matchingSnapshots.length === 0 && (
                <p style={{ textAlign: 'center', padding: '15px', color: '#666', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', margin: 0 }}>No duty shift snapshots found matching "{dutyDateQuery}".</p>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: Patient Details Search (Tabbed) */}
        <div style={styles.archiveSectionCard}>
          <h3 style={{ margin: '0 0 6px 0', color: '#1e3a8a', fontSize: '16px' }}>2) Patient Details Search</h3>
          <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#64748b' }}>Select a category tab to search archived patient records independently.</p>
          
          {/* Tab Buttons */}
          <div style={styles.tabContainer}>
            <button 
              style={activeDetailTab === 'name' ? styles.tabActive : styles.tabInactive}
              onClick={() => setActiveDetailTab('name')}
            >
              👤 Patient's Name
            </button>
            <button 
              style={activeDetailTab === 'admissionDate' ? styles.tabActive : styles.tabInactive}
              onClick={() => setActiveDetailTab('admissionDate')}
            >
              📅 Date of Admission
            </button>
            <button 
              style={activeDetailTab === 'dischargeDate' ? styles.tabActive : styles.tabInactive}
              onClick={() => setActiveDetailTab('dischargeDate')}
            >
              🏁 Date of Discharge
            </button>
            <button 
              style={activeDetailTab === 'physician' ? styles.tabActive : styles.tabInactive}
              onClick={() => setActiveDetailTab('physician')}
            >
              👨‍⚕️ Attending Physician
            </button>
            <button 
              style={activeDetailTab === 'impression' ? styles.tabActive : styles.tabInactive}
              onClick={() => setActiveDetailTab('impression')}
            >
              🩺 Working Impression / Condition
            </button>
          </div>

          {/* Active Tab Input Section */}
          <div style={{ position: 'relative', width: '100%', marginTop: '10px' }}>
            {activeDetailTab === 'name' && (
              <>
                <input 
                  type="text" 
                  placeholder="Search by patient name (e.g., Dela Cruz)..." 
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  style={{ ...styles.searchBar, marginBottom: 0, paddingRight: nameQuery ? '35px' : '14px' }}
                />
                {nameQuery && (
                  <button onClick={() => setNameQuery('')} style={styles.clearInputBtn}>&times;</button>
                )}
              </>
            )}

            {activeDetailTab === 'admissionDate' && (
              <>
                <input 
                  type="text" 
                  placeholder="Search by admission date (e.g., 2026-08-01, August 1)..." 
                  value={admissionDateQuery}
                  onChange={(e) => setAdmissionDateQuery(e.target.value)}
                  style={{ ...styles.searchBar, marginBottom: 0, paddingRight: admissionDateQuery ? '35px' : '14px' }}
                />
                {admissionDateQuery && (
                  <button onClick={() => setAdmissionDateQuery('')} style={styles.clearInputBtn}>&times;</button>
                )}
              </>
            )}

            {activeDetailTab === 'dischargeDate' && (
              <>
                <input 
                  type="text" 
                  placeholder="Search by discharge/clearance date (e.g., 2026-08-05)..." 
                  value={dischargeDateQuery}
                  onChange={(e) => setDischargeDateQuery(e.target.value)}
                  style={{ ...styles.searchBar, marginBottom: 0, paddingRight: dischargeDateQuery ? '35px' : '14px' }}
                />
                {dischargeDateQuery && (
                  <button onClick={() => setDischargeDateQuery('')} style={styles.clearInputBtn}>&times;</button>
                )}
              </>
            )}

            {activeDetailTab === 'physician' && (
              <>
                <input 
                  type="text" 
                  placeholder="Search by attending physician (e.g., Dr. Santos)..." 
                  value={physicianQuery}
                  onChange={(e) => setPhysicianQuery(e.target.value)}
                  style={{ ...styles.searchBar, marginBottom: 0, paddingRight: physicianQuery ? '35px' : '14px' }}
                />
                {physicianQuery && (
                  <button onClick={() => setPhysicianQuery('')} style={styles.clearInputBtn}>&times;</button>
                )}
              </>
            )}

            {activeDetailTab === 'impression' && (
              <>
                <input 
                  type="text" 
                  placeholder="Search by working impression or condition (e.g., Pneumonia)..." 
                  value={impressionQuery}
                  onChange={(e) => setImpressionQuery(e.target.value)}
                  style={{ ...styles.searchBar, marginBottom: 0, paddingRight: impressionQuery ? '35px' : '14px' }}
                />
                {impressionQuery && (
                  <button onClick={() => setImpressionQuery('')} style={styles.clearInputBtn}>&times;</button>
                )}
              </>
            )}
          </div>

          {/* Tab Search Results Output */}
          <div style={{ marginTop: '15px' }}>
            {((activeDetailTab === 'name' && nameQuery.trim()) ||
              (activeDetailTab === 'admissionDate' && admissionDateQuery.trim()) ||
              (activeDetailTab === 'dischargeDate' && dischargeDateQuery.trim()) ||
              (activeDetailTab === 'physician' && physicianQuery.trim()) ||
              (activeDetailTab === 'impression' && impressionQuery.trim())) ? (
              
              matchingPatientRecords.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {matchingPatientRecords.map(record => (
                    <div key={record.id} style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', borderLeft: '4px solid #0284c7' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: '#1e3a8a', fontSize: '16px' }}>{record.name} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'normal' }}>({record.ageSex})</span></h4>
                        <span style={styles.periodBadge}>Admitted: {record.admissionDate || 'N/A'} | Discharged: {record.dischargeDate || 'N/A'}</span>
                      </div>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#334155' }}><strong>Attending Physician:</strong> {record.physician || 'Not specified'}</p>
                      <p style={{ margin: '4px 0', fontSize: '14px', color: '#334155' }}><strong>Working Impression / Condition:</strong> {record.finalImpression}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '15px', color: '#666', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', margin: 0 }}>No archived patient records found matching your search criteria.</p>
              )
            ) : (
              <p style={{ textAlign: 'center', padding: '15px', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', fontSize: '13px', margin: 0, fontStyle: 'italic' }}>Type a query above to search records by {activeDetailTab === 'name' ? "Patient's Name" : activeDetailTab === 'admissionDate' ? 'Date of Admission' : activeDetailTab === 'dischargeDate' ? 'Date of Discharge' : activeDetailTab === 'physician' ? 'Attending Physician' : 'Working Impression / Condition'}.</p>
            )}
          </div>
        </div>

        <div style={{ marginTop: '25px' }}>
          <button style={styles.backButton} onClick={() => setCurrentView('census')}>&larr; Back to Active Census</button>
        </div>
      </div>
    );
  }

  if (selectedPatient) {
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => { 
          lastViewedIdRef.current = selectedPatient.id;
          setSelectedPatient(null); 
          setIsEditingClinical(false); 
          setIsEditingCoreDetails(false); 
        }}>
          &larr; Back to Census List
        </button>

        <div style={styles.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
            <div>
              <h2 style={{ margin: '0 0 6px 0', color: '#1e3a8a' }}>{selectedPatient.name} <span style={{ fontSize: '18px', color: '#64748b', fontWeight: 'normal' }}>({selectedPatient.ageSex})</span></h2>
              <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Location / Room:</strong> <span style={{ color: '#0284c7', fontWeight: 'bold' }}>{selectedPatient.wardRoom}</span></p>
              <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Attending Physician:</strong> {selectedPatient.physician || 'Not specified'}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
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

          <p style={{ marginTop: '12px', fontSize: '14px', color: '#475569' }}><strong>Admission Date:</strong> {selectedPatient.admissionDate} (Hospital Day {calculateHospitalDay(selectedPatient.admissionDate)})</p>
          
          <hr style={styles.divider} />

          {isEditingClinical ? (
            <form onSubmit={saveClinicalEdits} style={styles.editFormBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ margin: 0, color: '#1e3a8a', fontSize: '18px' }}>Update Clinical Details & Disposition</h3>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                    <input 
                      type="checkbox" 
                      checked={isEditingCoreDetails} 
                      onChange={(e) => setIsEditingCoreDetails(e.target.checked)}
                      style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                    />
                    Unlock Name, Age/Sex, Date & Physician
                  </label>
                </div>
              </div>

              <div style={{ background: isEditingCoreDetails ? '#fef3c7' : '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid', borderColor: isEditingCoreDetails ? '#fde68a' : '#e2e8f0' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '10px' }}>
                  <div>
                    <label style={styles.label}>Patient Name</label>
                    <input type="text" value={clinicalForm.name} onChange={(e) => setClinicalForm({...clinicalForm, name: e.target.value})} style={styles.input} disabled={!isEditingCoreDetails} required />
                  </div>
                  <div>
                    <label style={styles.label}>Age / Sex</label>
                    <input type="text" value={clinicalForm.ageSex} onChange={(e) => setClinicalForm({...clinicalForm, ageSex: e.target.value})} style={styles.input} disabled={!isEditingCoreDetails} required />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={styles.label}>Admission Date</label>
                    <input type="date" value={clinicalForm.admissionDate} onChange={(e) => setClinicalForm({...clinicalForm, admissionDate: e.target.value})} style={styles.input} disabled={!isEditingCoreDetails} required />
                  </div>
                  <div>
                    <label style={styles.label}>Attending Physician</label>
                    <input type="text" value={clinicalForm.physician} onChange={(e) => setClinicalForm({...clinicalForm, physician: e.target.value})} style={styles.input} disabled={!isEditingCoreDetails} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.label}>Admitting Diagnosis <span style={{ fontWeight: 'normal', color: '#64748b' }}>(Fixed / Permanent Record)</span></label>
                <input type="text" value={selectedPatient.admittingDiagnosis} style={{ ...styles.input, backgroundColor: '#f1f5f9', color: '#475569' }} disabled />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.label}>Working Impression / Current Assessment</label>
                <input type="text" value={clinicalForm.workingImpression} onChange={(e) => setClinicalForm({...clinicalForm, workingImpression: e.target.value})} style={styles.input} required />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.label}>Status / Disposition</label>
                <select value={clinicalForm.status} onChange={(e) => setClinicalForm({...clinicalForm, status: e.target.value})} style={styles.input}>
                  <option value="Referral">Referral</option>
                  <option value="New Admission">New Admission</option>
                  <option value="Stable">Stable</option>
                  <option value="Improving">Improving</option>
                  <option value="Guarded">Guarded</option>
                  <option value="Close Watch">Close Watch</option>
                  <option value="Critical">Critical</option>
                  <option value="MGH">MGH (May Go Home)</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Absconded">Absconded</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.label}>Endorsement: Current Condition</label>
                <textarea rows="2" value={clinicalForm.currentCondition} onChange={(e) => setClinicalForm({...clinicalForm, currentCondition: e.target.value})} style={styles.textarea} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.label}>Endorsement: Diagnostics / Labs</label>
                <textarea rows="2" value={clinicalForm.diagnostics} onChange={(e) => setClinicalForm({...clinicalForm, diagnostics: e.target.value})} style={styles.textarea} />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={styles.label}>Endorsement: Therapeutics / Medications</label>
                <textarea rows="2" value={clinicalForm.therapeutics} onChange={(e) => setClinicalForm({...clinicalForm, therapeutics: e.target.value})} style={styles.textarea} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={styles.label}>Endorsement: Remarks / Notes</label>
                <textarea rows="2" value={clinicalForm.remarks} onChange={(e) => setClinicalForm({...clinicalForm, remarks: e.target.value})} style={styles.textarea} />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" style={styles.saveClinicalBtn}>Save Changes</button>
                <button type="button" onClick={() => { setIsEditingClinical(false); setIsEditingCoreDetails(false); }} style={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h3 style={{ color: '#334155', fontSize: '18px', marginTop: '20px' }}>Clinical Overview</h3>
              <p style={{ fontSize: '15px' }}><strong>Admitting Diagnosis:</strong> {selectedPatient.admittingDiagnosis}</p>
              <p style={{ fontSize: '15px' }}><strong>Working Impression:</strong> {selectedPatient.workingImpression}</p>
              
              <div style={styles.endorsementBox}>
                <h4 style={{ margin: '0 0 10px 0', color: '#047857', fontSize: '16px' }}>Daily Endorsement</h4>
                <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Current Condition:</strong> {selectedPatient.endorsement?.currentCondition}</p>
                <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Diagnostics:</strong> {selectedPatient.endorsement?.diagnostics}</p>
                <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Therapeutics:</strong> {selectedPatient.endorsement?.therapeutics}</p>
                {selectedPatient.endorsement?.remarks && (
                  <p style={{ margin: '6px 0', fontSize: '14px' }}><strong>Remarks:</strong> {selectedPatient.endorsement?.remarks}</p>
                )}
              </div>

              <p style={{ fontSize: '15px' }}><strong>Status / Disposition:</strong> <span style={statusBadge(selectedPatient.status)}>{selectedPatient.status}</span></p>
            </>
          )}

          <button style={styles.clearRoomButton} onClick={(e) => handleClearRoom(selectedPatient.id, e)}>
            Clear Room & Archive Record
          </button>
        </div>

        {isTransferModalOpen && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalCard}>
              <h3 style={{ margin: '0 0 15px 0', color: '#1e3a8a', fontSize: '18px' }}>Assign Room / Transfer &mdash; {selectedPatient.name}</h3>
              <form onSubmit={executeTransfer}>
                <div style={{ marginBottom: '16px' }}>
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
                  <div style={{ marginBottom: '16px' }}>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
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

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <h2 style={{ margin: 0, fontSize: '20px', color: '#1e3a8a' }}>IM on Duty: <span style={{ color: '#0284c7' }}>{internistOnDuty}</span></h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={styles.admitNewButton} onClick={openNewAdmissionModal}>+ Admit</button>
          <button style={styles.referralButton} onClick={openAddReferralModal}>+ Referral</button>
          <button style={styles.archiveNavBtnHeader} onClick={() => { setCurrentView('archive'); clearAllArchiveSearches(); }}>Archive</button>
          <button style={styles.homeButton} onClick={() => setCurrentView('splash')}>Home</button>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', marginBottom: '15px' }}>
        <input 
          type="text" 
          placeholder="Search active inpatients by name, room, or diagnosis..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ ...styles.searchBar, marginBottom: 0, paddingRight: searchQuery ? '35px' : '14px' }}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', fontWeight: 'bold', color: '#666', cursor: 'pointer' }}
          >
            &times;
          </button>
        )}
      </div>

      <h3 style={{ fontSize: '16px', color: '#334155', marginTop: '20px', marginBottom: '8px' }}>Ward, Room & ICU Status (Bed Management Overview)</h3>
      <div style={styles.roomGrid}>
        {allRooms.map(room => {
          const occupant = patients.find(p => p.wardRoom === room);
          let cardBg = '#ffffff';
          let cardBorder = '#e2e8f0';
          let badgeBg = '#f1f5f9';
          let badgeColor = '#64748b';

          if (occupant) {
            const hDay = calculateHospitalDay(occupant.admissionDate);
            if (hDay <= 1) {
              cardBg = '#eff6ff'; cardBorder = '#93c5fd'; badgeBg = '#dbeafe'; badgeColor = '#1d4ed8';
            } else if (hDay >= 2 && hDay <= 7) {
              cardBg = '#f0fdf4'; cardBorder = '#86efac'; badgeBg = '#dcfce7'; badgeColor = '#15803d';
            } else if (hDay >= 8 && hDay <= 14) {
              cardBg = '#fff7ed'; cardBorder = '#fdba74'; badgeBg = '#ffedd5'; badgeColor = '#c2410c';
            } else {
              cardBg = '#fef2f2'; cardBorder = '#fca5a5'; badgeBg = '#fee2e2'; badgeColor = '#b91c1c';
            }
          }

          return (
            <div 
              key={room}
              onClick={() => occupant && setSelectedPatient(occupant)}
              style={{ ...styles.roomCard, background: cardBg, borderColor: cardBorder, cursor: occupant ? 'pointer' : 'default' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px', color: '#1e293b' }}>{room}</strong>
                <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: badgeBg, color: badgeColor, fontWeight: 'bold' }}>
                  {occupant ? `Day ${calculateHospitalDay(occupant.admissionDate)}` : 'Vacant'}
                </span>
              </div>
              <p style={{ fontSize: '12px', margin: '6px 0 0 0', color: occupant ? '#1e293b' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: occupant ? '500' : 'normal' }}>
                {occupant ? occupant.name : 'Vacant'}
              </p>
            </div>
          );
        })}
      </div>

      <h3 style={{ fontSize: '16px', color: '#1e3a8a', marginTop: '25px', marginBottom: '10px' }}>
        IM Inpatients & Unassigned Admissions ({imPatientsList.length})
      </h3>
      <div style={styles.listContainer}>
        {imPatientsList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666', background: '#fff', borderRadius: '10px' }}>No IM inpatients found.</p>
        ) : (
          imPatientsList.map(patient => (
            <div key={patient.id} id={`patient-row-${patient.id}`} style={styles.patientRow} onClick={() => setSelectedPatient(patient)}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#1e3a8a', fontSize: '16px' }}>{patient.wardRoom} &mdash; {patient.name}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>{patient.workingImpression || patient.admittingDiagnosis} (Day {calculateHospitalDay(patient.admissionDate)})</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={statusBadge(patient.status)}>{patient.status}</span>
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

      <h3 style={{ fontSize: '16px', color: '#059669', marginTop: '25px', marginBottom: '10px' }}>
        External Department Referrals ({referralPatientsList.length})
      </h3>
      <div style={styles.listContainer}>
        {referralPatientsList.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#666', background: '#fff', borderRadius: '10px' }}>No active referrals.</p>
        ) : (
          referralPatientsList.map(patient => (
            <div key={patient.id} id={`patient-row-${patient.id}`} style={{ ...styles.patientRow, borderLeftColor: '#10b981' }} onClick={() => setSelectedPatient(patient)}>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: '#059669', fontSize: '16px' }}>{patient.wardRoom} &mdash; {patient.name}</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}>{patient.workingImpression || patient.admittingDiagnosis}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={statusBadge(patient.status)}>{patient.status}</span>
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

const styles = {
  splashContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', padding: '20px' },
  splashCard: { background: '#ffffff', padding: '40px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', maxWidth: '620px', width: '100%' },
  hospitalTitle: { color: '#1e293b', margin: '0 0 4px 0', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.02em' },
  deptTitle: { color: '#0284c7', fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' },
  portalSubtitle: { color: '#64748b', fontSize: '13px', fontWeight: '500', marginBottom: '20px' },
  splashInfoBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', textAlign: 'left' },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', fontSize: '14px' },
  infoLabel: { fontWeight: '600', color: '#334155' },
  infoValue: { color: '#0284c7', fontWeight: '700' },
  physicianInput: { padding: '6px 10px', fontSize: '13px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' },
  savePhysicianBtn: { background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' },
  editPhysicianBtn: { background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontWeight: 'bold' },
  
  // New splash metrics card layouts
  splashMetricsSection: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  splashMetricBox: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', textAlign: 'left' },
  splashMetricHeader: { margin: '0 0 10px 0', fontSize: '14px', fontWeight: '700', color: '#1e3a8a', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' },
  splashMetricGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' },
  splashMetricItem: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  splashMetricItemSingle: { background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '140px' },
  splashMetricNum: { fontSize: '18px', fontWeight: '800', color: '#0284c7', lineHeight: '1.2' },
  splashMetricLabel: { fontSize: '11px', fontWeight: '600', color: '#64748b', marginTop: '2px', textAlign: 'center' },

  enterButton: { background: '#2563eb', color: 'white', border: 'none', padding: '14px 20px', fontSize: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  endorseSplashButton: { background: '#059669', color: 'white', border: 'none', padding: '14px 20px', fontSize: '15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
  admitNewButton: { background: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  archiveNavBtnHeader: { background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  container: { maxWidth: '960px', margin: '30px auto', padding: '24px', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif', background: '#f8fafc', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  homeButton: { background: '#e2e8f0', border: '1px solid #cbd5e1', color: '#334155', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' },
  referralButton: { background: '#0d9488', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  transferButton: { background: '#f59e0b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  editButton: { background: '#0891b2', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  searchBar: { width: '100%', padding: '12px 16px', fontSize: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '12px', boxSizing: 'border-box', outline: 'none', background: '#ffffff' },
  archiveSectionCard: { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  tabContainer: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
  tabActive: { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' },
  tabInactive: { background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  clearInputBtn: { position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: '18px', fontWeight: 'bold', color: '#666', cursor: 'pointer' },
  roomGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '10px', marginTop: '10px', maxHeight: '280px', overflowY: 'auto', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#ffffff' },
  roomCard: { padding: '10px', borderRadius: '8px', border: '1px solid', transition: 'all 0.2s ease' },
  listContainer: { display: 'flex', flexDirection: 'column', gap: '12px' },
  patientRow: { background: 'white', padding: '18px 22px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderLeft: '5px solid #2563eb' },
  archiveTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', marginTop: '8px' },
  tableHeaderRow: { background: '#e2e8f0', color: '#1e293b' },
  th: { padding: '10px 12px', borderBottom: '2px solid #cbd5e1', fontWeight: 'bold' },
  td: { padding: '10px 12px', borderBottom: '1px solid #f1f5f9', color: '#334155' },
  tableRow: {},
  periodBadge: { background: '#e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' },
  detailCard: { background: 'white', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  backButton: { background: 'none', border: 'none', color: '#2563eb', fontSize: '15px', cursor: 'pointer', marginBottom: '16px', padding: 0, fontWeight: 'bold' },
  divider: { border: '0', height: '1px', background: '#e2e8f0', margin: '24px 0' },
  endorsementBox: { background: '#f0fdf4', padding: '18px', borderRadius: '8px', borderLeft: '4px solid #10b981', margin: '20px 0', border: '1px solid #d1fae5' },
  editFormBox: { background: '#f8fafc', padding: '24px', borderRadius: '10px', border: '1px solid #cbd5e1', margin: '20px 0' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: '0', backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: '1000' },
  modalCard: { background: 'white', padding: '30px', borderRadius: '14px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0' },
  modalCardLarge: { background: 'white', padding: '30px', borderRadius: '14px', width: '100%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)', border: '1px solid #e2e8f0', maxHeight: '90vh', overflowY: 'auto' },
  modalCloseBtn: { background: 'none', border: 'none', fontSize: '24px', fontWeight: 'bold', color: '#64748b', cursor: 'pointer' },
  label: { display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', outline: 'none', background: '#fff' },
  textarea: { width: '100%', padding: '10px 12px', fontSize: '14px', border: '1px solid #cbd5e1', borderRadius: '6px', boxSizing: 'border-box', resize: 'vertical', outline: 'none', background: 'fff' },
  saveClinicalBtn: { background: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' },
  cancelBtn: { background: '#64748b', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' },
  clearRoomButton: { background: '#ef4444', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginTop: '24px' },
  smallClearBtn: { background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  orderArrowBtn: { background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#334155', width: '24px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', padding: 0 }
};