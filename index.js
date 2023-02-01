import langPacks from "./assets/data/languages.js"

const boardEl = document.getElementById("board")
const propsEl = document.querySelector(".board-con > .props")
const weightBtnEl = document.querySelector(".weighted-con button")
const directedBtnEl = document.querySelector(".directed-con button")
const languageEl = document.getElementById("language")

// TEMPORARY
console.log(`Max positive integer len: ${('' + Number.MAX_SAFE_INTEGER).length}, the number is ${Number.MAX_SAFE_INTEGER}`)
console.log(`Max negative integer len: ${('' + Number.MIN_SAFE_INTEGER).length}, the number is ${Number.MIN_SAFE_INTEGER}`)
console.log(`Max positive number len: ${('' + Number.MAX_VALUE).length}, the number is ${Number.MAX_VALUE}`)
console.log(`Max negative number len: ${('' + Number.MIN_VALUE).length}, the number is ${Number.MIN_VALUE}`)

function download(filename, text) {
  let element = document.createElement("a")
  element.style.display = "none"
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text))
  element.setAttribute("download", filename)
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}

document.getElementById("download-btn").addEventListener("click", (event) => {
  let text = document.getElementById("text-val").value
  let filename = document.getElementById("filename").value

  download(filename, text)
}, false)

// UTILS
const popupEl = document.getElementById("popup")

let popupTimer;

export function popupMessage(message, time=3000) {
  clearTimeout(popupTimer)
  popupEl.innerHTML = `<p>${message}</p>`
  popupEl.classList.add("alert")
  popupTimer = setTimeout(() => {
    popupEl.classList.remove("alert")
  }, time)
}

export function hidePopup() {
  popupEl.classList.remove("alert")
  clearTimeout(popupTimer)
}

