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
    const presenceInputs = document.getElementById('presence');

    // Google Form entry IDs for each possible guest name (up to 8 guests)
    const nameEntries = [
      'entry.917303489', // Nom1
      'entry.984672673', // Nom2
      'entry.10819648',  // Nom3
      'entry.805623984', // Nom4
      'entry.1423852104',// Nom5
      'entry.2049663739',// Nom6
      'entry.551807984', // Nom7
      'entry.1413971020' // Nom8
    ];

    // Google Form entry IDs for each guest's meal question (still four questions)
    const mealEntries = [
      'entry.1839507603', // Guest 1 meal
      'entry.600979784',  // Guest 2 meal
      'entry.370169106',  // Guest 3 meal
      'entry.476178583'   // Guest 4 meal
    ];

    const absentEntries = [
      'entry.660844129',  // Absent 1
      'entry.1776389277', // Absent 2
      'entry.996084352',  // Absent 3
      'entry.477286184',  // Absent 4
      'entry.760026792',  // Absent 5
      'entry.476411903',  // Absent 6
      'entry.275301949',  // Absent 7
      'entry.1178658106'  // Absent 8
    ];

    // limit number of guest/absent fields to 1..8 (matches form entries)
    function clampGuests(n) {
      if (!Number.isFinite(n)) return 1;
      return Math.min(8, Math.max(1, n));
    }

    function clearGuestFields() {
      guestsContainer.innerHTML = '';
    }


    /*  Génère les champs pour les convives selon le nombre indiqué */
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
        nameInput.id = nameId
        // fall back to a generic name if we run out of entry ids (shouldn't happen)
        nameInput.name = nameEntries[i-1] || 'guestName';
        nameInput.placeholder = `Convive ${i}`;
        mealSelect.id = mealId;
        // if we don't have a corresponding entry ID (e.g. guest > mealEntries.length)
        // leave the name as the generic placeholder so the form will still submit
        mealSelect.name = mealEntries[i-1] || 'guestMeal';
        mealLabel.textContent = `Choix du repas pour le convive ${i}`;

        guestsContainer.appendChild(frag);
      }
    }

    function clearAbsentFields() {
      absentContainer.innerHTML = '';
    }
  /*  Génère les champs pour les convives selon le nombre indiqué */
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
        nameInput.name = absentEntries[i-1] || 'absentName';
        nameInput.placeholder = `Personne ${i}`;

        absentContainer.appendChild(frag);
      }
    }

    // Show/hide meal/absent section on presence change
    presenceInputs.addEventListener('change', (e) => {
      const presence = form.elements['entry.1233920643'].value;
      if (presence === 'Présent') {
        mealSection.classList.remove('hidden');
        absentSection.classList.add('hidden');
        if (guestsLabel) guestsLabel.classList.remove('hidden');
        if (absentCountInput) absentCountInput.value = '';
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
      if (form.elements['entry.1233920643'] && form.elements['entry.1233920643'].value === 'Présent') {
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
        if (form.elements['entry.1233920643'] && form.elements['entry.1233920643'].value === 'Absent') {
          if (!Number.isFinite(value) || value < 1) {
            clearAbsentFields();
            return;
          }
          renderAbsentFields(clampGuests(value));
        }
      });
    }

    form.addEventListener('submit', (e) => {
      // Validation will prevent submission if invalid
      let isValid = true;

      // there is no standalone "name" field in the current markup, so
      // we no longer access form.elements['name'] directly.  if you add a
      // dedicated name input with an entry ID, read it here.
      const presence = form.elements['entry.1233920643'].value;
      const guestsValue = parseInt(form.elements['guests'] ? form.elements['guests'].value : '', 10);

      // optional: derive responder name from first guest if needed
      // const name = guestsContainer.querySelector('input')?.value.trim() || '';

      if (presence === 'Présent') {
        if (!guestsValue || guestsValue < 1 || guestsValue > 8) {
          showMessage("Veuillez indiquer un nombre d'invités valide (1–8).", 'error');
          isValid = false;
        }

        if (isValid) {
          const guestNodes = guestsContainer.querySelectorAll('.guest');
          if (!guestNodes || guestNodes.length !== guestsValue) {
            showMessage("Les champs pour les convives doivent correspondre au nombre d'invités.", 'error');
            isValid = false;
          }

          if (isValid) {
            for (const node of guestNodes) {
              // query by element type instead of name, since we rename the fields to entry IDs
              const gNameInput = node.querySelector('input');
              const gMealSelect = node.querySelector('select');
              const gName = gNameInput ? gNameInput.value.trim() : '';
              const gMeal = gMealSelect ? gMealSelect.value : '';
              if (!gName) {
                showMessage('Veuillez indiquer le nom de tous les convives.', 'error');
                isValid = false;
                break;
              }
              if (!gMeal) {
                showMessage('Veuillez choisir le repas de tous les convives.', 'error');
                isValid = false;
                break;
              }
            }
          }
        }
      } else {
        const absentCount = parseInt(form.elements['absentCount'] ? form.elements['absentCount'].value : '', 10);
        if (!absentCount || absentCount < 1 || absentCount > 8) {
          showMessage("Veuillez indiquer un nombre de personnes absentes valide (1–8).", 'error');
          isValid = false;
        }

        if (isValid) {
          const absentNodes = absentContainer.querySelectorAll('.absent');
          if (!absentNodes || absentNodes.length !== absentCount) {
            showMessage("Les champs pour les personnes absentes doivent correspondre au nombre indiqué.", 'error');
            isValid = false;
          }

          if (isValid) {
            for (const node of absentNodes) {
              const aInput = node.querySelector('input');
              const aName = aInput ? aInput.value.trim() : '';
              if (!aName) {
                showMessage('Veuillez indiquer le nom de toutes les personnes absentes.', 'error');
                isValid = false;
                break;
              }
            }
          }
        }
      }

      if (!isValid) {
        e.preventDefault(); // Prevent submission if validation failed
      } else {
        // Valid: submit via fetch to avoid redirection
        e.preventDefault();
        submitBtn.disabled = true;
        const formData = new FormData(form);
        fetch(form.action, {
          method: 'POST',
          body: formData,
          mode: 'no-cors' // To handle CORS
        })
        .then(() => {
          // Success: show message and trigger fireworks
          showMessage('Votre réponse a été envoyée avec succès !', 'success');
          // Trigger fireworks animation
          document.querySelectorAll(".firework").forEach(f => {

              // reset animation
              f.classList.remove("active");

              // force reflow (important)
              void f.offsetWidth;

              // relance animation
              f.classList.add("active");

              f.addEventListener("animationend", () => {
                f.classList.remove("active");
              });
      });
        })
        .catch((error) => {
          console.error('Erreur lors de l\'envoi:', error);
          showMessage('Erreur lors de l\'envoi. Veuillez réessayer.', 'error');
        })
        .finally(() => {
          submitBtn.disabled = false;
        });
      }
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