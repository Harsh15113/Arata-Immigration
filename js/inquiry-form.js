// Detailed inquiry form on contact.html — conditional sections per visa
// type, repeatable "add another" rows, and submission to Google Apps Script.
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw1Lwl5LXUNqzVfAwfTRfpFBPOfdsDvVZlV_aawHsAbNSeuy9GHVo9gAxnAmrmUF21Z/exec';

  // ---- Passing-year dropdowns (current year down to 60 years ago) ----
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('.year-select').forEach((select) => {
    for (let y = currentYear; y >= currentYear - 60; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y;
      select.appendChild(opt);
    }
  });

  // ---- Show/hide helpers ----
  function setVisible(el, visible) {
    if (el) el.hidden = !visible;
  }

  // ---- Visa type → section toggle ----
  const visaType = document.getElementById('visaType');
  const sectionStudent = document.getElementById('section-student');
  const sectionVisitor = document.getElementById('section-visitor');
  const sectionInvestment = document.getElementById('section-investment');
  const sectionOci = document.getElementById('section-oci');

  visaType.addEventListener('change', () => {
    const val = visaType.value;
    setVisible(sectionStudent, val === 'Student Visa');
    setVisible(sectionVisitor, val === 'Visitor Visa');
    setVisible(sectionInvestment, val === 'Investment Visa');
    setVisible(sectionOci, val === 'OCI Visa');

    if (val === 'Visitor Visa') {
      ensureFirstRow('visitorCountry', document.getElementById('visitorCountryRows'));
      ensureFirstRow('travelHistory', document.getElementById('travelHistoryRows'));
    }
  });

  // ---- English proficiency test ----
  const englishTestCleared = document.getElementById('englishTestCleared');
  const englishTestDetails = document.getElementById('englishTestDetails');
  const englishTestType = document.getElementById('englishTestType');
  const englishTestOtherWrap = document.getElementById('englishTestOtherWrap');

  englishTestCleared.addEventListener('change', () => {
    setVisible(englishTestDetails, englishTestCleared.value === 'Yes');
  });
  englishTestType.addEventListener('change', () => {
    setVisible(englishTestOtherWrap, englishTestType.value === 'Others');
  });

  // ---- Student past refusal ----
  const studentPastRefusal = document.getElementById('studentPastRefusal');
  const studentRefusalGroup = document.getElementById('studentRefusalGroup');
  studentPastRefusal.addEventListener('change', () => {
    const isYes = studentPastRefusal.value === 'Yes';
    setVisible(studentRefusalGroup, isYes);
    if (isYes) ensureFirstRow('studentRefusal', document.getElementById('studentRefusalRows'));
  });

  // ---- Visitor past refusal ----
  const visitorPastRefusal = document.getElementById('visitorPastRefusal');
  const visitorRefusalGroup = document.getElementById('visitorRefusalGroup');
  visitorPastRefusal.addEventListener('change', () => {
    const isYes = visitorPastRefusal.value === 'Yes';
    setVisible(visitorRefusalGroup, isYes);
    if (isYes) ensureFirstRow('visitorRefusal', document.getElementById('visitorRefusalRows'));
  });

  // ---- Travelling purpose ----
  const travelPurpose = document.getElementById('travelPurpose');
  const familyVisitFields = document.getElementById('familyVisitFields');
  const businessFields = document.getElementById('businessFields');
  travelPurpose.addEventListener('change', () => {
    setVisible(familyVisitFields, travelPurpose.value === 'Family Visit');
    setVisible(businessFields, travelPurpose.value === 'Business');
  });

  // ---- Repeatable rows ----
  function makeRow(type) {
    const row = document.createElement('div');
    row.className = 'repeat-row';
    row.dataset.rowType = type;

    if (type === 'visitorCountry') {
      row.innerHTML = '<input type="text" placeholder="Country" data-field="country">';
    } else if (type === 'travelHistory') {
      row.innerHTML =
        '<input type="text" placeholder="Year" data-field="year" style="max-width:110px">' +
        '<input type="text" placeholder="Country" data-field="country">';
    } else if (type === 'visitorRefusal') {
      row.innerHTML =
        '<input type="text" placeholder="Year" data-field="year" style="max-width:110px">' +
        '<input type="text" placeholder="Country" data-field="country">';
    } else if (type === 'studentRefusal') {
      row.innerHTML =
        '<select data-field="type" style="max-width:140px"><option>Student</option><option>Visitor</option></select>' +
        '<input type="text" placeholder="Year" data-field="year" style="max-width:110px">' +
        '<input type="text" placeholder="Country" data-field="country">';
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-row-btn';
    removeBtn.setAttribute('aria-label', 'Remove this entry');
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', () => row.remove());
    row.appendChild(removeBtn);

    return row;
  }

  function ensureFirstRow(type, container) {
    if (container && container.children.length === 0) {
      container.appendChild(makeRow(type));
    }
  }

  document.querySelectorAll('.btn-add-row').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.add;
      const container = document.getElementById(
        type === 'visitorCountry' ? 'visitorCountryRows' :
        type === 'travelHistory' ? 'travelHistoryRows' :
        type === 'visitorRefusal' ? 'visitorRefusalRows' :
        'studentRefusalRows'
      );
      if (container) container.appendChild(makeRow(type));
    });
  });

  function flattenRows(container) {
    if (!container) return '';
    const entries = [];
    container.querySelectorAll('.repeat-row').forEach((row) => {
      const parts = [];
      row.querySelectorAll('[data-field]').forEach((input) => {
        if (input.value) parts.push(input.value);
      });
      if (parts.length) entries.push(parts.join(' - '));
    });
    return entries.join('; ');
  }

  function val(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  // ---- Required-field validation ----
  const REQUIRED_FIELD_IDS = [
    'givenName', 'lastName', 'dob', 'gender', 'maritalStatus',
    'validPassport', 'contactNumber', 'emailId', 'address'
  ];

  function validateRequiredFields() {
    let firstInvalid = null;
    REQUIRED_FIELD_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const isEmpty = el.value.trim() === '';
      el.classList.toggle('field-invalid', isEmpty);
      if (isEmpty && !firstInvalid) firstInvalid = el;
    });
    return firstInvalid;
  }

  REQUIRED_FIELD_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', () => el.classList.remove('field-invalid'));
  });

  // ---- Submit ----
  const statusEl = document.getElementById('form-status');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstInvalid = validateRequiredFields();
    if (firstInvalid) {
      if (statusEl) {
        statusEl.textContent = 'Please fill in all required fields marked with *.';
        statusEl.style.color = '#c0392b';
      }
      firstInvalid.focus();
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Sending...'; }
    if (statusEl) { statusEl.textContent = ''; statusEl.style.color = ''; }

    const payload = {
      givenName: val('givenName'),
      lastName: val('lastName'),
      dob: val('dob'),
      gender: val('gender'),
      maritalStatus: val('maritalStatus'),
      validPassport: val('validPassport'),
      contactNumber: val('contactNumber'),
      email: val('emailId'),
      address: val('address'),
      visaType: val('visaType'),

      edu10th: val('edu10th'),
      edu12th: val('edu12th'),
      eduDiplomaBachelors: val('eduDiplomaBachelors'),
      eduPostGrad: val('eduPostGrad'),
      eduPhd: val('eduPhd'),
      studentPreferredCountry: val('studentPreferredCountry'),
      englishTestCleared: val('englishTestCleared'),
      englishTestType: englishTestCleared.value === 'Yes' ? val('englishTestType') : '',
      englishTestOther: englishTestType.value === 'Others' ? val('englishTestOther') : '',
      studentPastRefusal: val('studentPastRefusal'),
      studentRefusalDetails: flattenRows(document.getElementById('studentRefusalRows')),

      visitorCountries: flattenRows(document.getElementById('visitorCountryRows')),
      travelDate: val('travelDate'),
      numDays: val('numDays'),
      travelPurpose: val('travelPurpose'),
      familyRelationship: val('familyRelationship'),
      inviteeVisaStatus: val('inviteeVisaStatus'),
      sponsorLetter: val('sponsorLetter'),
      eventRegistration: val('eventRegistration'),
      invitationLetter: val('invitationLetter'),
      totalMembers: val('totalMembers'),
      travelHistory5Year: flattenRows(document.getElementById('travelHistoryRows')),
      visitorPastRefusal: val('visitorPastRefusal'),
      visitorRefusalDetails: flattenRows(document.getElementById('visitorRefusalRows')),

      investmentCountry: val('investmentCountry'),

      ociPassportCountry: val('ociPassportCountry'),
      ociApplicationType: val('ociApplicationType'),

      message: val('message')
    };

    fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    })
      .then(() => {
        if (statusEl) {
          statusEl.textContent = "Thanks — your inquiry has been sent. We'll get back to you soon.";
          statusEl.style.color = 'var(--orange-dark)';
        }
        form.reset();
        setVisible(sectionStudent, false);
        setVisible(sectionVisitor, false);
        setVisible(sectionInvestment, false);
        setVisible(sectionOci, false);
        setVisible(englishTestDetails, false);
        setVisible(englishTestOtherWrap, false);
        setVisible(studentRefusalGroup, false);
        setVisible(visitorRefusalGroup, false);
        setVisible(familyVisitFields, false);
        setVisible(businessFields, false);
        document.getElementById('visitorCountryRows').innerHTML = '';
        document.getElementById('travelHistoryRows').innerHTML = '';
        document.getElementById('studentRefusalRows').innerHTML = '';
        document.getElementById('visitorRefusalRows').innerHTML = '';
      })
      .catch(() => {
        if (statusEl) {
          statusEl.textContent = 'Something went wrong, please try again.';
          statusEl.style.color = '#c0392b';
        }
      })
      .finally(() => {
        if (btn) { btn.disabled = false; btn.textContent = 'Send Inquiry'; }
      });
  });
});
