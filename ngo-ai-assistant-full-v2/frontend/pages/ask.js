import { useState } from 'react';
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function Ask(){
  const [q,setQ] = useState('What is Heritage Preservation NGO?');
  const [res,setRes] = useState(null);

  const submit = async () => {
    const r = await fetch(`${BACKEND}/api/ask`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({query:q})
    });
    const data = await r.json();
    setRes(data);
  };

  return (<main style={{padding:24}}>
    <h2>RAG Chatbot</h2>
    <textarea value={q} onChange={e=>setQ(e.target.value)} rows={4} style={{width:'100%',maxWidth:720}}/>
    <br/><button onClick={submit}>Ask</button>
    {res && <div style={{marginTop:16}}>
      <h3>Answer</h3>
      <pre style={{whiteSpace:'pre-wrap'}}>{res.answer}</pre>
      <h4>Citations</h4>
      <ul>{res.citations?.map((c,i)=>(<li key={i}><em>{c.snippet}</em> — <strong>{c.source}</strong></li>))}</ul>
    </div>}
  </main>);
}