export function isDigit(str) {
  for (let i = 0; i < str.length; i++)
    if (!['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(str.charAt(i)))
      return false
  return str.length > 0
}

function numberInputHandler(event){
  let key = event.key
  const val = event.target.value
  console.log(`
  Processing keydown event:
  1) Type = ${event.type},
  2) Value = ${val},
  3) Key = ${key}
  `)
  if (key === " ") {
    if (parseInt(event.target.cols, 10) + 2 === val.length)
      event.target.cols = parseInt(event.target.cols, 10) + 1
    return
  } else if (["r", "Alt", "Capslock", "Meta", "Shift", "Control", "Delete", "PageUp", "ArrowRight", "End", "PageDown"].includes(key))
    return
  let save = true
  let removeWarning = true
  let valWithoutSpaces = val.replaceAll(" ", "")
  if (key === "Tab") {
    return
  }
  event.preventDefault()
  console.log(`current value is ${val}, possible updated: ${val + key} = ${parseFloat(valWithoutSpaces + key)}`)
  let length = valWithoutSpaces.length
  const checkIntegerInput = () => {
    console.log(`Checking the integer ${valWithoutSpaces} of length ${length}, additional key = '${key}'`)
    if (valWithoutSpaces[0] === '-') {
      console.log("Negative")
      // negative integer
      if (length === 17) {
        if (key !== '') {
          save = false
          popupMessage(langPack["negative-int-restriction-text"])
        } else {
          console.log("check if number is not too big")
          let number = parseInt(valWithoutSpaces + key)
          if (number < Number.MIN_SAFE_INTEGER) {
            popupMessage(langPack["number-underflow-text"].replace("${}", "-9 007 199 254 740 991"))
            event.target.classList.add("warning")
            removeWarning = false
          }
        }
      } else if (length === 16 && key !== '') {
        console.log("check if number is not too big")
        let number = parseInt(valWithoutSpaces + key)
        if (number < Number.MIN_SAFE_INTEGER) {
          popupMessage(langPack["number-underflow-text"].replace("${}", "-9 007 199 254 740 991"))
          event.target.classList.add("warning")
          removeWarning = false
        }
      }
    } else {
      console.log("Positive")
      // positive integer
      if (length === 15 && key !== '') {
        console.log("check if number is not too big")
        let number = parseInt(valWithoutSpaces + key)
        if (number > Number.MAX_SAFE_INTEGER) {
          popupMessage(langPack["number-overflow-text"].replace("${}", "9 007 199 254 740 991"))
          event.target.classList.add("warning")
          removeWarning = false
        }
      } else {
        if (key !== '') {
          save = false
          popupMessage(langPack["positive-int-restriction-text"])
        } else {
          console.log("check if number is not too big")
          let number = parseInt(valWithoutSpaces + key)
          if (number > Number.MAX_SAFE_INTEGER) {
            popupMessage(langPack["number-overflow-text"].replace("${}", "9 007 199 254 740 991"))
            event.target.classList.add("warning")
            removeWarning = false
          }
        }
      }
    }
  }
  if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '+', '.', 'e'].includes(key)) {
    if (key === '.' && (valWithoutSpaces.includes('.') || valWithoutSpaces === '-' || length === 0) ||
        key === 'e' && (valWithoutSpaces.includes('e') || length === 0 || isNaN(valWithoutSpaces.charAt(length - 1))) ||
        (key === '+' || key === '-') && (length >= 1 && valWithoutSpaces.charAt(length - 1) !== 'e')) {
      popupMessage(langPack["enter-correct-number-text"], 1500)
      save = false
    } else if (isDigit(key) && length > 0 && valWithoutSpaces.charAt(length - 1) === 'e') {
      save = false
      popupMessage(langPack["sign-after-e-text"], 2000)
    } else if ((valWithoutSpaces === '0' || valWithoutSpaces === '-0') && key !== '.') {
      save = false
    } else if (valWithoutSpaces.includes('e') || key === 'e') {
      // scientific notation
      console.log("Check scientific number")
      if (length >= 24) {
        popupMessage(langPack["number-scientific-notation-restriction-text"])
        save = false
      }
      let number = Math.abs(parseFloat(valWithoutSpaces))
      console.log(`value without key added = ${number}`)
      if (number > Number.MAX_VALUE ||
          number < Number.MIN_VALUE ||
          number === 0 || number === -0) {
        save = false
        removeWarning = false
      }
      number = parseFloat(valWithoutSpaces + key)
      let a = Math.abs(number)
      console.log(`value with key = ${number}`)
      if (length !== 24) {
        if (a > Number.MAX_VALUE ||
            a < Number.MIN_VALUE ||
            a === 0) {
          if ((valWithoutSpaces + key).includes('e')) {
            event.target.classList.add("warning")
            removeWarning = false
          }
          popupMessage(langPack["number-out-of-bound-text"].replace("${}", `${number}`))
        }
      } else {
        save = false
      }
    } else if (length > 14) {
      if (valWithoutSpaces.includes('.') || key === '.') {
        // float
        if (length >= 20) {
          popupMessage(langPack["number-input-length-restriction-text"])
          save = false
        }
      } else
        checkIntegerInput()

    }
    if (save) {
      console.log("Input is correct number")
      if (parseInt(event.target.cols, 10) + 2 === val.length)
        event.target.cols = parseInt(event.target.cols, 10) + 1
      event.target.value += key
      if (isNaN(parseFloat(event.target.value)))
        event.target.classList.add("warning")
      else if(removeWarning && event.target.classList.contains("warning")) {
        event.target.classList.remove("warning")
        hidePopup()
      }
    }
  } else if (key === "Backspace") {
    event.target.value = val ? val.substring(0, val.length - 1) : ""
    key = ''
    if (parseInt(event.target.cols, 10) > 2)
      event.target.cols = parseInt(event.target.cols, 10) - 1
    valWithoutSpaces = event.target.value.replaceAll(" ", "")
    length = valWithoutSpaces.length
    if (valWithoutSpaces.length > 14 &&
        isDigit(valWithoutSpaces.charAt(0) === '-' ?
            valWithoutSpaces.substring(1) : valWithoutSpaces)) {
      console.log("Checking for overflow")
      checkIntegerInput()
    }
    if (removeWarning) {
      hidePopup()
      if (event.target.classList.contains("warning")) {
        event.target.classList.remove("warning")
      }
    }
    if (isNaN(parseFloat(event.target.value)) || length < 2)
      if (!event.target.classList.contains("warning"))
        event.target.classList.add("warning")
  } else if (key === "Enter") {
    event.target.blur()
    saveWeight()
  } else if (["ArrowLeft", "Home"].includes(key)) {
    popupMessage(langPack["cursor-moving-is-forbidden-text"], 2000)
  } else {
    popupMessage(langPack["enter-correct-number-text"], 1500)
    console.log(`Incorrect symbol in number input: ${key}`)
  }
}

