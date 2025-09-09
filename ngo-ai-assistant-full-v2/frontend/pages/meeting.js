import { useState } from 'react';
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function Meeting(){
  const [text,setText] = useState('Agenda: recruit volunteers for heritage project\nNext steps: contact local museum');
  const [res,setRes] = useState(null);

  const submit = async () => {
    const r = await fetch(`${BACKEND}/api/meeting/summarize`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({text})
    });
    const data = await r.json();
    setRes(data);
  };

  return (<main style={{padding:24}}>
    <h2>Summarize Meeting</h2>
    <textarea value={text} onChange={e=>setText(e.target.value)} rows={8} style={{width:'100%',maxWidth:720}}/>
    <br/><button onClick={submit}>Summarize</button>
    {res && <div style={{marginTop:16}}>
      <h3>Summary</h3>
      <pre style={{whiteSpace:'pre-wrap'}}>{res.summary}</pre>
      <h4>Actions</h4>
      <ul>{res.actions?.map((a,i)=>(<li key={i}>{a}</li>))}</ul>
    </div>}
  </main>);
}
