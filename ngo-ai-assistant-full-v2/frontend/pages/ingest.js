import { useState } from 'react';
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function Ingest(){
  const [url,setUrl] = useState('https://example.org');
  const [text,setText] = useState('');
  const [res,setRes] = useState(null);

  const submit = async () => {
    const r = await fetch(`${BACKEND}/api/ingest`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({url, text})
    });
    const data = await r.json();
    setRes(data);
  };

  return (<main style={{padding:24}}>
    <h2>Ingest Documents</h2>
    <input value={url} onChange={e=>setUrl(e.target.value)} style={{width:'100%',maxWidth:720}}/>
    <p>Or paste text:</p>
    <textarea value={text} onChange={e=>setText(e.target.value)} rows={6} style={{width:'100%',maxWidth:720}}/>
    <br/><button onClick={submit}>Ingest</button>
    {res && <pre>{JSON.stringify(res,null,2)}</pre>}
  </main>);
}