function saveWeight(useInput, edgeID) {
  console.log("Saving the weight...")
}


let language = "ua",
  langPack = langPacks["ua"],
  nodeNumber = 0,
  isDirected = false,
  isWeighted = false,
  graph = {
    directed: false,
    weighted: false,
    nodes: [],
  },
  activeNodeID = -1,
  boardHeight = boardEl.getBoundingClientRect().height,
  boardWidth = boardEl.getBoundingClientRect().width
const { log } = console,
  letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  nodeRadius = 0.7 * 16,
  arrowHalfHeight = 10

log(`Board size is: ${Math.round(boardWidth)}x${Math.round(boardHeight)}`)

window.addEventListener("resize", () => {
  boardHeight = boardEl.getBoundingClientRect().height
  boardWidth = boardEl.getBoundingClientRect().width
  log(`Board is resized: ${Math.round(boardWidth)}x${Math.round(boardHeight)}`)
})

languageEl.addEventListener("change", (event) => {
  language = languageEl.value
  log("Language is changed to " + language)
  langPack = langPacks[language]

  document.getElementById("draw-your-graph-text").innerText = langPack["draw-your-graph-text"]
  document.getElementById("choose-language-text").innerText = langPack["choose-language-text"]
  document.getElementById("weighted-label-text").innerText = langPack["weighted-label-text"][isWeighted ? 1 : 0]
  document.getElementById("directed-label-text").innerText = langPack["directed-label-text"][isDirected ? 1 : 0]
})

function disableProperties() {
  weightBtnEl.disabled = "true"
  directedBtnEl.disabled = "true"
  propsEl.style.opacity = "0.6"
}

function enableProperties() {
  weightBtnEl.disabled = ""
  directedBtnEl.disabled = ""
  propsEl.style.opacity = "1"
}

weightBtnEl.addEventListener("click", (event) => {
  if (event.target.classList.contains("active")) {
    isWeighted = false
    event.target.classList.remove("active")
  } else {
    isWeighted = true
    event.target.classList.add("active")
  }
  document.getElementById("weighted-label-text").innerText = langPack["weighted-label-text"][isWeighted ? 1 : 0]
})

directedBtnEl.addEventListener("click", (event) => {
  if (event.target.classList.contains("active")) {
    isDirected = false
    event.target.classList.remove("active")
  } else {
    isDirected = true
    event.target.classList.add("active")
  }
  document.getElementById("directed-label-text").innerText = langPack["directed-label-text"][isDirected ? 1 : 0]
})

function drawNode(x, y) {
  let node = {
    id: nodeNumber++,
    x,
    y,
    pointsTo: []
  }
  graph.nodes.push(node)
  log(`Node created ${JSON.stringify(node)}`)
  const nodeEl = document.createElement("div")
  nodeEl.id = node.id
  nodeEl.innerText = letters[node.id % 26]
  nodeEl.classList.add('node')
  nodeEl.classList.add('collapse')
  nodeEl.style.left = `${x - nodeRadius}px`
  nodeEl.style.top = `${y - nodeRadius}px`
  if (node.id >= 26) {
    const sub = document.createElement("sub")
    sub.innerText = Math.round(node.id / 26)
    nodeEl.appendChild(sub)
  }
  nodeEl.addEventListener("click", (event) => {
    if (activeNodeID === -1) {
      // there is no active node
      nodeEl.classList.add("active")
      activeNodeID = parseInt(nodeEl.id)
    } else if (activeNodeID == nodeEl.id) {
      // deactivate current node
      nodeEl.classList.remove("active")
      activeNodeID = -1
    } else {
      // add edge between active node and current node
      const from = graph.nodes.find(node => node.id === activeNodeID)
      const to = graph.nodes.find(node => node.id == event.target.id)
      // edge already exists
      if (from.pointsTo.find(node => node.id == to.id) ||
          !isDirected && to.pointsTo.find(node => node.id == from.id)) {
        log("Edge already exists")
      } else {
        from.pointsTo.push({id: to.id, weight: 1})
        if (!isDirected)
          to.pointsTo.push({id: from.id, weight: 1})
        drawEdge(from.x, from.y, to.x, to.y, from.id, to.id)
        log(JSON.stringify(graph))
      }
      document.getElementById(`${activeNodeID}`).classList.remove("active")
      activeNodeID = -1
    }
    log(`ActiveID is ${activeNodeID}`)
  })
  nodeEl.addEventListener("dblclick", (event) => {
    const el = event.target
    log(`removing child with id ${el.id}`)
    boardEl.removeChild(el)
    const edges = document.querySelectorAll('.edge')
    edges.forEach(edge => {
      const arr = edge.id.split('-')
      if (arr.includes(el.id))
        boardEl.removeChild(edge)
    })
    graph.nodes = graph.nodes.filter(node => {
      node.pointsTo = node.pointsTo.filter(to => to.id != el.id)
      return node.id != el.id
    })
    if (graph.nodes.length === 0)
      enableProperties()
    activeNodeID = -1
    log(JSON.stringify(graph))
  })
  boardEl.appendChild(nodeEl)

  return nodeEl
}

