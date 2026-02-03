    // UI: afficher/masquer section "Choix du repas" selon présence
    const form = document.getElementById('rsvpForm');
    const mealSection = document.getElementById('mealSection');
    const guestsContainer = document.getElementById('guestsContainer');
    const guestTemplate = document.getElementById('guestTemplate');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const guestsInput = document.getElementById('guests');

    function clampGuests(n) {
      if (!Number.isFinite(n)) return 1;
      return Math.min(10, Math.max(1, n));
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
        // set ids and labels for accessibility
        const nameId = `guestName-${i}`;
        const mealId = `guestMeal-${i}`;
        nameInput.id = nameId;
        nameInput.placeholder = `Convive ${i}`;
        mealSelect.id = mealId;

        guestsContainer.appendChild(frag);
      }
    }

    // Show/hide meal section on presence change
    form.addEventListener('change', (e) => {
      const presence = form.elements['presence'].value;
      if (presence === 'yes') {
        mealSection.classList.remove('hidden');
        const guestsValue = parseInt(guestsInput.value || '1', 10);
        renderGuestFields(clampGuests(guestsValue));
      } else {
        mealSection.classList.add('hidden');
        clearGuestFields();
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
        if (!guestsValue || guestsValue < 1 || guestsValue > 10) {
          showMessage("Veuillez indiquer un nombre d'invités valide (1–10).", 'error');
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
        const data = {
          name,
          code: form.elements['code'] ? form.elements['code'].value.trim() : '',
          presence,
          guestsCount: 0,
          guests: [],
          allergies: form.elements['allergies'].value.trim(),
          timestamp: new Date().toISOString()
        };
        console.log('Données RSVP:', data);
      }

      // Simuler succès
      submitBtn.disabled = true;
      showMessage('Merci ! Ta réponse a bien été prise en compte.', 'success');
    });

    resetBtn.addEventListener('click', () => {
      form.reset();
      mealSection.classList.add('hidden');
      clearGuestFields();
      submitBtn.disabled = false;
      messageDiv.classList.add('hidden');
    });

    function showMessage(text, type) {
      messageDiv.textContent = text;
      messageDiv.className = 'message ' + (type === 'error' ? 'error' : 'success');
      messageDiv.classList.remove('hidden');
    }