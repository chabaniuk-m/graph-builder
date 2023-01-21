const boardEl = document.getElementById("board")


let nodeNumber = 0,
isDirected = false,
graph = [],
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

function drawNode(x, y) {
  node = {
    id: nodeNumber++,
    x,
    y,
    pointsTo: []
  }
  graph.push(node)
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
      const from = graph.find(node => node.id === activeNodeID)
      const to = graph.find(node => node.id == event.target.id)
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
    graph = graph.filter(node => {
      node.pointsTo = node.pointsTo.filter(to => to.id != el.id)
      return node.id != el.id
    })
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
  const angel = Math.acos((v2[0]) * 1.0 / Math.sqrt(Math.pow(v2[0], 2) + Math.pow(v2[1], 2)))
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
    let node = graph.find(node => node.id == from)
    log(`${from} -> ${to} (${JSON.stringify(node)})`)
    node.pointsTo = node.pointsTo.filter(x => x.id != to)
    if (!isDirected) {
      node = graph.find(node => node.id == to)
      node.pointsTo = node.pointsTo.filter(x => x.id != from)
    }
    log(JSON.stringify(graph))
  })
  lineEl.classList.add("edge")
  lineEl.id = `${id1}-${id2}`
  boardEl.appendChild(lineEl)
}

function notCollideWithOthers(x, y) {
  for (const node of graph) {
    const dist = Math.sqrt(Math.pow(node.x - x, 2) + Math.pow(node.y - y, 2))
    log(`Distance between current (${x}, ${y}) and (${node.x}, ${node.y}) is ${dist}`)
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
      const nodeEl = drawNode(x, y)
      setTimeout(() => {
        nodeEl.classList.remove("collapse")
      }, 10);
    }
  }
})

boardEl.addEventListener("dblclick", () => log("double click on board"))
