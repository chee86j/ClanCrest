export function checkIfRelativesConnectedWithoutPerson(datum, data_stash) {
  const r = datum.rels,
    r_ids = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(r_id => !!r_id),
    rels_not_to_main = [];

  for (let i = 0; i < r_ids.length; i++) {
    const line = findPersonLineToMain(data_stash.find(d => d.id === r_ids[i]), [datum])
    if (!line) {rels_not_to_main.push(r_ids[i]); break;}
  }
  return rels_not_to_main.length === 0;

  function findPersonLineToMain(datum, without_persons) {
    let line;
    if (isM(datum)) line = [datum]
    checkIfAnyRelIsMain(datum, [datum])
    return line

    function checkIfAnyRelIsMain(d0, history) {
      if (line) return
      history = [...history, d0];
      runAllRels(check);
      if (!line) runAllRels(checkRels);

      function runAllRels(f) {
        if (!d0) return // todo: check why this happens. test: click spouse and add spouse
        const r = d0.rels;
        [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])]
          .filter(d_id => (d_id && ![...without_persons, ...history].find(d => d.id === d_id)))
          .forEach(d_id => f(d_id));
      }

      function check(d_id) {
        if (isM(d_id)) line = history
      }

      function checkRels(d_id) {
        const person = data_stash.find(d => d.id === d_id)
        checkIfAnyRelIsMain(person, history)
      }
    }
  }
  function isM(d0) {return typeof d0 === 'object' ? d0.id === data_stash[0].id : d0 === data_stash[0].id}  // todo: make main more exact
}

export function checkIfConnectedToFirstPerson(datum, data_stash) {
  const first_person = data_stash[0]
  if (datum.id === first_person.id) return true

  const rels_checked = []
  let connected = false
  checkRels(datum)
  return connected

  function checkRels(d0) {
    if (connected) return
    const r = d0.rels
    const r_ids = [r.father, r.mother, ...(r.spouses || []), ...(r.children || [])].filter(r_id => !!r_id)
    r_ids.forEach(r_id => {
      if (rels_checked.includes(r_id)) return
      rels_checked.push(r_id)
      const person = data_stash.find(d => d.id === r_id)
      if (person.id === first_person.id) connected = true
      else checkRels(person)
    })
  }
}