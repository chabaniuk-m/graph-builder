import langPacks from "./assets/data/languages.js"
import {
  addNameFromID,
  hidePopup,
  isDigit,
  isNameAlreadyPresent,
  numberInputHandler,
  popupMessage,
  saveName
} from "./lib/utils.js";

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
function saveWeight(useInput, edgeID) {
  console.log(`Saving the weight ${useInput} on ${edgeID}`)
  let weight = NaN
  let inputEl = document.getElementById(edgeID)
  log(inputEl)
  if (isNaN(useInput) || useInput.length === 0) {
    weight = 0
    inputEl.value = '0'
  } else if (useInput.includes('.') ||
             useInput.includes('e')) {
    weight = parseFloat(useInput)
    if (`${weight}` !== useInput) {
      inputEl.value = `${weight}`
      if (`${weight}`.includes("Infinity")) {
        inputEl.cols = 7
      }
    }
  } else {
    weight = parseInt(useInput, 10)
    if (weight > Number.MAX_SAFE_INTEGER ||
        weight < Number.MIN_SAFE_INTEGER) {
      inputEl.value = `${weight}`
    }
  }
  let arr = edgeID.substring(0, edgeID.length - 2).split("-")
  let id1 = parseInt(arr[0])
  let id2 = parseInt(arr[1])
  graph.nodes.find(node => node.id === id1).pointsTo.find(node => node.id === id2).weight = weight
  if (!graph.directed)
    graph.nodes.find(node => node.id === id2).pointsTo.find(node => node.id === id1).weight = weight
}

export let langPack = langPacks["ua"]
export let graph = {
  directed: false,
  weighted: false,
  nodes: [],
}
let language = "ua",
  nodeNumber = 0,
  isDirected = false,
  isWeighted = false,
  activeNodeID = -1,
  boardHeight = boardEl.getBoundingClientRect().height,
  boardWidth = boardEl.getBoundingClientRect().width
const { log } = console,
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
  nodeNumber = 0
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

let ctrlDown = false

document.addEventListener("keydown", event => event.key === "Control" ? ctrlDown = true : undefined)
document.addEventListener("keyup", event => event.key === "Control" ? ctrlDown = false : undefined)

function addName(nodeEl) {
  console.log("Adding the name...")
  console.log(nodeEl.innerHTML)
  let isTextArea = false
  if (nodeEl.children.length > 0) {
    console.log(`The tag name of the children is ${nodeEl.children[0].tagName}`)
    if (nodeEl.children[0].tagName === "TEXTAREA") {
      console.log("It is a text area!")
      nodeEl.children[0].focus()
      isTextArea = true
    }
  }
  if (!isTextArea) {
    let name = nodeEl.innerText.replace("\n", "")
    console.log(`Inner text is ${name}`)
    nodeEl.innerText = ""
    let nameInputEl = document.createElement("textarea")
    nameInputEl.classList.add("name")
    nameInputEl.value = name
    nameInputEl.rows = 1
    nameInputEl.cols = 2
    nodeEl.appendChild(nameInputEl)
    nameInputEl.focus()
    console.log(`Input element is of ${nameInputEl.cols} cols`)
    // nameInputEl.addEventListener("click", event => event.target.selectionStart = event.target.selectionEnd = event.target.value.length)
    // nameInputEl.addEventListener("focusin", event => event.preventDefault())
    nameInputEl.addEventListener("focusout", event => saveName(event.target))
    nameInputEl.addEventListener("keydown", event => {
      let key = event.key
      let val = event.target.value
      let save = true
      console.log(key)
      if (["Shift", "Control", "Alt", "Command"].includes(key)) {
        event.preventDefault()
        return
      }
      if (key.length === 1 && key.toUpperCase() !== key.toLowerCase() ||
          ["\"", "'"].includes(key)) {
        // letter
      } else if (isDigit(key)) {
        if (val.length === 0) {
          popupMessage(langPack["vertex-name-digit-text"], 2000)
          save = false
        }
      } else if (key === " ") {
        if (val.length === 0) {
          popupMessage(langPack["vertex-name-space-text"], 2000)
          save = false
        }
      } else if (key === "_") {
        popupMessage(langPack["vertex-name-space-text"])
        save = false
      } else if (key === "-") {
        if (val.length === 0) {
          popupMessage(langPack["vertex-name-dash-text"], 2000)
          save = false
        }
      } else if (key === "`") {
        popupMessage(langPack["vertex-name-backtick-text"], 2000)
        save = false
      } else if (key === "Enter") {
        event.preventDefault()
        event.target.blur()
        console.log("Preventing default behavior and returning")
        return
      } else if (key === "Backspace") {
        console.log(`Backspace is pressed: val is "${val}" is Control Down = ${ctrlDown}`)
        hidePopup()
        if (event.target.cols > 2) {
          event.target.cols = event.target.cols - 1
          if (val.length <= 4)
            if (event.target.classList.contains("up"))
              event.target.classList.remove("up")
        }
        if (ctrlDown && !val.includes(" ")) {
          event.target.cols = 2
          if (event.target.classList.contains("up"))
            event.target.classList.remove("up")
        }
        return
      } else if (key === "Tab") {
        return
      } else if (val.length === 35) {
        popupMessage(langPack["vertex-name-length-text"].replace("${}", `${35}`), 2000)
        save = false
      } else {
        save = false
        popupMessage(langPack["vertex-name-incorrect-symbol-text"], 1000)
      }

      if (!save) {
        event.preventDefault()
      } else {
        log(`Adding the symbol to the end, length = ${val.length}, cols = ${event.target.cols}`)
        if (isNameAlreadyPresent(val + key)) {
          event.target.classList.add("warning")
          popupMessage(langPack["name-is-already-present-text"], 1500)
        } else {
          if (event.target.classList.contains("warning"))
            event.target.classList.remove("warning")
          hidePopup()
        }
        if (val.length - 1 >= event.target.cols) {
          console.log("Adding one col")
          event.target.cols = event.target.cols + 1
          if (!event.target.classList.contains("up"))
            event.target.classList.add("up")
        }
      }
    })
  }
}

