    // UI: afficher/masquer section "Choix du repas" selon présence
    const form = document.getElementById('rsvpForm');
    const mealSection = document.getElementById('mealSection');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');

    form.addEventListener('change', (e) => {
      const presence = form.elements['presence'].value;
      if (presence === 'yes') {
        mealSection.classList.remove('hidden');
      } else {
        mealSection.classList.add('hidden');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // validation simple : si présent, le repas est requis
      const name = form.elements['name'].value.trim();
      const presence = form.elements['presence'].value;
      const meal = form.elements['meal'].value;
      if (!name) {
        showMessage('Veuillez indiquer votre nom.', 'error');
        return;
      }
      if (presence === 'yes' && !meal) {
        showMessage('Merci de choisir un repas.', 'error');
        return;
      }

      // données prêtes à être envoyées (console pour l'instant)
      const data = {
        name,
        code: form.elements['code'].value.trim(),
        presence,
        meal: presence === 'yes' ? meal : null,
        allergies: form.elements['allergies'].value.trim(),
        timestamp: new Date().toISOString()
      };

      // Ici : envoi vers Firebase / Firestore (exemple commenté plus bas).
      console.log('Données RSVP:', data);

      // Simuler succès
      submitBtn.disabled = true;
      showMessage('Merci ! Ta réponse a bien été prise en compte.', 'success');
    });

    resetBtn.addEventListener('click', () => {
      form.reset();
      mealSection.classList.add('hidden');
      submitBtn.disabled = false;
      messageDiv.classList.add('hidden');
    });

    function showMessage(text, type) {
      messageDiv.textContent = text;
      messageDiv.className = 'message ' + (type === 'error' ? 'error' : 'success');
      messageDiv.classList.remove('hidden');
    }