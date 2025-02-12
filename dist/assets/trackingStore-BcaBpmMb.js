import{c as s,b as c}from"./index-B7KjazUN.js";import{p as o,c as d}from"./middleware-KG2kbvz9.js";/**
 * @license lucide-react v0.344.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=s("Search",[["circle",{cx:"11",cy:"11",r:"8",key:"4ej97u"}],["path",{d:"m21 21-4.3-4.3",key:"1qie3q"}]]),S=c()(o(n=>({entries:[],addEntry:e=>n(t=>({entries:[{...e,id:Date.now()},...t.entries]})),deleteEntry:e=>n(t=>({entries:t.entries.filter(r=>r.id!==e)})),deleteEntriesForCamper:e=>n(t=>({entries:t.entries.filter(r=>r.camperId!==e)})),deleteAllEntries:()=>n({entries:[]}),deleteEntriesByLeader:e=>n(t=>({entries:t.entries.filter(r=>{const i=window.campStore.getState().campers.find(a=>a.id===r.camperId);return(i==null?void 0:i.leader)!==e})})),deleteEntriesByInstitution:e=>n(t=>({entries:t.entries.filter(r=>{const i=window.campStore.getState().campers.find(a=>a.id===r.camperId);return(i==null?void 0:i.institution)!==e})}))}),{name:"tracking-storage",version:1,storage:d(()=>localStorage)}));export{p as S,S as u};
