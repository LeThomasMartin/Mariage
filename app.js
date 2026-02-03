    // UI: afficher/masquer section "Choix du repas" selon présence
    const form = document.getElementById('rsvpForm');
    const mealSection = document.getElementById('mealSection');
    const guestsLabel = document.getElementById('guestsLabel');
    const guestsContainer = document.getElementById('guestsContainer');
    const guestTemplate = document.getElementById('guestTemplate');
    const absentSection = document.getElementById('absentSection');
    const absentContainer = document.getElementById('absentContainer');
    const absentTemplate = document.getElementById('absentTemplate');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const guestsInput = document.getElementById('guests');
    const absentCountInput = document.getElementById('absentCount');

    function clampGuests(n) {
      if (!Number.isFinite(n)) return 1;
      return Math.min(8, Math.max(1, n));
    }

    function clearGuestFields() {
      guestsContainer.innerHTML = '';
    }

    function renderGuestFields(count) {
      clearGuestFields();
      if (!count || count < 1) return;
      const validCount = clampGuests(count);
      // if input was out of range, normalize value shown
      if (validCount !== count) guestsInput.value = validCount;

      for (let i = 1; i <= validCount; i++) {
        const frag = guestTemplate.content.cloneNode(true);
        const guestDiv = frag.querySelector('.guest');
        const nameInput = guestDiv.querySelector('input[name="guestName"]');
        const mealSelect = guestDiv.querySelector('select[name="guestMeal"]');
        const mealLabel = guestDiv.querySelector('label.field:nth-of-type(2) span');
        // set ids and labels for accessibility
        const nameId = `guestName-${i}`;
        const mealId = `guestMeal-${i}`;
        nameInput.id = nameId;
        nameInput.placeholder = `Convive ${i}`;
        mealSelect.id = mealId;
        mealLabel.textContent = `Choix du repas pour le convive ${i}`;

        guestsContainer.appendChild(frag);
      }
    }

    function clearAbsentFields() {
      //absentContainer.innerHTML = '';
    }

    function renderAbsentFields(count) {
      clearAbsentFields();
      if (!count || count < 1) return;
      const validCount = clampGuests(count);
      if (validCount !== count) absentCountInput.value = validCount;

      for (let i = 1; i <= validCount; i++) {
        const frag = absentTemplate.content.cloneNode(true);
        const absentDiv = frag.querySelector('.absent');
        const nameInput = absentDiv.querySelector('input[name="absentName"]');
        const nameId = `absentName-${i}`;
        nameInput.id = nameId;
        nameInput.placeholder = `Personne ${i}`;

        absentContainer.appendChild(frag);
      }
    }

    // Show/hide meal/absent section on presence change
    form.addEventListener('change', (e) => {
      const presence = form.elements['presence'].value;
      if (presence === 'yes') {
        mealSection.classList.remove('hidden');
        absentSection.classList.add('hidden');
        if (guestsLabel) guestsLabel.classList.remove('hidden');
        //if (absentCountInput) absentCountInput.value = '';
        clearAbsentFields();
        const guestsValue = parseInt(guestsInput.value || '1', 10);
        renderGuestFields(clampGuests(guestsValue));
      } else {
        mealSection.classList.add('hidden');
        clearGuestFields();
        if (guestsLabel) guestsLabel.classList.add('hidden');
        absentSection.classList.remove('hidden');
        const absentValue = parseInt(absentCountInput.value || '1', 10);
        renderAbsentFields(clampGuests(absentValue));
      }
    });

    // Update fields when number of guests changes
    guestsInput.addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      if (form.elements['presence'] && form.elements['presence'].value === 'yes') {
        if (!Number.isFinite(value) || value < 1) {
          clearGuestFields();
          return;
        }
        renderGuestFields(clampGuests(value));
      }
    });

    // Update absent fields when number of absentees changes
    if (absentCountInput) {
      absentCountInput.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        if (form.elements['presence'] && form.elements['presence'].value === 'no') {
          if (!Number.isFinite(value) || value < 1) {
            clearAbsentFields();
            return;
          }
          renderAbsentFields(clampGuests(value));
        }
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.elements['name'].value.trim();
      const presence = form.elements['presence'].value;
      const guestsValue = parseInt(form.elements['guests'] ? form.elements['guests'].value : '', 10);

      if (!name) {
        showMessage('Veuillez indiquer votre nom.', 'error');
        return;
      }

      if (presence === 'yes') {
        if (!guestsValue || guestsValue < 1 || guestsValue > 8) {
          showMessage("Veuillez indiquer un nombre d'invités valide (1–8).", 'error');
          return;
        }

        const guestNodes = guestsContainer.querySelectorAll('.guest');
        if (!guestNodes || guestNodes.length !== guestsValue) {
          showMessage("Les champs pour les convives doivent correspondre au nombre d'invités.", 'error');
          return;
        }

        const guests = [];
        for (const node of guestNodes) {
          const gName = node.querySelector('input[name="guestName"]').value.trim();
          const gMeal = node.querySelector('select[name="guestMeal"]').value;
          if (!gName) {
            showMessage('Veuillez indiquer le nom de tous les convives.', 'error');
            return;
          }
          if (!gMeal) {
            showMessage('Veuillez choisir le repas de tous les convives.', 'error');
            return;
          }
          guests.push({ name: gName, meal: gMeal });
        }

        const data = {
          name,
          code: form.elements['code'] ? form.elements['code'].value.trim() : '',
          presence,
          guestsCount: guests.length,
          guests,
          allergies: form.elements['allergies'].value.trim(),
          timestamp: new Date().toISOString()
        };

        console.log('Données RSVP:', data);
      } else {
        const absentCount = parseInt(form.elements['absentCount'] ? form.elements['absentCount'].value : '', 10);
        if (!absentCount || absentCount < 1 || absentCount > 8) {
          showMessage("Veuillez indiquer un nombre de personnes absentes valide (1–8).", 'error');
          return;
        }

        const absentNodes = absentContainer.querySelectorAll('.absent');
        if (!absentNodes || absentNodes.length !== absentCount) {
          showMessage("Les champs pour les personnes absentes doivent correspondre au nombre indiqué.", 'error');
          return;
        }

        const absentees = [];
        for (const node of absentNodes) {
          const aName = node.querySelector('input[name="absentName"]').value.trim();
          if (!aName) {
            showMessage('Veuillez indiquer le nom de toutes les personnes absentes.', 'error');
            return;
          }
          absentees.push(aName);
        }

        const data = {
          name,
          code: form.elements['code'] ? form.elements['code'].value.trim() : '',
          presence,
          absentees,
          guestsCount: 0,
          guests: [],
          allergies: form.elements['allergies'].value.trim(),
          timestamp: new Date().toISOString()
        };
        console.log('Données RSVP (absents):', data);
      }

      // Simuler succès
      submitBtn.disabled = true;
      showMessage('Merci ! Ta réponse a bien été prise en compte.', 'success');
    });
  
    resetBtn.addEventListener('click', () => {
      form.reset();
      mealSection.classList.add('hidden');
      clearGuestFields();
      absentSection.classList.add('hidden');
      clearAbsentFields();
      if (guestsLabel) guestsLabel.classList.remove('hidden');
      if (absentCountInput) absentCountInput.value = '';
      submitBtn.disabled = false;
      messageDiv.classList.add('hidden');
    });

    function showMessage(text, type) {
      messageDiv.textContent = text;
      messageDiv.className = 'message ' + (type === 'error' ? 'error' : 'success');
      messageDiv.classList.remove('hidden');
    }