function drawEdge(x1, y1, x2, y2, id1, id2) {
  log(`Adding edge (${x1}, ${y1}) ${isDirected ? '' : '<'}-> (${x2}, ${y2})`)
  const lineEl = document.createElement("div")
  lineEl.id = `${id1}-${id2}`
  const length = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  lineEl.style.width = `${length}px`
  lineEl.style.left = `${(x1 + x2) / 2.0}px`
  lineEl.style.top = `${(y1 + y2) / 2.0}px`
  const v1 = [1, 0]
  const v2 = [x2 - x1, y2 - y1]
  const angel = Math.acos((v2[0]) / Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2)))
  lineEl.style.transform = `translate(-50%) rotate(${y2 > y1 ? angel : -angel}rad)`

  const removeLine = (target) => {
    const id = target.id
    boardEl.removeChild(target)
    const [from, to] = id.split('-')
    let node = graph.nodes.find(node => node.id == from)
    log(`${from} -> ${to} (${JSON.stringify(node)})`)
    node.pointsTo = node.pointsTo.filter(x => x.id != to)
    if (!isDirected) {
      node = graph.nodes.find(node => node.id == to)
      node.pointsTo = node.pointsTo.filter(x => x.id != from)
    }
    log(JSON.stringify(graph))
  }

  // add an arrow
  if (graph.directed) {
    console.log(`id1 = ${id1}, id2 = ${id2}`)
    const arrowEl = document.createElement("span")
    arrowEl.classList.add("arrow")
    arrowEl.innerText = '>'
    arrowEl.style.right = `${nodeRadius}px`
    arrowEl.style.top = `-${arrowHalfHeight}px`
    arrowEl.addEventListener("dblclick", () => removeLine(lineEl))
    lineEl.appendChild(arrowEl)
  }
  if (graph.weighted) {
    const weightInputEl = document.createElement("textarea")
    weightInputEl.classList.add("weight")
    weightInputEl.style.minHeight = `0.9rem`
    weightInputEl.id = `${lineEl.id}-w`
    weightInputEl.rows = 1
    weightInputEl.cols = 2
    weightInputEl.innerText = '1'
    console.log(`Angel of the edge is ${angel}`)
    if (angel > Math.PI / 2) {
      weightInputEl.style.transform = "rotate(180deg) translateY(-10%)";
    }
    weightInputEl.addEventListener("keydown", numberInputHandler)
    weightInputEl.addEventListener("focusout", (event) => {
      saveWeight(event.target.value.replaceAll(" ", ''), event.target.id)
    })
    lineEl.appendChild(weightInputEl)
  }
  lineEl.addEventListener("dblclick", (event) => removeLine(event.target))
  lineEl.classList.add("edge")
  boardEl.appendChild(lineEl)
}

function notCollideWithOthers(x, y) {
  for (const node of graph.nodes) {
    const dist = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2))
    if (dist < 2.4 * nodeRadius) {
      log("node collides with other")
      return false
    }
  }
  return true
}

boardEl.addEventListener("click", (event) => {
  if (event.target.id === "board") {
    const x = event.offsetX
    const y = event.offsetY
    log(`Click on board: x=${x}, y=${y}`)
    if (x > 13 && y > 13 && 
        x < boardWidth - 13 && y < boardHeight - 13 &&
        notCollideWithOthers(x, y)) {
      if (graph.nodes.length === 0) {
        disableProperties()
        graph.directed = isDirected
        graph.weighted = isWeighted
      }
      const nodeEl = drawNode(x, y)
      setTimeout(() => {
        nodeEl.classList.remove("collapse")
      }, 10);
    }
  }
})
