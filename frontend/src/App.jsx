import { useState, useEffect } from 'react'
import "prismjs/themes/prism-tomorrow.css"
import Editor from "react-simple-code-editor"
import prism from "prismjs"
import Markdown from "react-markdown"
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import axios from 'axios'
import './App.css'

function App() {
  const [ code, setCode ] = useState(` function sum() {
  return 1 + 1
}`)

  const [ review, setReview ] = useState("")
  const [ loading, setLoading ] = useState(false)
  const [ theme, setTheme ] = useState('dark')
  const [ activeTab, setActiveTab ] = useState('editor')
  const [ isMobile, setIsMobile ] = useState(typeof window !== 'undefined' ? window.innerWidth <= 900 : false)

  useEffect(() => {
    prism.highlightAll()
  }, [])

  useEffect(() => {
    // Re-highlight markdown/code when review content updates
    prism.highlightAll()
  }, [review])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth <= 900) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  async function reviewCode() {
    try {
      setLoading(true)
      const trimmed = (code || '').trim()
      if (!trimmed) {
        setReview('Please add some code to review.')
        return
      }

      const response = await axios.post('http://localhost:3000/ai/get-review', { code: trimmed })
      const data = response?.data
      let text
      if (typeof data === 'string') {
        text = data
      } else if (data && typeof data === 'object') {
        if (data.review) text = String(data.review)
        else if (data.message) text = String(data.message)
        else if (data.error) text = `Error: ${String(data.error)}`
        else text = '``````\n' + JSON.stringify(data, null, 2) + '\n``````'
      } else {
        text = 'No content received.'
      }
      setReview(text)
    } catch (e) {
      const msg = e?.response?.data || e?.message || 'Unknown error'
      setReview(`⚠️ Request failed. ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`)
    } finally {
      setLoading(false)
      setActiveTab('review')
    }
  }

  return (
    <>
      <header className="app-header">
        <div className="brand">
          <span className="dot" />
          <h1>CodeLike</h1>
          <span className="sub">AI Code Review</span>
        </div>
        <div className="toolbar">
          <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>
      {loading && <div className="top-progress" />}
      <main className="app-main">
        {(!isMobile || activeTab === 'editor') && (
        <div className="left panel">
          <div className="panel-title">Editor</div>
          <div className="code">
            <Editor
              value={code}
              onValueChange={code => setCode(code)}
              highlight={code => prism.highlight(code, prism.languages.javascript, "javascript")}
              padding={16}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 15,
                border: "none",
                outline: "none",
                height: "100%",
                width: "100%",
                background: "transparent"
              }}
            />
          </div>
          <button
            onClick={reviewCode}
            className="review-btn"
            disabled={loading}
          >{loading ? 'Reviewing…' : 'Review'}</button>
        </div>
        )}
        {(!isMobile || activeTab === 'review') && (
        <div className="right panel">
          <div className="panel-title">Review</div>
          <Markdown
            rehypePlugins={[ rehypeHighlight ]}
          >{review || "Start by typing code on the left, then click Review to get AI feedback."}</Markdown>
        </div>
        )}
      </main>
      {isMobile && (
        <footer className="mobile-nav">
          <button
            className={"nav-btn" + (activeTab === 'editor' ? ' active' : '')}
            onClick={() => setActiveTab('editor')}
          >✏️ Editor</button>
          {activeTab === 'editor' ? (
            <button
              className="primary-action"
              onClick={reviewCode}
              disabled={loading}
            >{loading ? 'Reviewing…' : 'Review'}</button>
          ) : (
            <button
              className="primary-action secondary"
              onClick={() => setActiveTab('editor')}
            >Edit</button>
          )}
          <button
            className={"nav-btn" + (activeTab === 'review' ? ' active' : '')}
            onClick={() => setActiveTab('review')}
          >🗒️ Review</button>
        </footer>
      )}
    </>
  )
}

export default App
