console.log("email writer assistant with tone selection and multilingual support");

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'ai-reply-button';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function createToneSelector() {
    const container = document.createElement('div');
    container.className = 'tone-selector-container';

    const savedTone = getActiveTone();
    const displayTone = savedTone.charAt(0).toUpperCase() + savedTone.slice(1);

    const button = document.createElement('div');
    button.className = 'tone-dropdown-button';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Select Reply Tone');
    button.setAttribute('data-selected-tone', savedTone);

    const label = document.createElement('span');
    label.className = 'tone-label';
    label.textContent = displayTone;

    const arrow = document.createElement('span');
    arrow.className = 'tone-arrow';
    arrow.textContent = '▼';

    button.appendChild(label);
    button.appendChild(arrow);

    const dropdown = document.createElement('div');
    dropdown.className = 'tone-dropdown';

    const tones = ['Professional', 'Friendly', 'Formal', 'Casual', 'Empathetic'];
    tones.forEach(tone => {
        const option = document.createElement('div');
        option.className = 'tone-option';
        option.textContent = tone;

        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const newTone = tone.toLowerCase();
            label.textContent = tone;
            button.setAttribute('data-selected-tone', newTone);
            setActiveTone(newTone);
            dropdown.style.display = 'none';
            // Removed regenerateWithNewTone to prevent auto-generation
        });

        dropdown.appendChild(option);
    });

    button.addEventListener('click', () => {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    container.appendChild(button);
    container.appendChild(dropdown);
    return container;
}

function createLanguageSelector() {
    const container = document.createElement('div');
    container.className = 'tone-selector-container';

    const savedLanguage = getActiveLanguage();
    const displayLanguage = savedLanguage.charAt(0).toUpperCase() + savedLanguage.slice(1);

    const button = document.createElement('div');
    button.className = 'tone-dropdown-button';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Select Reply Language');
    button.setAttribute('data-selected-language', savedLanguage);

    const label = document.createElement('span');
    label.className = 'tone-label';
    label.textContent = displayLanguage;

    const arrow = document.createElement('span');
    arrow.className = 'tone-arrow';
    arrow.textContent = '▼';

    button.appendChild(label);
    button.appendChild(arrow);

    const dropdown = document.createElement('div');
    dropdown.className = 'tone-dropdown';

    const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Hindi'];
    languages.forEach(language => {
        const option = document.createElement('div');
        option.className = 'tone-option';
        option.textContent = language;

        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const newLanguage = language.toLowerCase();
            label.textContent = language;
            button.setAttribute('data-selected-language', newLanguage);
            setActiveLanguage(newLanguage);
            dropdown.style.display = 'none';
            // Removed regenerateWithNewLanguage to prevent auto-generation
        });

        dropdown.appendChild(option);
    });

    button.addEventListener('click', () => {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    container.appendChild(button);
    container.appendChild(dropdown);
    return container;
}

function createVoiceInput() {
    const container = document.createElement('div');
    container.className = 'voice-input-container';

    const button = document.createElement('div');
    button.className = 'voice-button';
    button.innerHTML = '🎙️';
    button.setAttribute('data-tooltip', 'Add Custom Instructions');

    const instructionBox = document.createElement('div');
    instructionBox.className = 'instruction-box';
    instructionBox.style.display = 'none';

    const instructionText = document.createElement('textarea');
    instructionText.className = 'voice-instruction-text';
    instructionText.placeholder = 'Speak or type instructions...';
    instructionBox.appendChild(instructionText);

    let recognition = null;
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = getActiveLanguage();

        let isRecording = false;

        recognition.onresult = (event) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    instructionText.value = transcript;
                } else {
                    interimTranscript += transcript;
                }
                instructionText.value = transcript + interimTranscript;
            }
        };

        recognition.onend = () => {
            isRecording = false;
            button.innerHTML = '🎙️';
            button.style.background = '';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isRecording = false;
            button.innerHTML = '🎙️';
            button.style.background = '';
            alert('Speech recognition error: ' + event.error);
        };

        button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isRecording) {
                recognition.stop();
                instructionBox.style.display = 'none';
            } else {
                instructionBox.style.display = 'block';
                recognition.start();
                isRecording = true;
                button.innerHTML = '⏹️';
                button.style.background = '#e8f0fe';
            }
        });
    } else {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            instructionBox.style.display = instructionBox.style.display === 'none' ? 'block' : 'none';
        });
    }

    document.addEventListener('click', (e) => {
        if (!container.contains(e.target) && !instructionBox.contains(e.target)) {
            instructionBox.style.display = 'none';
        }
    });

    container.appendChild(button);
    container.appendChild(instructionBox);
    return container;
}

