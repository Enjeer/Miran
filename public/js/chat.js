class ChatPage {
  constructor() {
    this.chat = document.getElementById("chatMessages");
    this.input = document.getElementById("userInput");
    this.sendBtn = document.getElementById("sendButton");
    this.backBtn = document.querySelector('.btn-back');
    this.apiKey = "c72690ed51af4420bdaf0855f32c3447";
    this.model = "gpt-4o";
    this.init();
  }

  init() {
    this.sendBtn.addEventListener("click", () => this.handleUserInput());
    this.input.addEventListener("keydown", e => e.key === "Enter" && this.handleUserInput());
    this.backBtn?.addEventListener('click', () => this.goBack());

    // Пример кнопки выбора в чате
    this.addChoiceButton("Открыть чат с проблемой", {
      photo: "/media/images/static/ethalon-front.png",
      title: "Неубранное рабочее место",
    });
  }

  addChoiceButton(label, options) {
    const btn = document.createElement("button");
    btn.classList.add("chat-choice-btn");
    btn.textContent = label;
    this.chat.appendChild(btn);
    this.chat.scrollTop = this.chat.scrollHeight;

    btn.addEventListener("click", () => {
      this.addMessage(label, "user");
      this.showProblemPopup(options);
      btn.remove();
    });
  }

  showProblemPopup({ photo, title, onFixed, onCallTeam }) {
    const popup = document.createElement("div");
    popup.classList.add("problem-popup");
    Object.assign(popup.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#333",
      color: "#fff",
      padding: "20px",
      borderRadius: "10px",
      zIndex: 1000
    });

    const img = document.createElement("img");
    img.src = photo || "/media/images/static/default.png";

    const h3 = document.createElement("h3");
    h3.textContent = title || "Проблема";
    h3.style.marginBottom = "15px";

    const btnFixed = document.createElement("button");
    btnFixed.textContent = "Проблема исправлена";
    btnFixed.addEventListener("click", () => { onFixed?.(); popup.remove(); });

    const btnCall = document.createElement("button");
    btnCall.textContent = "Вызвать бригаду";
    btnCall.addEventListener("click", () => { onCallTeam?.(); popup.remove(); });

    popup.append(img, h3, btnFixed, btnCall);
    document.body.appendChild(popup);
  }

  async handleUserInput() {
    const text = this.input.value.trim();
    if (!text) return;
    this.addMessage(text, "user");
    this.input.value = "";
    this.sendBtn.disabled = true;

    try {
      const botText = await this.callAIMLAPI(text);
      this.addMessage(botText, "bot");
    } catch (err) {
      console.error(err);
      this.addMessage("Ошибка связи с API", "bot");
    }

    this.sendBtn.disabled = false;
  }

  addMessage(text, type) {
    const msg = document.createElement("div");
    msg.classList.add("message", type);
    msg.textContent = text;
    this.chat.appendChild(msg);
    this.chat.scrollTop = this.chat.scrollHeight;
  }

  async callAIMLAPI(userText) {
    const url = "https://api.aimlapi.com/chat/completions";
    const body = {
      model: this.model,
      messages: [{ role: "user", content: userText }],
      max_tokens: 512,
      stream: false
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${this.apiKey}` },
      body: JSON.stringify(body)
    });

    if (!resp.ok) throw new Error(`API ошибка ${resp.status}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || "Нет ответа от API";
  }

  goBack() {
    const pageHistory = JSON.parse(sessionStorage.getItem('pageHistory')) || [];
    if (pageHistory.length > 0) {
      const prev = pageHistory.pop();
      sessionStorage.setItem('pageHistory', JSON.stringify(pageHistory));
      window.location.href = prev;
    } else {
      window.location.href = '/main.html';
    }
  }
}

new ChatPage();
