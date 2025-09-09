import { useState } from 'react';
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export default function PostGen(){
  const [topic,setTopic] = useState('Community cleanup this September — call for volunteers');
  const [platform,setPlatform] = useState('LinkedIn');
  const [tone,setTone] = useState('friendly');
  const [length,setLength] = useState('short');
  const [res,setRes] = useState(null);

  const submit = async () => {
    const r = await fetch(`${BACKEND}/api/generate_post`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({topic, platform, tone, length})
    });
    const data = await r.json();
    setRes(data);
  };

  return (<main style={{padding:24}}>
    <h2>Generate Social Post</h2>
    <input value={topic} onChange={e=>setTopic(e.target.value)} style={{width:'100%',maxWidth:720}}/>
    <div style={{display:'flex',gap:8,margin:'8px 0'}}>
      <input value={platform} onChange={e=>setPlatform(e.target.value)} placeholder="LinkedIn"/>
      <input value={tone} onChange={e=>setTone(e.target.value)} placeholder="professional"/>
      <input value={length} onChange={e=>setLength(e.target.value)} placeholder="short|medium|long"/>
    </div>
    <button onClick={submit}>Generate</button>
    {res && <div style={{marginTop:16}}>
      <h3>Draft</h3>
      <pre style={{whiteSpace:'pre-wrap'}}>{res.content}</pre>
    </div>}
  </main>);
}
