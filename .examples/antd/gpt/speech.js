// 兼容处理
const __SpeechRecognition = window.SpeechRecognition ?? window.webkitSpeechRecognition;

class SpeechRec extends __SpeechRecognition {
  // 识别成功的钩子函数
  onResult(fn) {
    this.addEventListener("result", fn);
  }

  // 识别结束的钩子函数
  onEnd(fn) {
    this.addEventListener("end", fn);
  }

  onSpeechStart(fn) {
    this.addEventListener('speechstart', fn)
  }

  onSpeechEnd(fn) {
    this.addEventListener('speechend', fn)
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/SpeechRecognition
  setSettings(settings) {
    const { grammars: grammarStrs, lang, interimResults, maxAlternatives, continuous } = settings

    if (grammarStrs) {
      const grammars = new SpeechGrammarList()
      grammarStrs.map((str) => {
        grammars.addFromString(str, 1)
      })
      this.grammars = grammars
    }

    if (lang) {
      this.lang = lang
    }

    if (interimResults) {
      this.interimResults = interimResults
    }

    if (maxAlternatives) {
      this.maxAlternatives = maxAlternatives
    }

    if (continuous) {
      this.continuous = continuous
    }
  }
}

const speechRec = new SpeechRec()
speechRec.setSettings({
  continuous: true,// 多次识别语音
  interimResults: true,// 在识别过程中是否允许更新识别的结果
  lang: "zh-CN",// 语言
})

export function createSspeechRecorder({
  // 说话过程中内容变化，用于展示文本
  onChange,
  // 说了一段话结束，注意，此时服务并没有结束，可以继续说话
  onEnd,
}) {
  speechRec.onResult((event) => {
    const text = Array.from(event.results).map(result => result[0].transcript)
      .join('')
      .trim()
    onChange(text)
  })

  speechRec.onSpeechEnd(() => {
    onEnd?.()
  })

  speechRec.start()

  return speechRec
}
