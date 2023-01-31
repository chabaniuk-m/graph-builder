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

export function isDigit(char) {
  return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(char)
}

// TEST
const numberEl = document.getElementById("number")
numberEl.addEventListener("keydown", (event) => {
  const key = event.key
  const val = event.target.value
  if (key === " ") {
    if (parseInt(event.target.cols, 10) + 2 === val.length)
      event.target.cols = parseInt(event.target.cols, 10) + 1
    return
  } else if (["Tab", "r", "Alt", "Capslock", "Meta", "Shift", "Control", "Delete", "PageUp", "ArrowRight", "End", "PageDown"].includes(key))
    return
  event.preventDefault()
  let save = true
  let removeWarning = true
  let valWithoutSpaces = val.replaceAll(" ", "")
  console.log(`current value is ${val}, possible updated: ${val + key} = ${parseFloat(valWithoutSpaces + key)}`)
  let length = valWithoutSpaces.length
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
      if (a > Number.MAX_VALUE ||
          a < Number.MIN_VALUE ||
          a === 0) {
        if (a !== 0) {
          event.target.classList.add("warning")
          removeWarning = false
        }
        popupMessage(langPack["number-out-of-bound-text"].replace("${}", `${number}`))
      }
    } else if (length > 14) {
      if (valWithoutSpaces.includes('.') || key === '.') {
        // float
        if (length >= 20) {
          popupMessage(langPack["number-input-length-restriction-text"])
          save = false
        }
      } else if (valWithoutSpaces[0] === '-') {
        // negative integer
        if (length === 17) {
          save = false
          popupMessage(langPack["negative-int-restriction-text"])
        } else if (length === 16) {
          console.log("check if number is not too big")
          let number = parseInt(valWithoutSpaces + key)
          if (number < Number.MIN_SAFE_INTEGER) {
            popupMessage(langPack["number-underflow-text"].replace("${}", "-9 007 199 254 740 991"))
            event.target.classList.add("warning")
            removeWarning = false
          }
        }
      } else {
        // positive integer
        if (length === 15) {
          console.log("check if number is not too big")
          let number = parseInt(valWithoutSpaces + key)
          if (number > Number.MAX_SAFE_INTEGER) {
            popupMessage(langPack["number-overflow-text"].replace("${}", "9 007 199 254 740 991"))
            event.target.classList.add("warning")
            removeWarning = false
          }
        } else {
          save = false
          popupMessage(langPack["positive-int-restriction-text"])
        }
      }

    }
    if (save) {
      console.log("Input is correct number")
      if (parseInt(event.target.cols, 10) + 2 === val.length)
        event.target.cols = parseInt(event.target.cols, 10) + 1
      event.target.value += key
      if (isNaN(parseFloat(event.target.value)))
        event.target.classList.add("warning")
      else if(removeWarning && event.target.classList.contains("warning"))
        event.target.classList.remove("warning")
    }
  } else if (key === "Backspace") {
    event.target.value = val ? val.substring(0, val.length - 1) : ""
    if (parseInt(event.target.cols, 10) > 2)
      event.target.cols = parseInt(event.target.cols, 10) - 1
    if (event.target.classList.contains("warning"))
      event.target.classList.remove("warning")
    if (isNaN(parseFloat(event.target.value)) || length < 2)
      if (!event.target.classList.contains("warning"))
        event.target.classList.add("warning")
  } else if (key === "Enter") {
    if (!val.includes(".") && !val.includes("e")) {
      let weight = parseInt(val, 10)
      weight = weight > Number.MAX_SAFE_INTEGER ? Number.MAX_SAFE_INTEGER : weight;
      console.log(`User have entered an integer ${weight}`)
    }
    // TODO: remove focus and save the weight
  } else if (["ArrowLeft", "Home"].includes(key)) {
    popupMessage(langPack["cursor-moving-is-forbidden-text"], 2000)
  } else {
    popupMessage(langPack["enter-correct-number-text"], 1500)
    console.log(`Incorrect symbol in number input: ${key}`)
  }
})


let language = "ua",
  langPack = langPacks["ua"],
  nodeNumber = 0,
  isDirected = false,
  isWeighted = false,
  graph = {
    directed: false,
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
  propsEl.style.opacity = "0.6";
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
  const length = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  lineEl.style.width = `${length}px`
  lineEl.style.left = `${(x1 + x2) / 2.0}px`
  lineEl.style.top = `${(y1 + y2) / 2.0}px`
  const v1 = [1, 0]
  const v2 = [x2 - x1, y2 - y1]
  const angel = Math.acos((v2[0]) / Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2)))
  lineEl.style.transform = `translate(-50%) rotate(${y2 > y1 ? angel : -angel}rad)`
  
  // add an arrow
  if (isDirected) {
    const arrowEl = document.createElement("span")
    arrowEl.classList.add("arrow")
    arrowEl.innerText = '>'
    arrowEl.style.right = `${nodeRadius}px`
    arrowEl.style.top = `-${arrowHalfHeight}px`
    // arrowEl.style.transform = `rotate(${y2 > y1 ? angel : -angel}rad)`
    lineEl.appendChild(arrowEl)
  }
  lineEl.addEventListener("dblclick", (event) => {
    const id = event.target.id
    boardEl.removeChild(event.target)
    const [from, to] = id.split('-')
    let node = graph.nodes.find(node => node.id == from)
    log(`${from} -> ${to} (${JSON.stringify(node)})`)
    node.pointsTo = node.pointsTo.filter(x => x.id != to)
    if (!isDirected) {
      node = graph.nodes.find(node => node.id == to)
      node.pointsTo = node.pointsTo.filter(x => x.id != from)
    }
    log(JSON.stringify(graph))
  })
  lineEl.classList.add("edge")
  lineEl.id = `${id1}-${id2}`
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
      }
      const nodeEl = drawNode(x, y)
      setTimeout(() => {
        nodeEl.classList.remove("collapse")
      }, 10);
    }
  }
})