function getEmailContent() {
    const selectors = ['.h7', '.a3s.aiL', '.gmail_quote', '[role="presentation"]'];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerHTML.trim();
        }
    }
    return '';
}

function findComposeToolbar() {
    const selectors = ['.btC', '.aDh', '[role="toolbar"]', '.gU.Up'];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const existingToneSelector = document.querySelector('.tone-selector-container');
    if (existingToneSelector) existingToneSelector.remove();

    const existingLanguageSelector = document.querySelector('.language-selector-container');
    if (existingLanguageSelector) existingLanguageSelector.remove();

    const existingVoiceInput = document.querySelector('.voice-input-container');
    if (existingVoiceInput) existingVoiceInput.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) return;

    const toneSelector = createToneSelector();
    const languageSelector = createLanguageSelector();
    const voiceInput = createVoiceInput();
    const aiButton = createAIButton();

    toolbar.insertBefore(voiceInput, toolbar.firstChild);
    toolbar.insertBefore(languageSelector, toolbar.firstChild);
    toolbar.insertBefore(toneSelector, toolbar.firstChild);
    toolbar.insertBefore(aiButton, toolbar.firstChild);

    aiButton.addEventListener('click', async () => {
        try {
            aiButton.innerHTML = 'Generating...';
            aiButton.disabled = true;

            const emailContent = getEmailContent();
            const toneButton = document.querySelector('.tone-dropdown-button');
            const selectedTone = toneButton.getAttribute('data-selected-tone') || getActiveTone();
            const languageButton = document.querySelector('[data-selected-language]');
            const selectedLanguage = languageButton.getAttribute('data-selected-language') || getActiveLanguage();
            const customInstructions = document.querySelector('.voice-instruction-text')?.value || '';

            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            if (composeBox) composeBox.innerHTML = '';

            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    emailContent, 
                    tone: selectedTone, 
                    language: selectedLanguage, 
                    customInstructions 
                })
            });

            if (!response.ok) throw new Error(`API Request Failed: ${response.statusText}`);

            const generatedReply = await response.text();
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            }
        } catch (error) {
            console.error('Error generating reply:', error);
            alert('Failed to generate reply: ' + error.message);
        } finally {
            aiButton.innerHTML = 'AI Reply';
            aiButton.disabled = false;
        }
    });
}

function setActiveTone(tone) {
    sessionStorage.setItem('activeEmailTone', tone.toLowerCase());
    return tone;
}

function getActiveTone() {
    return sessionStorage.getItem('activeEmailTone') || 'professional';
}

function setActiveLanguage(language) {
    sessionStorage.setItem('activeEmailLanguage', language.toLowerCase());
    return language;
}

function getActiveLanguage() {
    return sessionStorage.getItem('activeEmailLanguage') || 'english';
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            typeof node.matches === 'function' &&
            (node.matches('.aDh, .btC, [role="dialog"]') || node.querySelector('.aDh, .btC, [role="dialog"]'))
        );
        if (hasComposeElements) setTimeout(injectButton, 500);
    }
});

observer.observe(document.body, { childList: true, subtree: true });