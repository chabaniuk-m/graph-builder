const boardEl = document.getElementById("board")


let nodeNumber = 0,
isDirected = false,
graph = [],
activeNodeID = -1,
boardHeight = boardEl.getBoundingClientRect().height,
boardWidth = boardEl.getBoundingClientRect().width
const { log } = console,
letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
nodeRadius = 0.7 * 16

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
      log(`to is ${JSON.stringify(to)}`)
      // edge already exists
      if (from.pointsTo.find(node => node.id == to.id) ||
          !isDirected && to.pointsTo.find(node => node.id == from.id)) {
        log("Edge already exists")
      } else {
        log(`Adding edge (${from.x}, ${from.y}) ${isDirected ? '' : '<'}-> (${to.x}, ${to.y})`)
        from.pointsTo.push({id: to.id, weight: 1})
        if (!isDirected)
          to.pointsTo.push({id: from.id, weight: 1})
        log(JSON.stringify(graph))
      }
      document.getElementById(`${activeNodeID}`).classList.remove("active")
      activeNodeID = -1
    }
    log(`ActiveID is ${activeNodeID}`)
  })
  boardEl.appendChild(nodeEl)

  return nodeEl
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
