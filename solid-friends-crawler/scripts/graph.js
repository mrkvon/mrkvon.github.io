graph = (function (d3) {

  var canvas = document.querySelector("canvas"),
      context = canvas.getContext("2d"),
      width = canvas.width,
      height = canvas.height;

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink()
        .id(function(d) { return d.id; })
        .strength(1.1))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

  const graph = {
    nodes: [],
    links: [],
    add({ nodes=[], links=[] }) {
      nodes.forEach(node => this.nodes.push(node));
      links.forEach(link => this.links.push(link));
      simulation.nodes(this.nodes)
        .alphaTarget(1)
        .restart()
    },
    /*
    removeNode(id) {
      console.log(this.links)
      this.links = this.links.filter(link => {
        return !(link.source.id === id || link.target.id === id)
      })
      console.log(this.links.length)
      this.nodes = this.nodes.filter(node => !(node.id === id))

      simulation.nodes(this.nodes)
        .alphaTarget(1)
        .restart()
    }
    */
  }

  simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

  simulation.force("link")
      .links(graph.links);

  function ticked() {
    context.clearRect(0, 0, width, height);

    context.beginPath();
    graph.links.forEach(drawLink);
    context.strokeStyle = '#aaa2';
    context.stroke();

    // context.beginPath();
    graph.nodes.forEach(node => {
      drawNode({ ...node, ...graph.detailNodes[node.id] })
    });
  }

  function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
  }

  function drawNode(d) {
    context.beginPath();
    context.moveTo(d.x + 3, d.y);
    context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
    context.fillStyle = (!d.processed)
      ? 'lightblue'
      : (d.error) ? 'red' : 'blue';
    context.fill();
    context.strokeStyle = context.fillStyle;
    context.stroke();
  }

  $('#add-node').click(() => {
    graph.add({
      nodes: [{ id: graph.nodes.length }],
      links: [{ source: graph.nodes.length, target: graph.nodes.length - 1 }]
    })
  });

  return graph
}(d3))
