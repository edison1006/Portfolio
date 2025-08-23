import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Plus, Check, Trash2, Pause, Play, RotateCcw, Clock, Pencil, Search, FlameKindling, Calendar, Tag, Filter, X, Github, Download, Upload, Layout } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

const uid = () => Math.random().toString(36).slice(2,9)
const todayKey = () => new Date().toISOString().slice(0,10)

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch { return initial }
  })
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)) } catch {} }, [key, state])
  return [state, setState]
}

export default function App(){
  // theme
  const [dark, setDark] = useLocalStorage('po.theme', true)
  useEffect(() => {
    const root = document.documentElement
    if (dark) root.classList.add('dark'); else root.classList.remove('dark')
    document.body.classList.toggle('dark', dark)
  }, [dark])

  // tasks
  const [tasks, setTasks] = useLocalStorage('po.tasks', [
    { id: uid(), title: 'Finish React crash project', done: false, priority: 'high', due: todayKey(), tags: ['react', 'study'], createdAt: Date.now() },
    { id: uid(), title: '30-min English practice', done: true, priority: 'medium', due: todayKey(), tags: ['english'], createdAt: Date.now()-86400000 },
  ])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [tempTask, setTempTask] = useState(null)

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matches = t.title.toLowerCase().includes(query.toLowerCase()) || (t.tags||[]).some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      const byFilter = filter === 'all' ? true : filter === 'active' ? !t.done : t.done
      return matches && byFilter
    })
  }, [tasks, query, filter])

  const toggleTask = id => setTasks(ts => ts.map(t => t.id===id ? { ...t, done: !t.done } : t))
  const deleteTask = id => setTasks(ts => ts.filter(t => t.id !== id))
  const addTask = title => {
    if (!title.trim()) return
    const t = { id: uid(), title: title.trim(), done: false, priority: 'medium', due: todayKey(), tags: [], createdAt: Date.now() }
    setTasks(ts => [t, ...ts]); toast.success('Task added')
  }

  // quick add
  const [newTitle, setNewTitle] = useState('')
  const onQuickAdd = e => { e.preventDefault(); addTask(newTitle); setNewTitle('') }

  // edit
  const openEdit = task => { setEditingId(task.id); setTempTask({ ...task, tagsText: (task.tags||[]).join(', ') }) }
  const closeEdit = () => { setEditingId(null); setTempTask(null) }
  const saveEdit = () => {
    setTasks(ts => ts.map(t => t.id===editingId ? { ...t, ...tempTask, tags: (tempTask.tagsText||'').split(',').map(s=>s.trim()).filter(Boolean) } : t))
    toast.success('Task updated'); closeEdit()
  }

  // pomodoro
  const [workMins, setWorkMins] = useLocalStorage('po.work', 25)
  const [breakMins, setBreakMins] = useLocalStorage('po.break', 5)
  const [isRunning, setIsRunning] = useState(false)
  const [isWork, setIsWork] = useLocalStorage('po.isWork', true)
  const [secondsLeft, setSecondsLeft] = useLocalStorage('po.seconds', workMins*60)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!isRunning) return
    timerRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1){
          clearInterval(timerRef.current)
          const next = !isWork
          setIsWork(next)
          const nextSecs = (next ? workMins : breakMins)*60
          toast(next ? 'Work session' : 'Break time', { description: next ? 'Focus!' : 'Stretch & hydrate' })
          return nextSecs
        }
        return s-1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [isRunning, isWork, workMins, breakMins, setIsWork])

  const resetTimer = () => { setIsRunning(false); setSecondsLeft((isWork?workMins:breakMins)*60) }
  useEffect(() => { setSecondsLeft((isWork?workMins:breakMins)*60) }, [workMins, breakMins, isWork])

  const mm = String(Math.floor(secondsLeft/60)).padStart(2,'0')
  const ss = String(secondsLeft%60).padStart(2,'0')

  // habits & stats
  const [habits, setHabits] = useLocalStorage('po.habits', { Read: {}, Code: {}, Workout: {} })
  const toggleHabit = (name, dateKey) => setHabits(hs => ({ ...hs, [name]: { ...(hs[name]||{}), [dateKey]: !(hs[name]?.[dateKey]) } }))
  const last7 = [...Array(7)].map((_,i)=>{ const d=new Date(); d.setDate(d.getDate()-(6-i)); return d.toISOString().slice(0,10) })
  const stats = last7.map(day => ({
    day: day.slice(5),
    completed: tasks.filter(t => new Date(t.createdAt).toISOString().slice(0,10)===day && t.done).length,
    created: tasks.filter(t => new Date(t.createdAt).toISOString().slice(0,10)===day).length,
  }))
  const completedToday = useMemo(() => tasks.filter(t => t.done && t.due===todayKey()).length, [tasks])
  const progressPct = useMemo(() => {
    const todays = tasks.filter(t => t.due===todayKey())
    const done = todays.filter(t => t.done).length
    return todays.length ? Math.round((done/todays.length)*100) : 0
  }, [tasks])

  // notes
  const [notes, setNotes] = useState(()=>localStorage.getItem('po.notes')||'')
  useEffect(()=>{ localStorage.setItem('po.notes', notes) }, [notes])

  // Data Panel (GitHub)
  const [ghUser, setGhUser] = useState('octocat')
  const [ghLoading, setGhLoading] = useState(false)
  const [ghData, setGhData] = useState(null)
  const fetchGitHub = async (u) => {
    try{
      setGhLoading(true)
      const [user, repos] = await Promise.all([
        fetch(`https://api.github.com/users/${u}`).then(r=>r.json()),
        fetch(`https://api.github.com/users/${u}/repos?per_page=10&sort=updated`).then(r=>r.json())
      ])
      setGhData({ user, repos })
      toast.success('Fetched GitHub data')
    }catch(err){
      toast.error('GitHub request failed')
    }finally{ setGhLoading(false) }
  }

  // Kanban Board
  const [board, setBoard] = useLocalStorage('po.board', {
    columns: {
      backlog: { id: 'backlog', title: 'Backlog', taskIds: [] },
      progress: { id: 'progress', title: 'In Progress', taskIds: [] },
      done: { id: 'done', title: 'Done', taskIds: [] },
    },
    columnOrder: ['backlog','progress','done']
  })

  // Sync board with tasks (ensure all task ids exist in some column)
  useEffect(() => {
    const allIds = new Set(Object.values(board.columns).flatMap(c => c.taskIds))
    const missing = tasks.map(t=>t.id).filter(id => !allIds.has(id))
    if (missing.length) {
      setBoard(b => ({
        ...b,
        columns: {
          ...b.columns,
          backlog: { ...b.columns.backlog, taskIds: [...missing, ...b.columns.backlog.taskIds] }
        }
      }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks])

  function onDragEnd(result){
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    const start = board.columns[source.droppableId]
    const finish = board.columns[destination.droppableId]
    if (start === finish){
      const newTaskIds = Array.from(start.taskIds)
      newTaskIds.splice(source.index, 1)
      newTaskIds.splice(destination.index, 0, draggableId)
      const newCol = { ...start, taskIds: newTaskIds }
      setBoard(b => ({ ...b, columns: { ...b.columns, [newCol.id]: newCol } }))
      return
    }
    const startTaskIds = Array.from(start.taskIds)
    startTaskIds.splice(source.index, 1)
    const newStart = { ...start, taskIds: startTaskIds }
    const finishTaskIds = Array.from(finish.taskIds)
    finishTaskIds.splice(destination.index, 0, draggableId)
    const newFinish = { ...finish, taskIds: finishTaskIds }
    setBoard(b => ({ ...b, columns: { ...b.columns, [newStart.id]: newStart, [newFinish.id]: newFinish } }))

    // if moved to 'done', mark task done
    if (finish.id === 'done'){
      setTasks(ts => ts.map(t => t.id===draggableId ? { ...t, done: true } : t))
    }
  }

  // export/import JSON
  function exportAll(){
    const data = { tasks, habits, notes, board }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `productivity-os-export-${todayKey()}.json`
    a.click(); URL.revokeObjectURL(url)
  }
  function importAll(file){
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result)
        if (obj.tasks) setTasks(obj.tasks)
        if (obj.habits) setHabits(obj.habits)
        if (typeof obj.notes === 'string') localStorage.setItem('po.notes', obj.notes), setNotes(obj.notes)
        if (obj.board) setBoard(obj.board)
        toast.success('Imported data')
      } catch { toast.error('Invalid JSON') }
    }
    reader.readAsText(file)
  }

  // tabs
  const [tab, setTab] = useState('dashboard')

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-white to-muted/40 dark:from-neutral-950 dark:to-neutral-900 px-4 py-6 md:px-8 text-neutral-900 dark:text-neutral-100">
      <Toaster richColors position="top-right" />
      {/* Top Bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 pb-6">
        <div className="flex items-center gap-3">
          <FlameKindling className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold">Productivity OS Pro</h1>
          <span className="badge ml-2">React • Tailwind • Motion • Recharts • DnD</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full border px-3 py-1">
            <span className="text-sm opacity-80">Pomodoro</span>
            <input className="input h-7 w-14 text-center" type="number" value={workMins} onChange={e=>setWorkMins(Math.max(1, Number(e.target.value)||25))} />
            <span className="opacity-60">/</span>
            <input className="input h-7 w-14 text-center" type="number" value={breakMins} onChange={e=>setBreakMins(Math.max(1, Number(e.target.value)||5))} />
            <span className="opacity-60">min</span>
          </div>
          <button className="btn-outline" onClick={()=>setDark(d => !d)}>{dark ? <Moon className="h-5 w-5"/> : <Sun className="h-5 w-5"/>}</button>
          <button className="btn-outline" onClick={exportAll}><Download className="h-4 w-4"/> Export</button>
          <label className="btn-outline cursor-pointer">
            <Upload className="h-4 w-4"/> Import
            <input type="file" accept="application/json" onChange={e=>e.target.files[0] && importAll(e.target.files[0])} className="hidden" />
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto mb-6 max-w-6xl flex flex-wrap gap-2">
        <button onClick={()=>setTab('dashboard')} className={`btn-outline ${tab==='dashboard' ? 'bg-muted' : ''}`}>Dashboard</button>
        <button onClick={()=>setTab('kanban')} className={`btn-outline ${tab==='kanban' ? 'bg-muted' : ''}`}><Layout className="h-4 w-4"/> Kanban</button>
        <button onClick={()=>setTab('data')} className={`btn-outline ${tab==='data' ? 'bg-muted' : ''}`}>Data Panel</button>
        <button onClick={()=>setTab('notes')} className={`btn-outline ${tab==='notes' ? 'bg-muted' : ''}`}>Notes</button>
      </div>

      {tab === 'dashboard' && (
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Left column */}
          <div className="col-span-1 lg:col-span-2 space-y-6">
            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold flex items-center gap-2"><Clock className="h-5 w-5"/> Today Overview</div>
                <div className="w-48">
                  <div className="progress"><span style={{ width: `${progressPct}%` }} /></div>
                  <div className="mt-1 text-right text-xs opacity-70">{progressPct}% of today's tasks</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border p-4">
                  <div className="text-xs opacity-60">Completed Today</div>
                  <div className="text-2xl font-bold">{completedToday}</div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="text-xs opacity-60">Focus Mode</div>
                  <div className="flex items-center gap-2 text-2xl font-bold">{isWork ? 'Work' : 'Break'} <Clock className="h-5 w-5"/></div>
                  <div className="text-sm opacity-70">{mm}:{ss}</div>
                  <div className="mt-2 flex gap-2">
                    <button className="btn" onClick={()=>setIsRunning(v=>!v)}>{isRunning ? <><Pause className="h-4 w-4"/> Pause</> : <><Play className="h-4 w-4"/> Start</>}</button>
                    <button className="btn-outline" onClick={resetTimer}><RotateCcw className="h-4 w-4"/> Reset</button>
                  </div>
                </div>
                <div className="rounded-2xl border p-4">
                  <div className="text-xs opacity-60">Quick Add</div>
                  <form onSubmit={onQuickAdd} className="mt-1 flex gap-2">
                    <input className="input" placeholder="New task..." value={newTitle} onChange={e=>setNewTitle(e.target.value)} />
                    <button className="btn" type="submit"><Plus className="h-4 w-4"/> Add</button>
                  </form>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M2 12h6"/><path d="M2 5h6"/><path d="M2 19h6"/></svg>
                  Task Manager
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 opacity-60"/>
                    <input className="input w-48 pl-8" placeholder="Search tasks/tags" value={query} onChange={e=>setQuery(e.target.value)} />
                  </div>
                  <div className="relative">
                    <button className="btn-outline flex items-center gap-1"><Filter className="h-4 w-4"/> {filter}</button>
                    <div className="mt-1 flex gap-2 text-xs opacity-70">
                      <button className={`badge ${filter==='all'?'bg-muted':''}`} onClick={()=>setFilter('all')}>All</button>
                      <button className={`badge ${filter==='active'?'bg-muted':''}`} onClick={()=>setFilter('active')}>Active</button>
                      <button className={`badge ${filter==='done'?'bg-muted':''}`} onClick={()=>setFilter('done')}>Done</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-2">
                <AnimatePresence initial={false}>
                  {filtered.map(t => (
                    <motion.div key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      className={`flex items-center justify-between rounded-xl border p-3 ${t.done ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <button className={`btn ${t.done ? 'opacity-70' : ''} h-8 w-8`} onClick={()=>toggleTask(t.id)}><Check className="h-4 w-4"/></button>
                        <div>
                          <div className="font-medium">{t.title}</div>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs opacity-70">
                            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3"/> {t.due}</span>
                            <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3"/> {t.priority}</span>
                            <div className="flex flex-wrap gap-1">
                              {(t.tags||[]).map(tag => <span key={tag} className="badge">#{tag}</span>)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="btn-outline" onClick={()=>openEdit(t)}><Pencil className="h-4 w-4"/> Edit</button>
                        <button className="btn-outline" onClick={()=>{ deleteTask(t.id); toast('Deleted') }}><Trash2 className="h-4 w-4"/> Delete</button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {filtered.length === 0 && <div className="rounded-lg border border-dashed p-6 text-center text-sm opacity-70">No tasks found.</div>}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <div className="card p-4">
              <div className="text-lg font-semibold flex items-center gap-2"><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='2'><path d='M3 3v18h18'/><path d='M19 19c-4 0-7-3-7-7'/></svg> 7-Day Activity</div>
              <div className="h-48 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="created" strokeWidth={2} />
                    <Line type="monotone" dataKey="completed" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-4">
              <div className="text-lg font-semibold mb-3 flex items-center gap-2"><Github className="h-5 w-5"/> GitHub Data Panel</div>
              <div className="flex gap-2 items-center">
                <input className="input w-64" placeholder="GitHub username" value={ghUser} onChange={e=>setGhUser(e.target.value)} />
                <button className="btn" onClick={()=>fetchGitHub(ghUser)} disabled={ghLoading}>{ghLoading ? 'Loading...' : 'Fetch'}</button>
              </div>
              {ghData && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border p-3">
                    <div className="font-medium">{ghData.user.name||ghData.user.login} <span className="opacity-70 text-sm">({ghData.user.login})</span></div>
                    <div className="text-sm opacity-80">{ghData.user.bio||'No bio'}</div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 max-h-64 overflow-auto pr-1">
                    {ghData.repos?.map(r => (
                      <a key={r.id} href={r.html_url} target="_blank" rel="noreferrer" className="rounded-xl border p-3 hover:bg-muted">
                        <div className="font-medium">{r.name}</div>
                        <div className="text-xs opacity-70">{r.description||'No description'}</div>
                        <div className="text-xs opacity-60 mt-1">★ {r.stargazers_count} • {r.language||'n/a'}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === 'kanban' && (
        <div className="mx-auto max-w-6xl card p-5">
          <div className="text-lg font-semibold mb-3 flex items-center gap-2"><Layout className="h-5 w-5"/> Drag-and-Drop Kanban</div>
          <div className="text-sm opacity-70 mb-2">拖动任务卡片在列之间移动；拖到「Done」会自动勾选完成。</div>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {board.columnOrder.map(colId => {
                const col = board.columns[colId]
                const items = col.taskIds.map(id => tasks.find(t => t.id === id)).filter(Boolean)
                return (
                  <div key={col.id} className="rounded-2xl border p-3 bg-white/60 dark:bg-neutral-900/50">
                    <div className="font-semibold mb-2">{col.title} <span className="badge ml-2">{items.length}</span></div>
                    <Droppable droppableId={col.id}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[200px] space-y-2">
                          {items.map((t, idx) => (
                            <Draggable key={t.id} draggableId={t.id} index={idx}>
                              {(prov, snapshot) => (
                                <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                                  className={`rounded-xl border p-3 bg-white dark:bg-neutral-800 ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}`}>
                                  <div className="font-medium">{t.title}</div>
                                  <div className="mt-1 text-xs opacity-70 flex gap-2">
                                    <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3"/> {t.due}</span>
                                    <span className="inline-flex items-center gap-1"><Tag className="h-3 w-3"/> {t.priority}</span>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        </div>
      )}

      {tab === 'data' && (
        <div className="mx-auto max-w-4xl card p-5">
          <div className="text-lg font-semibold mb-3 flex items-center gap-2"><Github className="h-5 w-5"/> GitHub Data Panel</div>
          <div className="flex gap-2 items-center">
            <input className="input w-64" placeholder="GitHub username" value={ghUser} onChange={e=>setGhUser(e.target.value)} />
            <button className="btn" onClick={()=>fetchGitHub(ghUser)} disabled={ghLoading}>{ghLoading ? 'Loading...' : 'Fetch'}</button>
          </div>
          {ghData && (
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border p-3">
                <div className="font-medium">{ghData.user.name||ghData.user.login} <span className="opacity-70 text-sm">({ghData.user.login})</span></div>
                <div className="text-sm opacity-80">{ghData.user.bio||'No bio'}</div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {ghData.repos?.map(r => (
                  <a key={r.id} href={r.html_url} target="_blank" rel="noreferrer" className="rounded-xl border p-3 hover:bg-muted">
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs opacity-70">{r.description||'No description'}</div>
                    <div className="text-xs opacity-60 mt-1">★ {r.stargazers_count} • {r.language||'n/a'}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'notes' && (
        <div className="mx-auto max-w-3xl card p-5">
          <div className="text-lg font-semibold mb-3">Quick Notes</div>
          <textarea className="min-h-[300px] w-full rounded-xl border bg-white dark:bg-neutral-900 p-3 outline-none" placeholder="Jot down ideas, meeting notes, English phrases..." value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          >
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-md card p-4">
              <div className="text-lg font-semibold mb-2">Edit Task</div>
              {tempTask && (
                <div className="space-y-3">
                  <div>
                    <div className="text-sm mb-1">Title</div>
                    <input className="input" value={tempTask.title} onChange={e=>setTempTask({...tempTask, title:e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-sm mb-1">Priority</div>
                      <select className="input" value={tempTask.priority} onChange={e=>setTempTask({...tempTask, priority:e.target.value})}>
                        <option>low</option><option>medium</option><option>high</option>
                      </select>
                    </div>
                    <div>
                      <div className="text-sm mb-1">Due Date</div>
                      <input className="input" type="date" value={tempTask.due} onChange={e=>setTempTask({...tempTask, due:e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm mb-1">Tags (comma separated)</div>
                    <input className="input" value={tempTask.tagsText} onChange={e=>setTempTask({...tempTask, tagsText:e.target.value})} placeholder="react, study, work" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border p-2">
                    <span className="text-sm opacity-70">Completed</span>
                    <input type="checkbox" checked={!!tempTask.done} onChange={e=>setTempTask({...tempTask, done:e.target.checked})} />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button className="btn-outline" onClick={closeEdit}><X className="h-4 w-4"/> Cancel</button>
                    <button className="btn" onClick={saveEdit}><Check className="h-4 w-4"/> Save</button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mx-auto mt-8 max-w-6xl pb-4 text-center text-xs opacity-60">
        Built with ❤️ React + Tailwind + Framer Motion + Recharts + @hello-pangea/dnd. Data persists via localStorage. Export/Import supported.
      </footer>
    </div>
  )
}
