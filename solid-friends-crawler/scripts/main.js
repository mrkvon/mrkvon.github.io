(function ($, solid, $rdf, graph) {
  const FOAF = $rdf.Namespace('http://xmlns.com/foaf/0.1/');

  const popupUri = 'popup.html';

  $('#login button').click(() => solid.auth.popupLogin({ popupUri }));
  $('#logout button').click(() => solid.auth.logout());

  solid.auth.trackSession(session => {
    const loggedIn = !!session;
    $('#login').toggle(!loggedIn);
    $('#logout').toggle(loggedIn);
    if (session) {
      $('#user').text(session.webId);
      if (!$('#profile').val())
        $('#profile').val(session.webId);
    }
  })

  $('#view').click(() => {
    const initialId = $('#profile').val();
    bfs(initialId, graph, FOAF);
  })

}($, solid, $rdf, graph))

/**
 * perform a breadth-first search
 * @param {string} initialId - webId of the person to start crawling
 * @param {object} graph - object which will be updated with the found nodes
 */
async function bfs(initialId, graph, FOAF) {
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  const queue = [initialId];
  const processing = {};
  graph.detailNodes = processing;

  processing[initialId] = { processed: false, error: false };
  graph.add({ nodes: [{ id: initialId }] })

  while (queue.length > 0) {
    const idToProcess = queue.shift();
    try {
      await fetcher.load(idToProcess);
      // find friends of the current id
      const friends = store.each($rdf.sym(idToProcess), FOAF('knows'))
      // add found nodes to graph if they're not existent already
      const nodesToAdd = friends
        .map(friend => friend.value)
        .filter(id => !processing.hasOwnProperty(id))
        .map(id => ({ id }))
      const linksToAdd = friends.map(friend => ({ source: idToProcess, target: friend.value }))
      // add found links to graph
      graph.add({ nodes: nodesToAdd, links: linksToAdd })

      // add found nodes to queue if they're not in processing already
      nodesToAdd.forEach(node => queue.push(node.id))
      // change processed node to processed: true
      processing[idToProcess].processed = true

      // add found nodes to processing with processed: false, error: false
      nodesToAdd.forEach(node => { processing[node.id] = { processed: false, error: false } })
    } catch (e) {
      processing[idToProcess].processed = true
      processing[idToProcess].error = true
      // graph.removeNode(idToProcess)
    }
  }
}