let coordinates = {x: -100, y: -100}
let isMouseDown = false
let moveNode = null
let enableMovingTimer
let edgesToMove = []
let supportiveNodes = []

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
  nodeEl.classList.add('node')
  nodeEl.classList.add('collapse')
  nodeEl.style.left = `${x - nodeRadius}px`
  nodeEl.style.top = `${y - nodeRadius}px`
  nodeEl.addEventListener("mousedown", (event) => {
    isMouseDown = true
    coordinates = {x: event.offsetX, y: event.offsetY}
    enableMovingTimer = setTimeout(() => {
      moveNode = event.target
      moveNode.classList.add("move")
      let node = graph.nodes.find(node => node.id == moveNode.id)
      node.x = -100
      node.y = -100
      // init list of edges to also move
      if (graph.directed) {
        for (const n of node.pointsTo) {
          edgesToMove.push(document.getElementById(`${node.id}-${n.id}`))
          let nod = graph.nodes.find(nd => nd.id == n.id)
          let x2 = nod.x
          let y2 = nod.y
          supportiveNodes.push({ x2, y2 })
        }
        for (const n of graph.nodes)
          if (n.id != node.id)
            for (const edge of n.pointsTo)
              if (edge.id == node.id) {
                console.log(JSON.stringify(n))
                edgesToMove.push(document.getElementById(`${n.id}-${node.id}`))
                let x1 = n.x
                let y1 = n.y
                supportiveNodes.push({ x1, y1 })
              }
      } else
        for (const n of node.pointsTo) {
          let edge = document.getElementById(`${node.id}-${n.id}`)
          let nod = graph.nodes.find(nd => nd.id == n.id)
          if (edge) {
            edgesToMove.push(edge)
            let x2 = nod.x
            let y2 = nod.y
            supportiveNodes.push({ x2, y2 })
          } else {
            edgesToMove.push(document.getElementById(`${n.id}-${node.id}`))
            let x1 = nod.x;
            let y1 = nod.y;
            supportiveNodes.push({ x1, y1 })
          }
        }
    }, 200);
    console.log(JSON.stringify(coordinates))
  })
  nodeEl.addEventListener("mouseup", (event) => {
    clearTimeout(enableMovingTimer)
    if (coordinates.x === event.offsetX && coordinates.y === event.offsetY) {
      if (ctrlDown) {
        addName(nodeEl)
      } else {
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
      }
    }
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
  addNameFromID(node.id)

  return nodeEl
}

function isComplementary(from, to) {
  let toNode = graph.nodes.find(node => node.id == to)
  let fromNode = toNode.pointsTo.find(node => node.id == from)
  return fromNode !== undefined
}

function drawEdge(x1, y1, x2, y2, id1, id2, weight = 1) {
  log(`Adding edge (${x1}, ${y1}) ${isDirected ? '' : '<'}-> (${x2}, ${y2})`)
  const lineEl = document.createElement("div")
  lineEl.id = `${id1}-${id2}`
  const length = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  lineEl.style.width = `${length - 2 * nodeRadius - 2.5}px`
  lineEl.style.left = `${(x1 + x2) / 2.0 + 1.7}px`
  lineEl.style.top = `${(y1 + y2) / 2.0 + 1}px`
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
    arrowEl.style.right = `0`
    arrowEl.style.top = `-${arrowHalfHeight}px`
    arrowEl.addEventListener("dblclick", () => removeLine(lineEl))
    arrowEl.addEventListener("click", event => {
      if (graph.directed) {
        event.target.parentNode.children[1].focus()
      }
    })
    lineEl.appendChild(arrowEl)
  }
  lineEl.addEventListener("click", event => {
    if (graph.weighted) {
      if (graph.directed) {
        event.target.children[1].focus()
      } else {
        event.target.children[0].focus()
      }
    }
  })
  lineEl.addEventListener("dblclick", (event) => removeLine(event.target))
  lineEl.classList.add("edge")
  boardEl.appendChild(lineEl)
  if (graph.weighted) {
    const weightInputEl = document.createElement("textarea")
    weightInputEl.classList.add("weight")
    weightInputEl.style.minHeight = `0.9rem`
    weightInputEl.id = `${lineEl.id}-w`
    weightInputEl.rows = 1
    weightInputEl.cols = 2
    weightInputEl.innerText = weight
    console.log(`Angel of the edge is ${angel}`)
    let complementary = graph.directed && isComplementary(id1, id2)

    if (angel > Math.PI / 2) {
      if (complementary) {
        weightInputEl.style.transform = "rotate(180deg) translateY(110%)"
      } else {
        weightInputEl.style.transform = "rotate(180deg) translateY(-10%)"
      }
    } else if (complementary) {
      weightInputEl.style.transform = "translateY(10%)"
    }
    weightInputEl.addEventListener("keydown", numberInputHandler)
    weightInputEl.addEventListener("focusin", event => event.target.selectionStart = event.target.selectionEnd = event.target.value.length)
    weightInputEl.addEventListener("focusout", (event) => {
      saveWeight(event.target.value.replaceAll(" ", ''), event.target.id)
    })
    lineEl.appendChild(weightInputEl)
    weightInputEl.focus();
  }
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

let boardCoordinates = {x: -100, y: -100}

function isProperPositionOnBoard(x, y) {
  return x > 13 && y > 13 &&
      x < boardWidth - 13 && y < boardHeight - 13 &&
      notCollideWithOthers(x, y)
}

boardEl.addEventListener("mousedown", event => {
  if (event.target.id === "board") {
    boardCoordinates = {x: event.offsetX, y: event.offsetY}
    console.log(JSON.stringify(boardCoordinates))
  }
})
boardEl.addEventListener("mousemove", event => {
  if (isMouseDown && event.target.id === "board") {
    // move node and adjacent nodes
    if (isMouseDown) {
      console.log(JSON.stringify(edgesToMove))
      console.log(JSON.stringify(supportiveNodes))
      console.log({x: event.offsetX, y: event.offsetY})
      let x = event.offsetX
      let y = event.offsetY
      if (isProperPositionOnBoard(x, y)) {
        moveNode.style.top = `${y - nodeRadius}px`
        moveNode.style.left = `${x - nodeRadius}px`
      }
    }
  }
})
boardEl.addEventListener("mouseup", event => {
  if (boardCoordinates.x === event.offsetX && boardCoordinates.y === event.offsetY) {
    if (event.target.id === "board") {
      const x = event.offsetX
      const y = event.offsetY
      log(`Click on board: x=${x}, y=${y}`)
      if (isProperPositionOnBoard(x, y)) {
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
  } else {
    clearTimeout(enableMovingTimer)
    if (moveNode !== null) {
      if (moveNode.classList.contains("move"))
        moveNode.classList.remove("move")
      let x = event.offsetX
      let y = event.offsetY
      let node = graph.nodes.find(node => node.id == moveNode.id)
      node.x = x;
      node.y = y;
      moveNode = null
    }
    isMouseDown = false
    edgesToMove = []
    supportiveNodes = []
    console.log(JSON.stringify({x: event.offsetX, y: event.offsetY}))
  }
})
