export default function Home(){
  return (<main style={{padding:24}}>
    <h1>Heritage Preservation NGO — AI Assistant</h1>
    <p>Demo: RAG Q&A, Social Post Generator, Meeting Summarizer, FAQ Management</p>
    <ul>
      <li><a href="/ask">RAG Chatbot</a></li>
      <li><a href="/ingest">Ingest Docs</a></li>
      <li><a href="/post">Generate Social Post</a></li>
      <li><a href="/meeting">Summarize Meeting</a></li>
      <li><a href="/admin/faqs">Admin: FAQs</a></li>
    </ul>
  </main>);
}
