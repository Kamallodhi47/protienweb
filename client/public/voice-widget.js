/**
 * Standalone Voice Assistant Widget (Pure Vanilla JavaScript)
 * -------------------------------------------------------------
 * Drop this script into any website or index.html page:
 * <script src="voice-widget.js"></script>
 */

(function () {
  'use me strict';

  // Prevent multiple initializations
  if (window.__VOICE_WIDGET_INITIALIZED__) return;
  window.__VOICE_WIDGET_INITIALIZED__ = true;

  // Configuration & State
  const config = {
    lang: 'hi-IN', // Default language: Hindi/Hinglish (also supports 'en-US')
    voiceFeedback: true, // Speech Synthesis TTS feedback
  };

  let isListening = false;
  let recognition = null;

  // Initialize Web Speech API Recognition
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('Web Speech API is not supported in this browser.');
  } else {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = config.lang;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript;
          handleVoiceCommand(text);
        } else {
          updateTranscriptBadge(event.results[i][0].transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        showActionBadge('Error: ' + event.error, '#ef4444');
      }
    };

    recognition.onend = () => {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {}
      }
    };
  }

  // Voice Feedback (SpeechSynthesis)
  function speak(text) {
    if (!config.voiceFeedback || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.lang;
    window.speechSynthesis.speak(utterance);
  }

  // Command Handler & DOM Clicker Engine
  function handleVoiceCommand(rawSpeech) {
    const speech = rawSpeech.toLowerCase().trim();
    if (!speech) return;

    showActionBadge('Heard: "' + rawSpeech + '"', '#10b981');

    // 1. Navigation / Smooth Scroll Actions
    if (speech.includes('home') || speech.includes('ghar') || speech.includes('shuruat')) {
      const homeLink = document.querySelector('a[href="/"], a[href="#home"], #home-btn');
      if (homeLink) homeLink.click();
      speak('Navigating to Home');
      return;
    }

    if (speech.includes('contact') || speech.includes('sampark')) {
      const contactBtn = document.querySelector('a[href*="contact"], #contact-btn, button[id*="contact"]');
      if (contactBtn) {
        contactBtn.click();
        speak('Opening Contact page');
      } else {
        window.location.href = '/contact';
      }
      return;
    }

    if (speech.includes('about') || speech.includes('hamare baare')) {
      const aboutBtn = document.querySelector('a[href*="about"], #about-btn');
      if (aboutBtn) {
        aboutBtn.click();
        speak('Opening About page');
      } else {
        window.location.href = '/about';
      }
      return;
    }

    if (speech.includes('scroll down') || speech.includes('neeche')) {
      window.scrollBy({ top: 500, behavior: 'smooth' });
      speak('Scrolling down');
      return;
    }

    if (speech.includes('scroll up') || speech.includes('upar')) {
      window.scrollBy({ top: -500, behavior: 'smooth' });
      speak('Scrolling up');
      return;
    }

    // 2. Generic Target Selector Clicker
    const clickables = Array.from(
      document.querySelectorAll('button, a, input[type="button"], input[type="submit"]')
    );

    const match = clickables.find((elem) => {
      const text = (elem.innerText || elem.getAttribute('aria-label') || elem.value || '').toLowerCase();
      return text && speech.includes(text.trim().toLowerCase());
    });

    if (match) {
      match.click();
      speak('Clicked ' + (match.innerText || 'button'));
      showActionBadge('Clicked: ' + (match.innerText || 'Element'), '#3b82f6');
      return;
    }

    speak('Command not recognized');
  }

  // Inject Widget Styles & Floating UI into DOM
  function injectWidgetUI() {
    const style = document.createElement('style');
    style.innerHTML = `
      .vw-floating-container {
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 999999;
        font-family: system-ui, -apple-system, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      .vw-mic-btn {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #111827;
        color: #ffffff;
        border: none;
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22px;
        transition: all 0.3s ease;
      }
      .vw-mic-btn.active {
        background: #10b981;
        box-shadow: 0 0 0 6px rgba(16, 185, 129, 0.3);
        animation: vw-pulse 1.5s infinite;
      }
      @keyframes vw-pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.08); }
        100% { transform: scale(1); }
      }
      .vw-badge {
        background: rgba(17, 24, 39, 0.9);
        color: #fff;
        font-size: 12px;
        padding: 6px 12px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        backdrop-filter: blur(8px);
        display: none;
        max-width: 250px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    `;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.className = 'vw-floating-container';

    const badge = document.createElement('div');
    badge.className = 'vw-badge';
    badge.id = 'vw-status-badge';

    const micBtn = document.createElement('button');
    micBtn.className = 'vw-mic-btn';
    micBtn.id = 'vw-mic-button';
    micBtn.innerHTML = '🎤';
    micBtn.title = 'Click to activate Voice Command';

    micBtn.addEventListener('click', toggleListeningState);

    container.appendChild(badge);
    container.appendChild(micBtn);
    document.body.appendChild(container);
  }

  function toggleListeningState() {
    if (!recognition) {
      alert('Speech Recognition is not supported in your browser.');
      return;
    }

    const micBtn = document.getElementById('vw-mic-button');

    if (isListening) {
      isListening = false;
      recognition.stop();
      micBtn.classList.remove('active');
      showActionBadge('Voice Off', '#6b7280');
      speak('Voice Off');
    } else {
      isListening = true;
      try {
        recognition.start();
        micBtn.classList.add('active');
        showActionBadge('Listening...', '#10b981');
        speak('Listening');
      } catch (e) {
        console.error(e);
      }
    }
  }

  function updateTranscriptBadge(text) {
    const badge = document.getElementById('vw-status-badge');
    if (!badge) return;
    badge.style.display = 'block';
    badge.style.borderLeft = '3px solid #3b82f6';
    badge.innerText = 'Listening: "' + text + '"';
  }

  function showActionBadge(text, color) {
    const badge = document.getElementById('vw-status-badge');
    if (!badge) return;
    badge.style.display = 'block';
    badge.style.borderLeft = '3px solid ' + (color || '#10b981');
    badge.innerText = text;

    setTimeout(() => {
      if (!isListening) {
        badge.style.display = 'none';
      }
    }, 4000);
  }

  // Auto-mount UI on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectWidgetUI);
  } else {
    injectWidgetUI();
  }
})();
