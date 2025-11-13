    class ChatPage {
      constructor() {
        this.chat = document.getElementById("chatMessages");
        this.input = document.getElementById("userInput");
        this.sendBtn = document.getElementById("sendButton");
        this.init();
      }

      init() {
        this.sendBtn.addEventListener("click", () => this.handleUserInput());
        this.input.addEventListener("keydown", (e) => {
          if (e.key === "Enter") this.handleUserInput();
        });
      }

      handleUserInput() {
        const text = this.input.value.trim();
        if (!text) return;

        this.addMessage(text, "user");
        this.input.value = "";
        this.sendBtn.disabled = true; // блокируем кнопку пока бот отвечает

        setTimeout(() => {
          this.addMessage(this.generateBotResponse(text), "bot");
          this.sendBtn.disabled = false;
        }, 600);
      }

      addMessage(text, type) {
        const msg = document.createElement("div");
        msg.classList.add("message", type);
        msg.textContent = text;
        this.chat.appendChild(msg);
        this.chat.scrollTop = this.chat.scrollHeight;
      }

      generateBotResponse(text) {
        const responses = {
          "привет": "Привет! Чем могу помочь?",
          "как дела": "Отлично! А у тебя?",
          "что ты умеешь": "Я пока тестовая версия, но скоро научусь отвечать умнее 😊",
        };
        const lower = text.toLowerCase();
        return responses[lower] || "Интересно! Расскажи подробнее 🤔";
      }
    }

    new ChatPage();