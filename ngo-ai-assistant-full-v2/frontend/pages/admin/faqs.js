import { useEffect, useState } from 'react';
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function AdminFAQs(){
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [q, setQ] = useState('How to become a volunteer?');
  const [a, setA] = useState('You can apply on our website or email info@heritage-ngo.org.');

  const load = async () => {
    const p = await fetch(`${BACKEND}/api/faqs?approved=false`).then(r=>r.json());
    const ap = await fetch(`${BACKEND}/api/faqs?approved=true`).then(r=>r.json());
    setPending(p); setApproved(ap);
  };

  useEffect(()=>{load();},[]);

  const propose = async () => {
    await fetch(`${BACKEND}/api/faqs/propose`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({question:q, answer:a})
    });
    setQ(''); setA('');
    load();
  };

  const approve = async (id) => {
    await fetch(`${BACKEND}/api/faqs/approve`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id, approved:true})
    });
    load();
  };

  return (<main style={{padding:24}}>
    <h2>Admin — FAQs</h2>
    <section style={{marginBottom:24}}>
      <h3>Propose FAQ</h3>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Question" style={{width:'100%',maxWidth:720}}/>
      <textarea value={a} onChange={e=>setA(e.target.value)} rows={3} placeholder="Answer" style={{width:'100%',maxWidth:720}}/>
      <br/><button onClick={propose}>Submit</button>
    </section>

    <section style={{marginBottom:24}}>
      <h3>Pending Approval</h3>
      <ul>
        {pending.map(item=> (<li key={item.id}>
          <strong>Q:</strong> {item.question}<br/>
          <strong>A:</strong> {item.answer}<br/>
          <button onClick={()=>approve(item.id)}>Approve</button>
        </li>))}
      </ul>
    </section>

    <section>
      <h3>Approved</h3>
      <ul>
        {approved.map(item=> (<li key={item.id}>
          <strong>Q:</strong> {item.question}<br/>
          <strong>A:</strong> {item.answer}
        </li>))}
      </ul>
    </section>
  </main>);
}
